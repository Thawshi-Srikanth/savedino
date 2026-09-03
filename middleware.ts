import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Retrieve session token from Better Auth cookies
  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  const isAuthenticated = Boolean(sessionToken);

  // Route definitions
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isProtectedRoute = pathname.startsWith("/team/");
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  // 1. If user is logged in and visits /login or /register -> Redirect to /campaigns
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL("/campaigns", request.url));
  }

  // 2. If user is NOT logged in and attempts to access protected team workspace -> Redirect to /login
  if (!isAuthenticated && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. If user is NOT logged in and attempts to access admin console -> Redirect to /login
  if (!isAuthenticated && isAdminRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/auth (Better Auth endpoints)
     * - _next/static (static assets)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Public asset extensions (.png, .jpg, .svg, .gif, .ico)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
