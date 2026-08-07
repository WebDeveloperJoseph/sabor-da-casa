import { NextRequest, NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE, verificarSessaoAdmin } from "@/lib/auth";

export function proxy(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (!verificarSessaoAdmin(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set(
      "redirectTo",
      request.nextUrl.pathname + request.nextUrl.search,
    );
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
