import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Demo Launch Mode: Controlled via NEXT_PUBLIC_DEMO_MODE or DEMO_MODE env variable
const isDemoModeEnabled = () => {
  return (
    process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
    process.env.DEMO_MODE === "true"
  );
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isDemo = isDemoModeEnabled();

  // Allow root path, API routes, and static assets
  if (
    pathname === "/" ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // In Demo Mode: Redirect all platform pages to /
  if (isDemo) {
    return NextResponse.redirect(new URL("/", request.url));
  }

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
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
