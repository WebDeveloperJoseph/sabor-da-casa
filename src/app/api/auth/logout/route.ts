import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { ADMIN_SESSION_COOKIE } from '@/lib/auth'

export async function POST() {
  try {
    const cookieStore = await cookies()
    
    // Remover cookie de autenticação
    cookieStore.delete(ADMIN_SESSION_COOKIE)
    
    return NextResponse.json({ message: 'Logout realizado com sucesso' })
  } catch (error) {
    console.error('Erro ao fazer logout:', error)
    return NextResponse.json({ message: 'Erro ao fazer logout' }, { status: 500 })
  }
}
