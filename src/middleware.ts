import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("kisansetu_token")?.value;

  const protectedPaths = [
    "/farmer",
    "/buyer",
    "/orders",
    "/earnings",
  ];

  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If logged in and trying to access login/register, redirect to dashboard
  if ((request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register") && token) {
    // We can't easily decode the JWT here, so redirect to a generic dashboard
    // The page itself will handle role-based redirect
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt (static assets)
     * - login, register, onboarding (public auth pages)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|login|register|onboarding|verify-email|reset-password|offline|maintenance|forbidden|not-found|error|states|payment|legal|support|$).*)",
  ],
};