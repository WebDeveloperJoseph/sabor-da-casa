import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireFinanceAuth } from "@/lib/auth";
import {
  adicionarDias,
  dataUtc,
  formatarDataIso,
  parseValorLancamento,
  serializarLancamento,
  sincronizarPedidos,
} from "@/lib/financeiro";
import { prisma } from "@/lib/prisma";

const lancamentoSchema = z.object({
  tipo: z.enum(["entrada", "despesa"]),
  descricao: z.string().trim().min(2).max(200),
  categoria: z.string().trim().min(2).max(100),
  valor: z.preprocess(parseValorLancamento, z.number().positive().max(99_999_999)),
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
    const { authenticated } = await requireFinanceAuth();
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
    const exportarTodos = request.nextUrl.searchParams.get("exportar") === "todos";
    const pagina = Math.max(1, Number(request.nextUrl.searchParams.get("pagina")) || 1);
    const porPagina = Math.min(
      100,
      Math.max(10, Number(request.nextUrl.searchParams.get("porPagina")) || 25),
    );

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

    const [
      lancamentos,
      totalLancamentos,
      totalEntradas,
      totalDespesas,
      totalPedidos,
      entradasDePedidos,
      evolucaoAgrupada,
      despesasAgrupadas,
      categoriasRegistradas,
    ] = await prisma.$transaction([
      prisma.lancamentoFinanceiro.findMany({
        where,
        orderBy: [{ dataCompetencia: "desc" }, { id: "desc" }],
        ...(!exportarTodos ? { skip: (pagina - 1) * porPagina, take: porPagina } : {}),
      }),
      prisma.lancamentoFinanceiro.count({ where }),
      prisma.lancamentoFinanceiro.aggregate({
        where: { ...where, tipo: "entrada" },
        _sum: { valor: true },
      }),
      prisma.lancamentoFinanceiro.aggregate({
        where: { ...where, tipo: "despesa" },
        _sum: { valor: true },
      }),
      prisma.lancamentoFinanceiro.count({
        where: { ...where, origem: "pedido" },
      }),
      prisma.lancamentoFinanceiro.aggregate({
        where: { ...where, tipo: "entrada", origem: "pedido" },
        _sum: { valor: true },
      }),
      prisma.lancamentoFinanceiro.groupBy({
        by: ["dataCompetencia", "tipo"],
        where,
        _sum: { valor: true },
        orderBy: { dataCompetencia: "asc" },
      }),
      prisma.lancamentoFinanceiro.groupBy({
        by: ["categoria"],
        where: { ...where, tipo: "despesa" },
        _sum: { valor: true },
        orderBy: { _sum: { valor: "desc" } },
      }),
      prisma.lancamentoFinanceiro.findMany({
        distinct: ["categoria"],
        select: { categoria: true },
        orderBy: { categoria: "asc" },
      }),
    ]);

    const porDia = new Map<string, { entradas: number; despesas: number }>();

    for (const grupo of evolucaoAgrupada) {
      const valor = Number(grupo._sum?.valor ?? 0);
      const data = formatarDataIso(grupo.dataCompetencia);
      const dia = porDia.get(data) ?? { entradas: 0, despesas: 0 };
      if (grupo.tipo === "entrada") dia.entradas += valor;
      if (grupo.tipo === "despesa") dia.despesas += valor;
      porDia.set(data, dia);
    }

    const entradas = Number(totalEntradas._sum.valor ?? 0);
    const despesas = Number(totalDespesas._sum.valor ?? 0);
    const valorPedidos = Number(entradasDePedidos._sum.valor ?? 0);

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
        pedidos: totalPedidos,
        ticketMedio: totalPedidos > 0 ? valorPedidos / totalPedidos : 0,
        lancamentos: totalLancamentos,
      },
      lancamentos: lancamentos.map(serializarLancamento),
      evolucao,
      despesasPorCategoria: despesasAgrupadas.map((grupo) => ({
        categoria: grupo.categoria,
        valor: Number(grupo._sum?.valor ?? 0),
      })),
      categorias: categoriasRegistradas.map((item) => item.categoria),
      periodo: { inicio, fim },
      paginacao: {
        pagina,
        porPagina,
        total: totalLancamentos,
        totalPaginas: Math.max(1, Math.ceil(totalLancamentos / porPagina)),
      },
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
    const { authenticated } = await requireFinanceAuth();
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

    return NextResponse.json(serializarLancamento(lancamento), { status: 201 });
  } catch (error) {
    console.error("Erro ao criar lançamento:", error);
    return NextResponse.json(
      { erro: "Não foi possível salvar o lançamento" },
      { status: 500 },
    );
  }
}
