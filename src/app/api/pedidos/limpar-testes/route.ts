import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function DELETE() {
  try {
    const { authenticated } = await requireAuth()
    if (!authenticated) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  // Deleta todos os pedidos com ID < 24 (considerados testes)
    const result = await prisma.$transaction(async (tx) => {
      await tx.lancamentoFinanceiro.deleteMany({
        where: { origem: 'pedido', pedido: { is: { id: { lt: 24 } } } },
      })
      return tx.pedido.deleteMany({
        where: { id: { lt: 24 } },
      })
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
