import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { registrarReceitaDoPedido, removerReceitaDoPedido } from '@/lib/financeiro'
import { calcularSubtotalItens, calcularTaxaEntrega, calcularValorTotal } from '@/lib/pedidoTotais'
import { z } from 'zod'

const atualizarStatusSchema = z.object({
  status: z.enum(['pendente', 'em_preparo', 'saiu_entrega', 'entregue', 'cancelado'])
})

const editarPedidoSchema = z.object({
  nomeCliente: z.string().trim().min(3).max(200),
  telefone: z.string().trim().max(20).nullable().optional(),
  endereco: z.string().trim().min(5).max(500),
  observacoes: z.string().trim().max(1000).nullable().optional(),
  dataPedido: z.string().min(10).max(35).optional(),
  taxaEntrega: z.number().min(0).optional(),
  itens: z.array(z.object({
    id: z.number().int().positive().optional(),
    pratoId: z.number().int().positive(),
    quantidade: z.number().int().min(1).max(99),
    tamanho: z.string().trim().max(10).nullable().optional(),
    observacoes: z.string().trim().max(1000).nullable().optional(),
  })).min(1).max(50),
})

// GET /api/pedidos/[id] - Buscar pedido específico (ADMIN)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authenticated } = await requireAuth()
    if (!authenticated) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
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
    const { authenticated } = await requireAuth()
    if (!authenticated) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
    const { id } = await params
    const body = await request.json()
    
    const validacao = atualizarStatusSchema.safeParse(body)

    if (!validacao.success) {
      return NextResponse.json(
        { erro: 'Status inválido', detalhes: validacao.error.flatten() },
        { status: 400 }
      )
    }

    const pedido = await prisma.$transaction(async (tx) => {
      const atualizado = await tx.pedido.update({
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

      if (validacao.data.status === 'cancelado') {
        await removerReceitaDoPedido(tx, atualizado.id)
      } else {
        await registrarReceitaDoPedido(tx, atualizado)
      }

      return atualizado
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

// PATCH /api/pedidos/[id] - Editar dados e itens do pedido (ADMIN)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authenticated } = await requireAuth()
    if (!authenticated) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

    const pedidoId = Number((await params).id)
    if (!Number.isInteger(pedidoId) || pedidoId <= 0) {
      return NextResponse.json({ erro: 'Pedido inválido' }, { status: 400 })
    }

    const validacao = editarPedidoSchema.safeParse(await request.json())
    if (!validacao.success) {
      return NextResponse.json(
        { erro: 'Revise os dados do pedido', detalhes: validacao.error.flatten() },
        { status: 400 },
      )
    }

    const existente = await prisma.pedido.findUnique({
      where: { id: pedidoId },
      include: { itens: true },
    })
    if (!existente) return NextResponse.json({ erro: 'Pedido não encontrado' }, { status: 404 })

    const pratoIds = [...new Set(validacao.data.itens.map((item) => item.pratoId))]
    const pratos = await prisma.prato.findMany({
      where: { id: { in: pratoIds } },
      include: { tamanhos: { where: { ativo: true } } },
    })
    const pratosPorId = new Map(pratos.map((prato) => [prato.id, prato]))
    const itensAtuais = new Map(existente.itens.map((item) => [item.id, item]))
    const subtotalAtual = calcularSubtotalItens(existente.itens)
    const taxaEntregaPreservada = calcularTaxaEntrega(existente.valorTotal, subtotalAtual)
    const taxaEntrega = validacao.data.taxaEntrega ?? taxaEntregaPreservada

    const itensAtualizados = validacao.data.itens.map((item) => {
      const atual = item.id ? itensAtuais.get(item.id) : undefined
      if (item.id && !atual) throw new Error('ITEM_INVALIDO')
      const tamanho = item.tamanho || null
      const semTrocaDeProduto = atual && atual.pratoId === item.pratoId && (atual.tamanho || null) === tamanho

      if (semTrocaDeProduto) {
        const precoUnit = Number(atual.precoUnit)
        return {
          pratoId: atual.pratoId,
          nomePrato: atual.nomePrato,
          quantidade: item.quantidade,
          precoUnit,
          subtotal: precoUnit * item.quantidade,
          observacoes: item.observacoes || null,
          tamanho: atual.tamanho,
          bordaNome: atual.bordaNome,
          bordaPreco: atual.bordaPreco,
        }
      }

      const prato = pratosPorId.get(item.pratoId)
      if (!prato || !prato.ativo) {
        if (atual && atual.pratoId === item.pratoId) {
          const precoUnit = Number(atual.precoUnit)
          return {
            pratoId: atual.pratoId,
            nomePrato: atual.nomePrato,
            quantidade: item.quantidade,
            precoUnit,
            subtotal: precoUnit * item.quantidade,
            observacoes: item.observacoes || null,
            tamanho: atual.tamanho,
            bordaNome: atual.bordaNome,
            bordaPreco: atual.bordaPreco,
          }
        }
        throw new Error('PRATO_INVALIDO')
      }
      let precoUnit = Number(prato.preco)
      if (prato.tamanhos.length > 0) {
        const opcao = prato.tamanhos.find((opcao) => opcao.tamanho === tamanho)
        if (!opcao) throw new Error('TAMANHO_INVALIDO')
        precoUnit = Number(opcao.preco)
      }

      return {
        pratoId: prato.id,
        nomePrato: prato.nome,
        quantidade: item.quantidade,
        precoUnit,
        subtotal: precoUnit * item.quantidade,
        observacoes: item.observacoes || null,
        tamanho,
        bordaNome: null,
        bordaPreco: null,
      }
    })

    const valorTotal = calcularValorTotal(
      itensAtualizados.reduce((total, item) => total + item.subtotal, 0),
      taxaEntrega,
    )
    const dataPedido = validacao.data.dataPedido
      ? new Date(validacao.data.dataPedido)
      : existente.createdAt
    const atualizado = await prisma.$transaction(async (tx) => {
      const pedido = await tx.pedido.update({
        where: { id: pedidoId },
        data: {
          nomeCliente: validacao.data.nomeCliente,
          telefone: validacao.data.telefone || null,
          endereco: validacao.data.endereco,
          observacoes: validacao.data.observacoes || null,
          createdAt: dataPedido,
          valorTotal,
          itens: {
            deleteMany: {},
            create: itensAtualizados,
          },
        },
        include: { itens: true },
      })

      if (pedido.status !== 'cancelado') await registrarReceitaDoPedido(tx, pedido)
      return pedido
    })

    return NextResponse.json(atualizado)
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (message === 'ITEM_INVALIDO' || message === 'PRATO_INVALIDO' || message === 'TAMANHO_INVALIDO') {
      return NextResponse.json({ erro: 'Um dos itens ou tamanhos selecionados não está disponível' }, { status: 400 })
    }
    console.error('Erro ao editar pedido:', error)
    return NextResponse.json({ erro: 'Não foi possível editar o pedido' }, { status: 500 })
  }
}

// DELETE /api/pedidos/[id] - Excluir pedido (ADMIN)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authenticated } = await requireAuth()
    if (!authenticated) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
    const { id } = await params

    const pedidoId = Number(id)
    await prisma.$transaction(async (tx) => {
      await removerReceitaDoPedido(tx, pedidoId)
      await tx.pedido.delete({ where: { id: pedidoId } })
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
