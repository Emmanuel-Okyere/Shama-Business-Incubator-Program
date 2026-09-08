import "server-only";
import { cookies, headers } from "next/headers";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  ACCESS_COOKIE,
  ACCESS_TTL_SECONDS,
  REFRESH_COOKIE,
  REFRESH_TTL_SECONDS,
  cookieOptions,
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "@/lib/jwt";

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
  tokenType: "Bearer";
}

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

/* ------------------------------------------------------------ issuing */

function randomId() {
  return crypto.randomUUID();
}

/**
 * Mint an access/refresh pair and record the refresh token. `familyId` is
 * carried across rotations so a replayed token can revoke everything descended
 * from the same login.
 */
export async function issueTokens(
  user: SessionUser,
  opts: {
    familyId?: string;
    userAgent?: string | null;
    ip?: string | null;
    /** Retire this refresh-token row in the same transaction as the new one. */
    rotatesRecordId?: string;
  } = {},
): Promise<TokenPair> {
  const jti = randomId();
  const familyId = opts.familyId ?? randomId();

  const accessToken = await signAccessToken({
    sub: user.id,
    email: user.email,
    name: user.fullName,
    role: user.role,
  });
  const refreshToken = await signRefreshToken({ sub: user.id, jti, fid: familyId });

  const create = prisma.refreshToken.create({
    data: {
      jti,
      familyId,
      tokenHash: await hashToken(refreshToken),
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_TTL_SECONDS * 1000),
      userAgent: opts.userAgent?.slice(0, 300) ?? null,
      ip: opts.ip ?? null,
    },
  });

  if (opts.rotatesRecordId) {
    // Issue the replacement and retire its predecessor together, so a failure
    // can never leave two live tokens in one family.
    const [created] = await prisma.$transaction([
      create,
      prisma.refreshToken.update({
        where: { id: opts.rotatesRecordId },
        data: { revokedAt: new Date() },
      }),
    ]);
    await prisma.refreshToken.update({
      where: { id: opts.rotatesRecordId },
      data: { replacedById: created.id },
    });
  } else {
    await create;
  }

  return {
    accessToken,
    refreshToken,
    expiresIn: ACCESS_TTL_SECONDS,
    refreshExpiresIn: REFRESH_TTL_SECONDS,
    tokenType: "Bearer",
  };
}

export type RefreshResult =
  | { ok: true; user: SessionUser; tokens: TokenPair }
  | { ok: false; reason: "invalid" | "expired" | "revoked" | "reused" | "unknown_user" };

/**
 * Rotate a refresh token. The presented token is always retired; a token that
 * was already retired means replay, and the whole family is revoked.
 */
export async function rotateRefreshToken(
  presented: string,
  meta: { userAgent?: string | null; ip?: string | null } = {},
): Promise<RefreshResult> {
  const claims = await verifyRefreshToken(presented);
  if (!claims) return { ok: false, reason: "invalid" };

  const record = await prisma.refreshToken.findUnique({
    where: { jti: claims.jti },
    include: { user: true },
  });
  if (!record) return { ok: false, reason: "invalid" };

  if (record.revokedAt) {
    // Replay of a rotated token: assume the family is compromised.
    await prisma.refreshToken.updateMany({
      where: { familyId: record.familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { ok: false, reason: "reused" };
  }

  if (record.expiresAt.getTime() < Date.now()) {
    await prisma.refreshToken.update({
      where: { id: record.id },
      data: { revokedAt: new Date() },
    });
    return { ok: false, reason: "expired" };
  }

  if ((await hashToken(presented)) !== record.tokenHash) {
    return { ok: false, reason: "invalid" };
  }
  if (!record.user) return { ok: false, reason: "unknown_user" };

  const user: SessionUser = {
    id: record.user.id,
    email: record.user.email,
    fullName: record.user.fullName,
    role: record.user.role,
  };

  const tokens = await issueTokens(user, {
    familyId: record.familyId,
    rotatesRecordId: record.id,
    ...meta,
  });

  return { ok: true, user, tokens };
}

/** Revoke one refresh token, or every token in its family (a full sign-out). */
export async function revokeRefreshToken(presented: string, scope: "token" | "family" = "family") {
  const claims = await verifyRefreshToken(presented);
  if (!claims) return;

  if (scope === "token") {
    await prisma.refreshToken.updateMany({
      where: { jti: claims.jti, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return;
  }

  await prisma.refreshToken.updateMany({
    where: { familyId: claims.fid, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function revokeAllForUser(userId: string) {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

/* ---------------------------------------------------------- transport */

/**
 * Browser clients keep both JWTs in httpOnly cookies. That is the transport,
 * not the auth model: nothing server-side is looked up to identify the caller,
 * and the same tokens work as `Authorization: Bearer` for API clients that
 * would rather hold them themselves.
 */
export async function setAuthCookies(tokens: TokenPair) {
  const store = await cookies();
  store.set(ACCESS_COOKIE, tokens.accessToken, cookieOptions(tokens.expiresIn));
  store.set(REFRESH_COOKIE, tokens.refreshToken, cookieOptions(tokens.refreshExpiresIn));
}

export async function clearAuthCookies() {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

async function bearerToken(): Promise<string | null> {
  const header = (await headers()).get("authorization");
  if (!header?.toLowerCase().startsWith("bearer ")) return null;
  return header.slice(7).trim() || null;
}

/**
 * Identify the caller from the access token — Bearer header first (API
 * clients), then the cookie (browser). Purely a JWT signature check: no
 * database round-trip on the hot path.
 */
export async function getSession(): Promise<SessionUser | null> {
  const token = (await bearerToken()) ?? (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token) return null;

  const claims = await verifyAccessToken(token);
  if (!claims) return null;

  return {
    id: claims.sub,
    email: claims.email,
    fullName: claims.name,
    role: claims.role,
  };
}

const ADMIN_ROLES: Role[] = ["ADMIN", "SUPER_ADMIN"];

export function isAdmin(user: SessionUser | null): boolean {
  return Boolean(user && ADMIN_ROLES.includes(user.role));
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (!isAdmin(user)) throw new Error("FORBIDDEN");
  return user;
}

/* ------------------------------------------------------------- login */

export async function authenticate(
  email: string,
  password: string,
): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  // Always run a comparison so a missing account and a wrong password take
  // roughly the same time.
  const hash = user?.passwordHash ?? "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidiu";
  const ok = await verifyPassword(password, hash);
  if (!user || !ok) return null;

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  return { id: user.id, email: user.email, fullName: user.fullName, role: user.role };
}

/** Request metadata recorded against an issued refresh token. */
export async function requestMeta() {
  const h = await headers();
  return {
    userAgent: h.get("user-agent"),
    ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
  };
}
