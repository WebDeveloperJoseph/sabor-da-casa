import { cookies } from 'next/headers'

export async function requireAuth() {
  const cookieStore = await cookies()
  const adminAuth = cookieStore.get('adminAuth')?.value
  
  if (!adminAuth || adminAuth !== 'true') {
    return { authenticated: false }
  }
  
  return { authenticated: true }
}
