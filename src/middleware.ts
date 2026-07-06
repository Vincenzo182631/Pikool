import { NextResponse, type NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";

const ACCESS_COOKIE = "pp_access";
const REFRESH_COOKIE = "pp_refresh";

/** Routes that require a session (the authenticated app + admin). */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/map",
  "/feed",
  "/matchmaking",
  "/messages",
  "/courts",
  "/events",
  "/tournaments",
  "/clubs",
  "/marketplace",
  "/onboarding",
  "/profile",
  "/settings",
  "/admin",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (!isProtected) return NextResponse.next();

  const access = req.cookies.get(ACCESS_COOKIE)?.value;
  const hasRefresh = Boolean(req.cookies.get(REFRESH_COOKIE)?.value);

  // Valid access token → allow. Expired access but a refresh cookie present →
  // allow through; the client silently refreshes on the first API 401.
  if (access && (await verifyAccessToken(access))) return NextResponse.next();
  if (hasRefresh) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/map/:path*",
    "/feed/:path*",
    "/matchmaking/:path*",
    "/messages/:path*",
    "/courts/:path*",
    "/events/:path*",
    "/tournaments/:path*",
    "/clubs/:path*",
    "/marketplace/:path*",
    "/onboarding/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/admin/:path*",
  ],
};
