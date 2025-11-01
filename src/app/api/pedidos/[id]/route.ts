import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/supabaseServer'
import { z } from 'zod'

const atualizarStatusSchema = z.object({
  status: z.enum(['pendente', 'em_preparo', 'saiu_entrega', 'entregue', 'cancelado'])
})

// GET /api/pedidos/[id] - Buscar pedido específico (ADMIN)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireUser()
    const { id } = await params

    const pedido = await prisma.pedido.findUnique({
      where: { id: Number(id) },
      include: {
        itens: {
          include: {
            prato: true
          }
        }
      }
    })

    if (!pedido) {
      return NextResponse.json(
        { erro: 'Pedido não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(pedido)
  } catch (error) {
    console.error('Erro ao buscar pedido:', error)
    
    if (error instanceof Error && error.message === 'Não autorizado') {
      return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
    }

    return NextResponse.json(
      { erro: 'Erro ao buscar pedido' },
      { status: 500 }
    )
  }
}

// PUT /api/pedidos/[id] - Atualizar status do pedido (ADMIN)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireUser()
    const { id } = await params
    const body = await request.json()
    
    const validacao = atualizarStatusSchema.safeParse(body)

    if (!validacao.success) {
      return NextResponse.json(
        { erro: 'Status inválido', detalhes: validacao.error.flatten() },
        { status: 400 }
      )
    }

    const pedido = await prisma.pedido.update({
      where: { id: Number(id) },
      data: {
        status: validacao.data.status
      },
      include: {
        itens: {
          include: {
            prato: true
          }
        }
      }
    })

    return NextResponse.json(pedido)
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error)
    
    if (error instanceof Error && error.message === 'Não autorizado') {
      return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
    }

    return NextResponse.json(
      { erro: 'Erro ao atualizar pedido' },
      { status: 500 }
    )
  }
}

// DELETE /api/pedidos/[id] - Excluir pedido (ADMIN)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireUser()
    const { id } = await params

    await prisma.pedido.delete({
      where: { id: Number(id) }
    })

    return NextResponse.json({ sucesso: true })
  } catch (error) {
    console.error('Erro ao excluir pedido:', error)
    
    if (error instanceof Error && error.message === 'Não autorizado') {
      return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
    }

    return NextResponse.json(
      { erro: 'Erro ao excluir pedido' },
      { status: 500 }
    )
  }
}
