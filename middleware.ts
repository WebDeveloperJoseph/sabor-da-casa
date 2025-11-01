import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
  
  if (!isAdminRoute) {
    return NextResponse.next()
  }

  // Verificar se tem cookie de autenticação admin
  const adminAuth = req.cookies.get('adminAuth')?.value
  
  if (!adminAuth || adminAuth !== 'true') {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname + req.nextUrl.search)
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
