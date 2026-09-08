import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { clearAuthCookies, requestMeta, rotateRefreshToken, setAuthCookies } from "@/lib/auth";
import { REFRESH_COOKIE } from "@/lib/jwt";

export const runtime = "nodejs";

/**
 * POST — API clients exchange a refresh token for a new pair. The token may be
 * sent in the JSON body or read from the cookie.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { refreshToken?: string };
  const presented = body.refreshToken ?? (await cookies()).get(REFRESH_COOKIE)?.value;

  if (!presented) {
    return NextResponse.json({ error: "No refresh token supplied" }, { status: 401 });
  }

  const result = await rotateRefreshToken(presented, await requestMeta());
  if (!result.ok) {
    await clearAuthCookies();
    return NextResponse.json(
      {
        error:
          result.reason === "reused"
            ? "This refresh token was already used. All sessions have been signed out."
            : "Your session has expired. Please sign in again.",
        reason: result.reason,
      },
      { status: 401 },
    );
  }

  await setAuthCookies(result.tokens);
  return NextResponse.json({ user: result.user, ...result.tokens });
}

/**
 * GET — the browser path. Middleware sends a navigation here when the access
 * token has expired; this rotates the pair and bounces back to where the user
 * was going, so an expired access token is invisible to them.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next") || "/";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  const presented = (await cookies()).get(REFRESH_COOKIE)?.value;
  if (!presented) {
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(safeNext)}`, url));
  }

  const result = await rotateRefreshToken(presented, await requestMeta());
  if (!result.ok) {
    await clearAuthCookies();
    const reason = result.reason === "reused" ? "reused" : "expired";
    return NextResponse.redirect(
      new URL(`/login?next=${encodeURIComponent(safeNext)}&reason=${reason}`, url),
    );
  }

  await setAuthCookies(result.tokens);
  return NextResponse.redirect(new URL(safeNext, url));
}
