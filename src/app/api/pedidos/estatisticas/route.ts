import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/supabaseServer'

// GET /api/pedidos/estatisticas - Estatísticas de vendas (ADMIN)
export async function GET() {
  try {
    await requireUser()

    // Total de pedidos
    const totalPedidos = await prisma.pedido.count()

    // Pedidos por status
    const pedidosPorStatus = await prisma.pedido.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    })

    // Valor total de vendas
    const vendas = await prisma.pedido.aggregate({
      _sum: {
        valorTotal: true
      },
      where: {
        status: {
          notIn: ['cancelado']
        }
      }
    })

    // Pedidos hoje
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    
    const pedidosHoje = await prisma.pedido.count({
      where: {
        createdAt: {
          gte: hoje
        }
      }
    })

    // Valor de vendas hoje
    const vendasHoje = await prisma.pedido.aggregate({
      _sum: {
        valorTotal: true
      },
      where: {
        createdAt: {
          gte: hoje
        },
        status: {
          notIn: ['cancelado']
        }
      }
    })

    // Pizza mais vendida
    const pizzaMaisVendida = await prisma.itemPedido.groupBy({
      by: ['pratoId', 'nomePrato'],
      _sum: {
        quantidade: true
      },
      orderBy: {
        _sum: {
          quantidade: 'desc'
        }
      },
      take: 5
    })

    // Últimos pedidos
    const ultimosPedidos = await prisma.pedido.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        itens: {
          include: {
            prato: true
          }
        }
      }
    })

    return NextResponse.json({
      totalPedidos,
      pedidosPorStatus: pedidosPorStatus.reduce((acc, curr) => {
        acc[curr.status] = curr._count.id
        return acc
      }, {} as Record<string, number>),
      valorTotalVendas: Number(vendas._sum.valorTotal || 0),
      pedidosHoje,
      valorVendasHoje: Number(vendasHoje._sum.valorTotal || 0),
      pizzasMaisVendidas: pizzaMaisVendida.map(item => ({
        nome: item.nomePrato,
        quantidade: item._sum.quantidade
      })),
      ultimosPedidos
    })
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    
    if (error instanceof Error && error.message === 'Não autorizado') {
      return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
    }

    return NextResponse.json(
      { erro: 'Erro ao buscar estatísticas' },
      { status: 500 }
    )
  }
}
