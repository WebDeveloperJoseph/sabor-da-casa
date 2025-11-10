import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/bordas - Buscar bordas recheadas disponíveis
export async function GET() {
  try {
    const categoriaBordas = await prisma.categoria.findFirst({
      where: { 
        nome: { contains: 'Bordas' },
        ativo: true 
      }
    })

    if (!categoriaBordas) {
      return NextResponse.json({ bordas: [] })
    }

    const bordas = await prisma.prato.findMany({
      where: { 
        categoriaId: categoriaBordas.id,
        ativo: true 
      },
      select: {
        id: true,
        nome: true,
        preco: true,
        descricao: true
      },
      orderBy: { preco: 'asc' }
    })

    return NextResponse.json({ 
      bordas: bordas.map(borda => ({
        id: borda.id,
        nome: borda.nome,
        preco: Number(borda.preco),
        descricao: borda.descricao
      }))
    })

  } catch (error) {
    console.error('Erro ao buscar bordas:', error)
    return NextResponse.json(
      { erro: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST() {
  return NextResponse.json({ message: 'Recurso removido' }, { status: 410 })
}
