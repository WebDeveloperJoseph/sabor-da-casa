import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/supabaseServer'

// GET - listar pratos
export async function GET() {
  try {
    const { user } = await requireUser()
    if (!user) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    const pratos = await prisma.prato.findMany({
      where: { ativo: true },
      include: {
        categoria: true,
        ingredientes: { include: { ingrediente: true } }
      },
      orderBy: { destaque: 'desc' }
    })
    return NextResponse.json(pratos)
  } catch (error) {
    console.error('Erro ao listar pratos:', error)
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

// POST - criar prato
export async function POST(request: NextRequest) {
  try {
    const { user } = await requireUser()
    if (!user) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    const body = await request.json()
    const { nome, descricao, preco, imagem, categoriaId, ingredientes, destaque, ativo } = body

    if (!nome || nome.trim() === '') return NextResponse.json({ message: 'Nome é obrigatório' }, { status: 400 })
    if (!categoriaId) return NextResponse.json({ message: 'Categoria é obrigatória' }, { status: 400 })

    // Criar prato
    const prato = await prisma.prato.create({
      data: {
        nome: nome.trim(),
        descricao: descricao?.trim() || null,
        preco: typeof preco === 'string' ? parseFloat(preco) : preco,
        imagem: imagem || null,
        categoriaId: parseInt(categoriaId),
        destaque: Boolean(destaque),
        ativo: Boolean(ativo)
      }
    })

    // Relacionar ingredientes (se enviados)
    if (Array.isArray(ingredientes) && ingredientes.length > 0) {
      const tx = ingredientes.map((id: number) => prisma.pratoIngrediente.create({ data: { pratoId: prato.id, ingredienteId: Number(id) } }))
      await prisma.$transaction(tx)
    }

    const created = await prisma.prato.findUnique({ where: { id: prato.id }, include: { categoria: true, ingredientes: { include: { ingrediente: true } } } })
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar prato:', error)
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}
