import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE() {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Apaga tudo (cascata cuidará de itens e avaliações)
      const deletedAvaliacao = await tx.avaliacao.deleteMany({})
      const deletedItens = await tx.itemPedido.deleteMany({})
      const deletedPedidos = await tx.pedido.deleteMany({})
      const deletedCounters = await tx.dailyOrderCounter.deleteMany({})

      // Resetar sequences para começar do 1 novamente
      // Usamos pg_get_serial_sequence para resolver o nome correto da sequence
      await tx.$executeRawUnsafe("SELECT setval(pg_get_serial_sequence('public.pedidos','id'), 1, false)")
      await tx.$executeRawUnsafe("SELECT setval(pg_get_serial_sequence('public.itens_pedido','id'), 1, false)")
      await tx.$executeRawUnsafe("SELECT setval(pg_get_serial_sequence('public.avaliacoes','id'), 1, false)")

      return {
        pedidos: deletedPedidos.count,
        itens: deletedItens.count,
        avaliacoes: deletedAvaliacao.count,
        counters: deletedCounters.count,
      }
    })

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error('[API] Erro ao zerar pedidos:', error)
    return NextResponse.json({ error: 'Erro ao zerar pedidos' }, { status: 500 })
  }
}
