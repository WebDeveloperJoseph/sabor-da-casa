import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAuth } from "@/lib/auth";
import {
  adicionarDias,
  dataUtc,
  formatarDataIso,
  sincronizarPedidos,
} from "@/lib/financeiro";
import { prisma } from "@/lib/prisma";

const lancamentoSchema = z.object({
  tipo: z.enum(["entrada", "despesa"]),
  descricao: z.string().trim().min(2).max(200),
  categoria: z.string().trim().min(2).max(100),
  valor: z.coerce.number().positive().max(99_999_999),
  dataCompetencia: z.iso.date(),
  observacoes: z.string().trim().max(1000).optional().nullable(),
});

function periodoPadrao() {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const ultimoDia = new Date(ano, agora.getMonth() + 1, 0).getDate();

  return {
    inicio: `${ano}-${mes}-01`,
    fim: `${ano}-${mes}-${String(ultimoDia).padStart(2, "0")}`,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { authenticated } = await requireAuth();
    if (!authenticated) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    await sincronizarPedidos();

    const padrao = periodoPadrao();
    const inicio = request.nextUrl.searchParams.get("inicio") ?? padrao.inicio;
    const fim = request.nextUrl.searchParams.get("fim") ?? padrao.fim;
    const tipo = request.nextUrl.searchParams.get("tipo") ?? "todos";
    const categoria = request.nextUrl.searchParams.get("categoria") ?? "todas";
    const busca = request.nextUrl.searchParams.get("busca")?.trim() ?? "";

    if (!z.iso.date().safeParse(inicio).success || !z.iso.date().safeParse(fim).success) {
      return NextResponse.json({ erro: "Período inválido" }, { status: 400 });
    }

    const dataInicio = dataUtc(inicio);
    const dataFimExclusiva = adicionarDias(dataUtc(fim), 1);
    if (dataInicio >= dataFimExclusiva) {
      return NextResponse.json(
        { erro: "A data inicial deve ser anterior à data final" },
        { status: 400 },
      );
    }

    const where = {
      dataCompetencia: { gte: dataInicio, lt: dataFimExclusiva },
      ...(tipo === "entrada" || tipo === "despesa" ? { tipo } : {}),
      ...(categoria !== "todas" ? { categoria } : {}),
      ...(busca
        ? {
            OR: [
              { descricao: { contains: busca, mode: "insensitive" as const } },
              { categoria: { contains: busca, mode: "insensitive" as const } },
              { observacoes: { contains: busca, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [lancamentos, categoriasRegistradas] = await Promise.all([
      prisma.lancamentoFinanceiro.findMany({
        where,
        orderBy: [{ dataCompetencia: "desc" }, { id: "desc" }],
      }),
      prisma.lancamentoFinanceiro.findMany({
        distinct: ["categoria"],
        select: { categoria: true },
        orderBy: { categoria: "asc" },
      }),
    ]);

    let entradas = 0;
    let entradasDePedidos = 0;
    let despesas = 0;
    let pedidos = 0;
    const porDia = new Map<string, { entradas: number; despesas: number }>();
    const despesasPorCategoria = new Map<string, number>();

    for (const lancamento of lancamentos) {
      const valor = Number(lancamento.valor);
      const data = formatarDataIso(lancamento.dataCompetencia);
      const dia = porDia.get(data) ?? { entradas: 0, despesas: 0 };

      if (lancamento.tipo === "entrada") {
        entradas += valor;
        dia.entradas += valor;
        if (lancamento.origem === "pedido") entradasDePedidos += valor;
      } else {
        despesas += valor;
        dia.despesas += valor;
        despesasPorCategoria.set(
          lancamento.categoria,
          (despesasPorCategoria.get(lancamento.categoria) ?? 0) + valor,
        );
      }

      if (lancamento.origem === "pedido") pedidos += 1;
      porDia.set(data, dia);
    }

    const evolucao = [...porDia.entries()]
      .sort(([dataA], [dataB]) => dataA.localeCompare(dataB))
      .map(([data, valores]) => ({
        data,
        ...valores,
        saldo: valores.entradas - valores.despesas,
      }));

    return NextResponse.json({
      resumo: {
        entradas,
        despesas,
        saldo: entradas - despesas,
        pedidos,
        ticketMedio: pedidos > 0 ? entradasDePedidos / pedidos : 0,
        lancamentos: lancamentos.length,
      },
      lancamentos: lancamentos.map((item) => ({
        ...item,
        valor: Number(item.valor),
        dataCompetencia: formatarDataIso(item.dataCompetencia),
      })),
      evolucao,
      despesasPorCategoria: [...despesasPorCategoria.entries()]
        .map(([nome, valor]) => ({ categoria: nome, valor }))
        .sort((a, b) => b.valor - a.valor),
      categorias: categoriasRegistradas.map((item) => item.categoria),
      periodo: { inicio, fim },
    });
  } catch (error) {
    console.error("Erro ao consultar financeiro:", error);
    return NextResponse.json(
      { erro: "Não foi possível carregar o financeiro" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { authenticated } = await requireAuth();
    if (!authenticated) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const validacao = lancamentoSchema.safeParse(await request.json());
    if (!validacao.success) {
      return NextResponse.json(
        { erro: "Revise os dados informados", detalhes: validacao.error.flatten() },
        { status: 400 },
      );
    }

    const lancamento = await prisma.lancamentoFinanceiro.create({
      data: {
        ...validacao.data,
        origem: "manual",
        observacoes: validacao.data.observacoes || null,
        dataCompetencia: dataUtc(validacao.data.dataCompetencia),
      },
    });

    return NextResponse.json(lancamento, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar lançamento:", error);
    return NextResponse.json(
      { erro: "Não foi possível salvar o lançamento" },
      { status: 500 },
    );
  }
}
