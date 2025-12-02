import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Buscar todos os pedidos entregues
    const pedidos = await prisma.pedido.findMany({
      where: {
        status: 'entregue'
      },
      select: {
        valorTotal: true,
        createdAt: true
      }
    })

    // Calcular total do mês atual
    const agora = new Date()
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1)
    const fimMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0, 23, 59, 59, 999)
    
    // Calcular vendas de hoje
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const fimHoje = new Date()
    fimHoje.setHours(23, 59, 59, 999)
    
    const pedidosHoje = pedidos.filter(p => {
      const dataPedido = new Date(p.createdAt)
      return dataPedido >= hoje && dataPedido <= fimHoje
    })
    
    const pedidosDoMes = pedidos.filter(p => {
      const dataPedido = new Date(p.createdAt)
      return dataPedido >= inicioMes && dataPedido <= fimMes
    })
    
    const vendasHoje = pedidosHoje.reduce((acc, p) => acc + Number(p.valorTotal), 0)
    const totalMes = pedidosDoMes.reduce((acc, p) => acc + Number(p.valorTotal), 0)
    const totalGeral = pedidos.reduce((acc, p) => acc + Number(p.valorTotal), 0)

    const mesAno = agora.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

    return NextResponse.json({
      vendasHoje,
      pedidosHoje: pedidosHoje.length,
      totalMes,
      pedidosDoMes: pedidosDoMes.length,
      mesAno,
      totalGeral,
      pedidosGeral: pedidos.length
    })
  } catch (error) {
    console.error('Erro ao buscar dados financeiros:', error)
    return NextResponse.json(
      { erro: 'Erro ao buscar dados financeiros' },
      { status: 500 }
    )
  }
}
