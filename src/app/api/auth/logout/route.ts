import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { clearAuthCookies, revokeRefreshToken } from "@/lib/auth";
import { REFRESH_COOKIE } from "@/lib/jwt";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    refreshToken?: string;
    scope?: "token" | "family";
  };
  const presented = body.refreshToken ?? (await cookies()).get(REFRESH_COOKIE)?.value;

  if (presented) await revokeRefreshToken(presented, body.scope ?? "family");
  await clearAuthCookies();

  const url = new URL(request.url);
  if (url.searchParams.get("redirect") === "1") {
    return NextResponse.redirect(new URL("/", url), { status: 303 });
  }
  return NextResponse.json({ ok: true });
}
