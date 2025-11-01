import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/supabaseServer'

// GET - Listar ingredientes
export async function GET() {
  try {
    const { user } = await requireUser()
    if (!user) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    const ingredientes = await prisma.ingrediente.findMany({ orderBy: { nome: 'asc' } })
    return NextResponse.json(ingredientes)
  } catch (error) {
    console.error('Erro ao buscar ingredientes:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Criar novo ingrediente
export async function POST(request: NextRequest) {
  try {
    const { user } = await requireUser()
    if (!user) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    const body = await request.json()
    const { nome, alergenico } = body

    if (!nome || nome.trim() === '') {
      return NextResponse.json({ message: 'Nome do ingrediente é obrigatório' }, { status: 400 })
    }

    const ingredienteExistente = await prisma.ingrediente.findUnique({ where: { nome: nome.trim() } })
    if (ingredienteExistente) return NextResponse.json({ message: 'Já existe um ingrediente com este nome' }, { status: 400 })

    const novoIngrediente = await prisma.ingrediente.create({ data: { nome: nome.trim(), alergenico: Boolean(alergenico) } })
    return NextResponse.json(novoIngrediente, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar ingrediente:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}