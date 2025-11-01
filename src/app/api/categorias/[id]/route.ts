import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { requireUser } from "@/lib/supabaseServer"

// GET - Buscar categoria específica
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireUser()
    if (!user) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    const { id } = await context.params
    const categoria = await prisma.categoria.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: { pratos: true }
        }
      }
    })

    if (!categoria) {
      return NextResponse.json(
        { message: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(categoria)
  } catch (error) {
    console.error('Erro ao buscar categoria:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar categoria
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireUser()
    if (!user) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    const { id } = await context.params
    const body = await request.json()
    const { nome, descricao, ordem, ativo } = body

    // Validações básicas
    if (!nome || nome.trim() === '') {
      return NextResponse.json(
        { message: 'Nome da categoria é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se a categoria existe
    const categoriaExistente = await prisma.categoria.findUnique({
      where: { id: parseInt(id) }
    })

    if (!categoriaExistente) {
      return NextResponse.json(
        { message: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se outro registro já tem este nome
    const nomeExistente = await prisma.categoria.findFirst({
      where: { 
        nome: nome.trim(),
        id: { not: parseInt(id) }
      }
    })

    if (nomeExistente) {
      return NextResponse.json(
        { message: 'Já existe uma categoria com este nome' },
        { status: 400 }
      )
    }

    // Atualizar categoria
    const categoriaAtualizada = await prisma.categoria.update({
      where: { id: parseInt(id) },
      data: {
        nome: nome.trim(),
        descricao: descricao?.trim() || null,
        ordem: parseInt(ordem) || 0,
        ativo: Boolean(ativo)
      }
    })

    return NextResponse.json(categoriaAtualizada)
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir categoria
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireUser()
    if (!user) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    const { id } = await context.params
    const categoriaId = parseInt(id)

    // Verificar se a categoria existe
    const categoria = await prisma.categoria.findUnique({
      where: { id: categoriaId },
      include: {
        _count: {
          select: { pratos: true }
        }
      }
    })

    if (!categoria) {
      return NextResponse.json(
        { message: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se há pratos associados
    if (categoria._count.pratos > 0) {
      return NextResponse.json(
        { 
          message: `Não é possível excluir esta categoria pois há ${categoria._count.pratos} pizza(s) associada(s). Remova ou mova as pizzas primeiro.` 
        },
        { status: 400 }
      )
    }

    // Excluir categoria
    await prisma.categoria.delete({
      where: { id: categoriaId }
    })

    return NextResponse.json(
      { message: 'Categoria excluída com sucesso' }
    )
  } catch (error) {
    console.error('Erro ao excluir categoria:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}