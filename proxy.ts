import { NextResponse, type NextRequest } from "next/server";

import { auth } from "@/lib/auth";

const PUBLIC_PATHS = new Set(["/sign-in", "/sign-up"]);

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const isPublicPath = PUBLIC_PATHS.has(pathname);

  if (!session && !isPublicPath) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirectTo", `${pathname}${search}`);
    return NextResponse.redirect(signInUrl);
  }

  if (session && isPublicPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
