import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireFinanceAuth } from "@/lib/auth";
import { dataUtc, parseValorLancamento, serializarLancamento } from "@/lib/financeiro";
import { prisma } from "@/lib/prisma";

const lancamentoSchema = z.object({
  tipo: z.enum(["entrada", "despesa"]),
  descricao: z.string().trim().min(2).max(200),
  categoria: z.string().trim().min(2).max(100),
  valor: z.preprocess(parseValorLancamento, z.number().positive().max(99_999_999)),
  dataCompetencia: z.iso.date(),
  observacoes: z.string().trim().max(1000).optional().nullable(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { authenticated } = await requireFinanceAuth();
    if (!authenticated) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const id = Number((await params).id);
    const existente = await prisma.lancamentoFinanceiro.findUnique({ where: { id } });
    if (!existente) {
      return NextResponse.json({ erro: "Lançamento não encontrado" }, { status: 404 });
    }
    if (existente.origem === "pedido") {
      return NextResponse.json(
        { erro: "Receitas de pedidos não podem ser alteradas manualmente" },
        { status: 409 },
      );
    }

    const validacao = lancamentoSchema.safeParse(await request.json());
    if (!validacao.success) {
      return NextResponse.json({ erro: "Revise os dados informados" }, { status: 400 });
    }

    const atualizado = await prisma.lancamentoFinanceiro.update({
      where: { id },
      data: {
        ...validacao.data,
        observacoes: validacao.data.observacoes || null,
        dataCompetencia: dataUtc(validacao.data.dataCompetencia),
      },
    });
    return NextResponse.json(serializarLancamento(atualizado));
  } catch (error) {
    console.error("Erro ao atualizar lançamento:", error);
    return NextResponse.json({ erro: "Não foi possível atualizar" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: RouteParams) {
  try {
    const { authenticated } = await requireFinanceAuth();
    if (!authenticated) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const id = Number((await params).id);
    const existente = await prisma.lancamentoFinanceiro.findUnique({ where: { id } });
    if (!existente) {
      return NextResponse.json({ erro: "Lançamento não encontrado" }, { status: 404 });
    }
    if (existente.origem === "pedido") {
      return NextResponse.json(
        { erro: "Receitas de pedidos não podem ser excluídas" },
        { status: 409 },
      );
    }

    await prisma.lancamentoFinanceiro.delete({ where: { id } });
    return NextResponse.json({ sucesso: true });
  } catch (error) {
    console.error("Erro ao excluir lançamento:", error);
    return NextResponse.json({ erro: "Não foi possível excluir" }, { status: 500 });
  }
}
