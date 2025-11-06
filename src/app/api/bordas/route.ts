import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'

// GET - listar bordas recheadas
export async function GET() {
  try {
    const bordas = await prisma.bordaRecheada.findMany({
      orderBy: { nome: 'asc' }
    })
    return NextResponse.json(bordas)
  } catch (error) {
    console.error('Erro ao listar bordas:', error)
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

// POST - criar borda recheada
export async function POST(request: NextRequest) {
  try {
    const { authenticated } = await requireAuth()
    if (!authenticated) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    
    const body = await request.json()
    const { nome, precoAdicional, ativo } = body

    if (!nome || nome.trim() === '') {
      return NextResponse.json({ message: 'Nome é obrigatório' }, { status: 400 })
    }

    if (!precoAdicional || Number(precoAdicional) < 0) {
      return NextResponse.json({ message: 'Preço adicional inválido' }, { status: 400 })
    }

    // Verificar se já existe
    const existe = await prisma.bordaRecheada.findUnique({
      where: { nome: nome.trim() }
    })

    if (existe) {
      return NextResponse.json({ message: 'Já existe uma borda com este nome' }, { status: 400 })
    }

    const borda = await prisma.bordaRecheada.create({
      data: {
        nome: nome.trim(),
        precoAdicional: Number(precoAdicional),
        ativo: Boolean(ativo ?? true)
      }
    })

    return NextResponse.json(borda, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar borda:', error)
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}
