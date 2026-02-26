import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // const cookie = request.cookies.get("auth-token");
  // const { pathname } = request.nextUrl;

  // if (pathname === "/login") {
  //   if (cookie?.value === "welcome-authorized") {
  //     return NextResponse.redirect(new URL("/", request.url));
  //   }
  //   return NextResponse.next();
  // }

  // if (cookie?.value !== "welcome-authorized") {
  //   return NextResponse.redirect(new URL("/login", request.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
