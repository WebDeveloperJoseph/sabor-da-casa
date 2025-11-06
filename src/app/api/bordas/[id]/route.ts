import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'

// GET - buscar borda específica
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { authenticated } = await requireAuth()
    if (!authenticated) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    
    const { id } = await context.params
    const borda = await prisma.bordaRecheada.findUnique({
      where: { id: parseInt(id) }
    })

    if (!borda) {
      return NextResponse.json({ message: 'Borda não encontrada' }, { status: 404 })
    }

    return NextResponse.json(borda)
  } catch (error) {
    console.error('Erro ao buscar borda:', error)
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

// PUT - atualizar borda
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { authenticated } = await requireAuth()
    if (!authenticated) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    
    const { id } = await context.params
    const body = await request.json()
    const { nome, precoAdicional, ativo } = body

    if (!nome || nome.trim() === '') {
      return NextResponse.json({ message: 'Nome é obrigatório' }, { status: 400 })
    }

    if (precoAdicional === undefined || Number(precoAdicional) < 0) {
      return NextResponse.json({ message: 'Preço adicional inválido' }, { status: 400 })
    }

    const borda = await prisma.bordaRecheada.update({
      where: { id: parseInt(id) },
      data: {
        nome: nome.trim(),
        precoAdicional: Number(precoAdicional),
        ativo: Boolean(ativo)
      }
    })

    return NextResponse.json(borda)
  } catch (error) {
    console.error('Erro ao atualizar borda:', error)
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

// DELETE - excluir borda
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { authenticated } = await requireAuth()
    if (!authenticated) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    
    const { id } = await context.params

    await prisma.bordaRecheada.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ message: 'Borda excluída com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir borda:', error)
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}
