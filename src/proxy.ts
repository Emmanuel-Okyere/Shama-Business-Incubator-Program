import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE, verifyAccessToken } from "@/lib/jwt";

/**
 * Gate on the access token alone — a signature check, no database, so this
 * runs on the edge. When the access token has expired but a refresh token is
 * present, the navigation is sent through /api/auth/refresh (Node runtime),
 * which rotates the pair and redirects back: the user never sees the 15-minute
 * access token expire.
 */
const PROTECTED = ["/portal", "/admin", "/apply/start"];
const ADMIN_ONLY = ["/admin"];

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (!PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  const next = `${pathname}${search}`;
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const claims = accessToken ? await verifyAccessToken(accessToken) : null;

  if (!claims) {
    if (request.cookies.get(REFRESH_COOKIE)?.value) {
      return NextResponse.redirect(
        new URL(`/api/auth/refresh?next=${encodeURIComponent(next)}`, request.url),
      );
    }
    return NextResponse.redirect(
      new URL(`/login?next=${encodeURIComponent(next)}`, request.url),
    );
  }

  if (
    ADMIN_ONLY.some((p) => pathname.startsWith(p)) &&
    claims.role !== "ADMIN" &&
    claims.role !== "SUPER_ADMIN"
  ) {
    return NextResponse.redirect(new URL("/portal?error=forbidden", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/portal/:path*", "/admin/:path*", "/apply/start", "/apply/start/:path*"],
};
