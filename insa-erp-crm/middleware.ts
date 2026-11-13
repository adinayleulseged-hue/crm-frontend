import { NextRequest, NextResponse } from "next/server";

// Only protect /crm routes server-side
// /dashboard/* routes are protected client-side by each page
const PROTECTED_PREFIXES = ["/crm"];
const PUBLIC_PATHS = ["/login", "/api", "/register", "/dashboard", "/role-login", "/customer-login", "/customer"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public paths and dashboard (client-side auth)
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Protect /crm routes
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) {
    return NextResponse.next();
  }

  // Check cookie for /crm routes
  const token =
    request.cookies.get("crm_auth_token")?.value ||
    request.cookies.get("token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
