import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { demoSessionCookie, userIdFromDemoSession } from "@/features/auth/session-cookie";

const openAuthPaths = new Set(["/sign-in", "/forgot-password", "/reset-password"]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const signedIn = userIdFromDemoSession(request.cookies.get(demoSessionCookie)?.value) !== null;

  if (pathname === "/sign-in" && signedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!signedIn && !openAuthPaths.has(pathname)) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|jpg|jpeg|gif|webp|ico)$).*)"],
};
