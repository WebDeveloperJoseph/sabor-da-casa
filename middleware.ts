import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  // Clona os headers para permitir que o Supabase escreva cookies
  const res = NextResponse.next({ request: { headers: new Headers(req.headers) } })

  // Tipagem do pacote pode divergir entre versões; forçamos o objeto de cookies
  // para manter compatibilidade no middleware.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set(name: string, value: string, options: any) {
          try {
            res.cookies.set({ name, value, ...options })
          } catch {}
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        remove(name: string, options: any) {
          try {
            res.cookies.set({ name, value: '', ...options })
          } catch {}
        },
      },
    } as any
  )

  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
  if (!isAdminRoute) return res

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname + req.nextUrl.search)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*'],
}
