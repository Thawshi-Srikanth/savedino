import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Demo Launch Mode: Controlled via NEXT_PUBLIC_DEMO_MODE or DEMO_MODE env variable
const isDemoModeEnabled = () => {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true" || process.env.DEMO_MODE === "true";
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isDemo = isDemoModeEnabled();

  // Public informational pages that must always remain accessible (even in Demo Mode)
  const isPublicInfoPage =
    pathname === "/privacy" || pathname === "/terms" || pathname === "/credits";

  // Intercept Better Auth OAuth error endpoint and redirect back to /login with styled toast
  if (pathname === "/api/auth/error") {
    const errorParam = request.nextUrl.searchParams.get("error") || "";
    const loginUrl = new URL("/login", request.url);
    if (errorParam === "unable_to_create_user") {
      loginUrl.searchParams.set("error", "EARLY_ACCESS_REQUIRED");
    } else {
      loginUrl.searchParams.set("error", errorParam || "AUTH_FAILED");
    }
    return NextResponse.redirect(loginUrl);
  }

  // Allow root path, public info pages, API routes, and static assets
  if (
    pathname === "/" ||
    isPublicInfoPage ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // In Demo Mode: Redirect all internal platform pages to /
  if (isDemo) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Retrieve session token from Better Auth cookies
  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  const isAuthenticated = Boolean(sessionToken);

  // Route definitions
  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/verify";
  const isInternalPlatformRoute =
    pathname.startsWith("/campaigns") ||
    pathname.startsWith("/teams") ||
    pathname.startsWith("/team/") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/create") ||
    pathname.startsWith("/join") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/link-discord") ||
    pathname.startsWith("/admin");

  // 1. If user is logged in and visits /login or /register -> Redirect to /campaigns
  if (isAuthenticated && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/campaigns", request.url));
  }

  // 2. If user is NOT logged in and attempts to access any internal platform route -> Redirect to /login
  if (!isAuthenticated && isInternalPlatformRoute) {
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
