import { NextRequest, NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  FINANCE_SESSION_COOKIE,
  verificarSessaoAdmin,
  verificarSessaoFinanceiro,
} from "@/lib/auth";

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

  if (
    request.nextUrl.pathname.startsWith("/admin/financeiro") &&
    request.nextUrl.pathname !== "/admin/financeiro/login" &&
    !verificarSessaoFinanceiro(request.cookies.get(FINANCE_SESSION_COOKIE)?.value)
  ) {
    return NextResponse.redirect(new URL("/admin/financeiro/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
