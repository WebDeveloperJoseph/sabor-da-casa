/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const clienteUpdateSchema = z.object({
  nome: z.string().min(2).optional(),
  telefone: z.string().min(10).optional(),
  email: z.string().email().optional().nullable(),
  dataNascimento: z.string().optional().nullable(),
  cpf: z.string().optional().nullable(),
  endereco: z.string().optional().nullable(),
  complemento: z.string().optional().nullable(),
  bairro: z.string().optional().nullable(),
  cidade: z.string().optional().nullable(),
  uf: z.string().max(2).optional().nullable(),
  cep: z.string().optional().nullable(),
  aceitaWhatsApp: z.boolean().optional(),
  aceitaEmail: z.boolean().optional(),
  aceitaPromocoes: z.boolean().optional(),
  ativo: z.boolean().optional(),
})

type Params = {
  params: Promise<{ id: string }>
}

// GET /api/clientes/[id] - Detalhes do cliente com histórico
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const clienteId = parseInt(id)
    
    if (isNaN(clienteId)) {
      return NextResponse.json({ erro: 'ID inválido' }, { status: 400 })
    }
    
    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
      include: {
        pedidos: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            itens: {
              include: {
                prato: true
              }
            }
          }
        },
        _count: {
          select: { pedidos: true }
        }
      }
    })
    
    if (!cliente) {
      return NextResponse.json({ erro: 'Cliente não encontrado' }, { status: 404 })
    }
    
    // Calcular estatísticas
    const totalGasto = cliente.pedidos.reduce((sum, p) => sum + Number(p.valorTotal), 0)
    const ticketMedio = cliente.pedidos.length > 0 ? totalGasto / cliente.pedidos.length : 0
    
    return NextResponse.json({
      ...cliente,
      estatisticas: {
        totalPedidos: cliente._count.pedidos,
        totalGasto,
        ticketMedio,
        ultimoPedido: cliente.pedidos[0]?.createdAt ?? null
      }
    })
  } catch (error) {
    console.error('[API Clientes GET/:id] Erro:', error)
    return NextResponse.json({ erro: 'Erro ao buscar cliente' }, { status: 500 })
  }
}

// PUT /api/clientes/[id] - Atualizar cliente
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const clienteId = parseInt(id)
    
    if (isNaN(clienteId)) {
      return NextResponse.json({ erro: 'ID inválido' }, { status: 400 })
    }
    
    const body = await request.json()
    const parsed = clienteUpdateSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json({ 
        erro: 'Dados inválidos', 
        detalhes: parsed.error.flatten() 
      }, { status: 400 })
    }
    
  const data = parsed.data
  const updateData: any = {}
    
    if (data.nome) updateData.nome = data.nome
    if (data.telefone) updateData.telefone = data.telefone
    if (data.email !== undefined) updateData.email = data.email
    if (data.dataNascimento !== undefined) {
      // Evita deslocamento de data por fuso horário salvando no meio-dia UTC
      updateData.dataNascimento = data.dataNascimento
        ? new Date(`${data.dataNascimento}T12:00:00.000Z`)
        : null
    }
    if (data.cpf !== undefined) updateData.cpf = data.cpf
    if (data.endereco !== undefined) updateData.endereco = data.endereco
    if (data.complemento !== undefined) updateData.complemento = data.complemento
    if (data.bairro !== undefined) updateData.bairro = data.bairro
    if (data.cidade !== undefined) updateData.cidade = data.cidade
    if (data.uf !== undefined) updateData.uf = data.uf
    if (data.cep !== undefined) updateData.cep = data.cep
    if (data.aceitaWhatsApp !== undefined) updateData.aceitaWhatsApp = data.aceitaWhatsApp
    if (data.aceitaEmail !== undefined) updateData.aceitaEmail = data.aceitaEmail
    if (data.aceitaPromocoes !== undefined) updateData.aceitaPromocoes = data.aceitaPromocoes
    if (data.ativo !== undefined) updateData.ativo = data.ativo
    
    const cliente = await prisma.cliente.update({
      where: { id: clienteId },
      data: updateData
    })
    
    console.log('[API Clientes PUT/:id] Cliente atualizado:', cliente.id)
    return NextResponse.json(cliente)
  } catch (error) {
    console.error('[API Clientes PUT/:id] Erro:', error)
    return NextResponse.json({ erro: 'Erro ao atualizar cliente' }, { status: 500 })
  }
}

// DELETE /api/clientes/[id] - Excluir cliente (LGPD)
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const clienteId = parseInt(id)
    
    if (isNaN(clienteId)) {
      return NextResponse.json({ erro: 'ID inválido' }, { status: 400 })
    }
    
    // Soft delete: apenas marca como inativo
    await prisma.cliente.update({
      where: { id: clienteId },
      data: { ativo: false }
    })
    
    console.log('[API Clientes DELETE/:id] Cliente desativado:', clienteId)
    return NextResponse.json({ sucesso: true, mensagem: 'Cliente desativado' })
  } catch (error) {
    console.error('[API Clientes DELETE/:id] Erro:', error)
    return NextResponse.json({ erro: 'Erro ao excluir cliente' }, { status: 500 })
  }
}
