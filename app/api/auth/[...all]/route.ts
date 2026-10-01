import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";

const betterAuthHandlers = toNextJsHandler(auth);

export async function GET(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Intercept Better Auth error page and redirect back to styled login page
  if (pathname.endsWith("/error")) {
    const errorParam = searchParams.get("error") || "";
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", errorParam || "AUTH_FAILED");
    return NextResponse.redirect(loginUrl);
  }

  return betterAuthHandlers.GET(request);
}

export const POST = betterAuthHandlers.POST;
