import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"

// GET - Listar categorias
export async function GET() {
  try {
    const { authenticated } = await requireAuth()
    if (!authenticated) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    const categorias = await prisma.categoria.findMany({
      include: {
        _count: {
          select: { pratos: true }
        }
      },
      orderBy: { ordem: 'asc' }
    })

    return NextResponse.json(categorias)
  } catch (error) {
    console.error('Erro ao buscar categorias:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar nova categoria
export async function POST(request: NextRequest) {
  try {
    const { authenticated } = await requireAuth()
    if (!authenticated) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    const body = await request.json()
    const { nome, descricao, ordem, ativo } = body

    // Validações básicas
    if (!nome || nome.trim() === '') {
      return NextResponse.json(
        { message: 'Nome da categoria é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se já existe uma categoria com este nome
    const categoriaExistente = await prisma.categoria.findUnique({
      where: { nome: nome.trim() }
    })

    if (categoriaExistente) {
      return NextResponse.json(
        { message: 'Já existe uma categoria com este nome' },
        { status: 400 }
      )
    }

    // Criar categoria
    const novaCategoria = await prisma.categoria.create({
      data: {
        nome: nome.trim(),
        descricao: descricao?.trim() || null,
        ordem: parseInt(ordem) || 0,
        ativo: Boolean(ativo)
      }
    })

    return NextResponse.json(novaCategoria, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar categoria:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}