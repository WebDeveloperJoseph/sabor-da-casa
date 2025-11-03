import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { authenticated } = await requireAuth()
    if (!authenticated) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    const { id } = await context.params
    const idNum = Number(id)
    const prato = await prisma.prato.findUnique({
      where: { id: idNum },
      include: { 
        categoria: true, 
        ingredientes: { include: { ingrediente: true } },
        tamanhos: { where: { ativo: true }, orderBy: { tamanho: 'asc' } }
      }
    })
    if (!prato) return NextResponse.json({ message: 'Prato não encontrado' }, { status: 404 })
    return NextResponse.json(prato)
  } catch (error) {
    console.error('Erro GET /pratos/[id]:', error)
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { authenticated } = await requireAuth()
    if (!authenticated) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    const { id } = await context.params
    const idNum = Number(id)
    const body = await request.json()
    const { nome, descricao, preco, imagem, categoriaId, ingredientes, destaque, ativo, tamanhos } = body

    const exist = await prisma.prato.findUnique({ where: { id: idNum } })
    if (!exist) return NextResponse.json({ message: 'Prato não encontrado' }, { status: 404 })

    await prisma.prato.update({
      where: { id: idNum },
      data: {
        nome: nome?.trim() || exist.nome,
        descricao: descricao !== undefined ? descricao : exist.descricao,
        preco: preco !== undefined ? (typeof preco === 'string' ? parseFloat(preco) : preco) : exist.preco,
        imagem: imagem !== undefined ? imagem : exist.imagem,
        categoriaId: categoriaId !== undefined ? Number(categoriaId) : exist.categoriaId,
        destaque: destaque !== undefined ? Boolean(destaque) : exist.destaque,
        ativo: ativo !== undefined ? Boolean(ativo) : exist.ativo
      }
    })

    // Sincronizar ingredientes: remover existentes e criar novos
    if (Array.isArray(ingredientes)) {
      await prisma.$transaction([
        prisma.pratoIngrediente.deleteMany({ where: { pratoId: idNum } }),
        ...ingredientes.map((ing: number) => prisma.pratoIngrediente.create({ data: { pratoId: idNum, ingredienteId: Number(ing) } }))
      ])
    }

    // Sincronizar tamanhos (se enviados)
    if (Array.isArray(tamanhos)) {
      await prisma.$transaction([
        prisma.pratoTamanho.deleteMany({ where: { pratoId: idNum } }),
        ...tamanhos.map((t: { tamanho: string; preco: number }) => 
          prisma.pratoTamanho.create({ 
            data: { 
              pratoId: idNum, 
              tamanho: t.tamanho.toUpperCase(), 
              preco: typeof t.preco === 'string' ? parseFloat(t.preco) : t.preco 
            } 
          })
        )
      ])
    }

    const prato = await prisma.prato.findUnique({ 
      where: { id: idNum }, 
      include: { 
        categoria: true, 
        ingredientes: { include: { ingrediente: true } },
        tamanhos: { where: { ativo: true }, orderBy: { tamanho: 'asc' } }
      } 
    })
    return NextResponse.json(prato)
  } catch (error) {
    console.error('Erro PUT /pratos/[id]:', error)
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { authenticated } = await requireAuth()
    if (!authenticated) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    const { id } = await context.params
    const idNum = Number(id)
    const exist = await prisma.prato.findUnique({ where: { id: idNum } })
    if (!exist) return NextResponse.json({ message: 'Prato não encontrado' }, { status: 404 })

    // Deletar ingredientes vinculados e o prato
    await prisma.$transaction([
      prisma.pratoIngrediente.deleteMany({ where: { pratoId: idNum } }),
      prisma.prato.delete({ where: { id: idNum } })
    ])

    return NextResponse.json({ message: 'Prato removido' })
  } catch (error) {
    console.error('Erro DELETE /pratos/[id]:', error)
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}
