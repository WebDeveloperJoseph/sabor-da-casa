import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { pedidoId, estrelas, comentario } = await req.json()

    // Validações
    if (!pedidoId || !estrelas) {
      return NextResponse.json(
        { error: "Campos obrigatórios: pedidoId e estrelas" },
        { status: 400 }
      )
    }

    if (estrelas < 1 || estrelas > 5) {
      return NextResponse.json(
        { error: "Estrelas deve ser um número entre 1 e 5" },
        { status: 400 }
      )
    }

    // Verifica se o pedido existe e se está entregue
    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
      include: { avaliacao: true }
    })

    if (!pedido) {
      return NextResponse.json(
        { error: "Pedido não encontrado" },
        { status: 404 }
      )
    }

    if (pedido.status !== "entregue") {
      return NextResponse.json(
        { error: "Apenas pedidos entregues podem ser avaliados" },
        { status: 400 }
      )
    }

    if (pedido.avaliacao) {
      return NextResponse.json(
        { error: "Este pedido já foi avaliado" },
        { status: 409 }
      )
    }

    // Cria a avaliação
    const avaliacao = await prisma.avaliacao.create({
      data: {
        pedidoId,
        estrelas,
        comentario: comentario || null
      }
    })

    return NextResponse.json(avaliacao, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar avaliação:", error)
    return NextResponse.json(
      { error: "Erro interno ao criar avaliação" },
      { status: 500 }
    )
  }
}
