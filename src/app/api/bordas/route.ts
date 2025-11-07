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
  console.log('=== POST /api/bordas CHAMADO ===')
  
  try {
    console.log('Verificando autenticação...')
    const { authenticated } = await requireAuth()
    console.log('Autenticado:', authenticated)
    
    if (!authenticated) {
      console.log('Não autorizado - retornando 401')
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }
    
    const body = await request.json()
    console.log('POST /api/bordas - Body recebido:', body)
    
    const { nome, precoAdicional, ativo } = body

    if (!nome || nome.trim() === '') {
      console.log('Nome vazio - retornando 400')
      return NextResponse.json({ message: 'Nome é obrigatório' }, { status: 400 })
    }

    if (precoAdicional === undefined || precoAdicional === null || precoAdicional === '' || Number(precoAdicional) < 0) {
      console.log('Preço inválido - retornando 400')
      return NextResponse.json({ message: 'Preço adicional inválido' }, { status: 400 })
    }

    // Verificar se já existe
    console.log('Verificando se borda já existe...')
    const existe = await prisma.bordaRecheada.findUnique({
      where: { nome: nome.trim() }
    })

    if (existe) {
      console.log('Borda já existe - retornando 400')
      return NextResponse.json({ message: 'Já existe uma borda com este nome' }, { status: 400 })
    }

    console.log('Criando borda no banco...')
    const borda = await prisma.bordaRecheada.create({
      data: {
        nome: nome.trim(),
        precoAdicional: Number(precoAdicional),
        ativo: Boolean(ativo ?? true)
      }
    })

    console.log('POST /api/bordas - Borda criada com sucesso:', borda)
    return NextResponse.json(borda, { status: 201 })
  } catch (error) {
    console.error('ERRO CRÍTICO ao criar borda:', error)
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}
