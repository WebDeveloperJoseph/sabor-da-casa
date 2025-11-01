import { cookies, headers } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function getSupabaseServer() {
  const cookieStore = await cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch {
          // Pode falhar em alguns contextos, ignorar
        }
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      remove(name: string, options: any) {
        try {
          cookieStore.set({ name, value: '', ...options })
        } catch {
          // Pode falhar em alguns contextos, ignorar
        }
      },
    },
  })

  return supabase
}

export async function requireUser() {
  const headersList = await headers()
  const authHeader = headersList.get('authorization')
  
  // Se tem token no header, usar ele
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    // Criar client simples para validar o token
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    const { data: { user } } = await supabase.auth.getUser(token)
    return { supabase, user }
  }
  
  // Caso contrário, tentar via cookies
  const supabase = await getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  return { supabase, user }
}
