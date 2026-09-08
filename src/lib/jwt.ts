/**
 * Token layer — plain JWTs, no server-side session objects.
 *
 * Access token   HS256, 15 minutes, stateless. Carries identity and role, and
 *                is the only thing checked on a normal request.
 * Refresh token  HS256, 30 days, and deliberately *not* stateless: each one is
 *                recorded (hashed) in the database so it can be rotated and
 *                revoked. Presenting a refresh token that has already been
 *                rotated away revokes its whole family — that is replay or
 *                theft, not a legitimate client.
 *
 * This module is edge-safe (jose + Web Crypto only) so middleware can verify
 * access tokens without touching the database.
 */

import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import type { Role } from "@prisma/client";

export const ACCESS_TTL_SECONDS = 60 * 15; // 15 minutes
export const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

export const ACCESS_COOKIE = "sbi_at";
export const REFRESH_COOKIE = "sbi_rt";

const ISSUER = "shama-business-incubator";
const AUDIENCE = "sbi-web";

export interface AccessClaims extends JWTPayload {
  sub: string;
  email: string;
  name: string;
  role: Role;
  typ: "access";
}

export interface RefreshClaims extends JWTPayload {
  sub: string;
  jti: string;
  fid: string;
  typ: "refresh";
}

function key(name: "AUTH_SECRET" | "AUTH_REFRESH_SECRET") {
  // The refresh secret falls back to AUTH_SECRET with a domain separator so a
  // single-variable deployment still cannot use an access token as a refresh
  // token, or the reverse.
  const value =
    process.env[name] ??
    (name === "AUTH_REFRESH_SECRET" ? `${process.env.AUTH_SECRET ?? ""}:refresh` : undefined);

  if (!value || value.length < 16) {
    throw new Error(
      `${name} must be set to a random string of at least 16 characters. Generate one with: openssl rand -base64 32`,
    );
  }
  return new TextEncoder().encode(value);
}

export async function signAccessToken(claims: {
  sub: string;
  email: string;
  name: string;
  role: Role;
}) {
  return new SignJWT({ ...claims, typ: "access" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TTL_SECONDS}s`)
    .sign(key("AUTH_SECRET"));
}

export async function signRefreshToken(claims: { sub: string; jti: string; fid: string }) {
  return new SignJWT({ ...claims, typ: "refresh" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setSubject(claims.sub)
    .setJti(claims.jti)
    .setIssuedAt()
    .setExpirationTime(`${REFRESH_TTL_SECONDS}s`)
    .sign(key("AUTH_REFRESH_SECRET"));
}

export async function verifyAccessToken(token: string): Promise<AccessClaims | null> {
  try {
    const { payload } = await jwtVerify<AccessClaims>(token, key("AUTH_SECRET"), {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    return payload.typ === "access" ? payload : null;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<RefreshClaims | null> {
  try {
    const { payload } = await jwtVerify<RefreshClaims>(token, key("AUTH_REFRESH_SECRET"), {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    return payload.typ === "refresh" ? payload : null;
  } catch {
    return null;
  }
}

/** SHA-256 of a token, hex encoded. Web Crypto so it also runs on the edge. */
export async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}
