import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE() {
  try {
  // Deleta todos os pedidos com ID < 24 (considerados testes)
    const result = await prisma.pedido.deleteMany({
      where: {
        id: { lt: 24 }
      }
    })

    return NextResponse.json({ 
      success: true, 
      count: result.count,
      message: `${result.count} pedidos de teste removidos` 
    })
  } catch (error) {
    console.error('Erro ao limpar pedidos de teste:', error)
    return NextResponse.json(
      { error: 'Erro ao limpar pedidos de teste' },
      { status: 500 }
    )
  }
}
