import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Minimal JWT payload decoder — no signature verification (edge-safe).
// We only read the payload to determine the user's role for routing.
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    // Base64url decode the payload (middle part)
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("kisansetu_token")?.value;

  const protectedPaths = ["/farmer", "/buyer", "/orders", "/earnings"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  // Unauthenticated — redirect to login
  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated — enforce role-based page access
  if (isProtected && token) {
    const payload = decodeJwtPayload(token);
    const role = (payload?.role as string) || "";

    // Demo / fallback token — allow through (the page itself also verifies)
    if (token === "demo-fallback-token" || token === "demo-jwt-fallback") {
      return NextResponse.next();
    }

    // Buyers cannot access /farmer; Farmers cannot access /buyer
    if (role === "buyer" && pathname.startsWith("/farmer")) {
      return NextResponse.redirect(new URL("/buyer", request.url));
    }
    if (role === "farmer" && pathname.startsWith("/buyer")) {
      return NextResponse.redirect(new URL("/farmer", request.url));
    }
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