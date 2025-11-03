import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { authenticated } = await requireAuth()
    if (!authenticated) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    const { id } = await context.params
    const ingrediente = await prisma.ingrediente.findUnique({ where: { id: parseInt(id) } })
    if (!ingrediente) return NextResponse.json({ message: 'Ingrediente não encontrado' }, { status: 404 })
    return NextResponse.json(ingrediente)
  } catch (error) {
    console.error('Erro ao buscar ingrediente:', error)
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { authenticated } = await requireAuth()
    if (!authenticated) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    const { id } = await context.params
    const body = await request.json()
    const { nome, alergenico } = body

    if (!nome || nome.trim() === '') {
      return NextResponse.json({ message: 'Nome do ingrediente é obrigatório' }, { status: 400 })
    }

    const ingrediente = await prisma.ingrediente.findUnique({ where: { id: parseInt(id) } })
    if (!ingrediente) return NextResponse.json({ message: 'Ingrediente não encontrado' }, { status: 404 })

    const other = await prisma.ingrediente.findFirst({ where: { nome: nome.trim(), id: { not: parseInt(id) } } })
    if (other) return NextResponse.json({ message: 'Já existe outro ingrediente com esse nome' }, { status: 400 })

    const atualizado = await prisma.ingrediente.update({ where: { id: parseInt(id) }, data: { nome: nome.trim(), alergenico: Boolean(alergenico) } })
    return NextResponse.json(atualizado)
  } catch (error) {
    console.error('Erro ao atualizar ingrediente:', error)
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { authenticated } = await requireAuth()
    if (!authenticated) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    const { id } = await context.params
    const idNum = parseInt(id)
    // Verificar uso em pratos
    const count = await prisma.pratoIngrediente.count({ where: { ingredienteId: idNum } })
    if (count > 0) return NextResponse.json({ message: `Não é possível excluir: ingrediente utilizado em ${count} prato(s)` }, { status: 400 })

    await prisma.ingrediente.delete({ where: { id: idNum } })
    return NextResponse.json({ message: 'Ingrediente excluído' })
  } catch (error) {
    console.error('Erro ao excluir ingrediente:', error)
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}
