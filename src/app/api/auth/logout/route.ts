import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const cookieStore = await cookies()
    
    // Remover cookie de autenticação
    cookieStore.delete('adminAuth')
    
    return NextResponse.json({ message: 'Logout realizado com sucesso' })
  } catch (error) {
    console.error('Erro ao fazer logout:', error)
    return NextResponse.json({ message: 'Erro ao fazer logout' }, { status: 500 })
  }
}
