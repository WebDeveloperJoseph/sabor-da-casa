import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

function dataCompetenciaDoPedido(data: Date) {
  const dataLocal = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(data);
  return dataUtc(dataLocal);
}

export async function sincronizarPedidos() {
  // Um pedido cancelado não representa receita, mesmo que tenha sido
  // contabilizado antes da mudança de status.
  await prisma.lancamentoFinanceiro.deleteMany({
    where: {
      origem: "pedido",
      pedido: { is: { status: "cancelado" } },
    },
  });

  const pedidosSemLancamento = await prisma.pedido.findMany({
    where: {
      status: { not: "cancelado" },
      lancamentoFinanceiro: null,
    },
    select: {
      id: true,
      valorTotal: true,
      createdAt: true,
    },
  });

  if (pedidosSemLancamento.length === 0) return;

  await prisma.lancamentoFinanceiro.createMany({
    data: pedidosSemLancamento.map((pedido) => ({
      tipo: "entrada",
      origem: "pedido",
      descricao: `Pedido #${pedido.id}`,
      categoria: "Vendas",
      valor: pedido.valorTotal,
      dataCompetencia: dataCompetenciaDoPedido(pedido.createdAt),
      pedidoId: pedido.id,
    })),
    skipDuplicates: true,
  });
}

export async function registrarReceitaDoPedido(
  tx: Prisma.TransactionClient,
  pedido: { id: number; valorTotal: Prisma.Decimal; createdAt: Date },
) {
  await tx.lancamentoFinanceiro.upsert({
    where: { pedidoId: pedido.id },
    create: {
      tipo: "entrada",
      origem: "pedido",
      descricao: `Pedido #${pedido.id}`,
      categoria: "Vendas",
      valor: pedido.valorTotal,
      dataCompetencia: dataCompetenciaDoPedido(pedido.createdAt),
      pedidoId: pedido.id,
    },
    update: {
      valor: pedido.valorTotal,
      descricao: `Pedido #${pedido.id}`,
      dataCompetencia: dataCompetenciaDoPedido(pedido.createdAt),
    },
  });
}

export async function removerReceitaDoPedido(
  tx: Prisma.TransactionClient,
  pedidoId: number,
) {
  await tx.lancamentoFinanceiro.deleteMany({
    where: { pedidoId, origem: "pedido" },
  });
}

export function dataUtc(data: string): Date {
  return new Date(`${data}T00:00:00.000Z`);
}

export function adicionarDias(data: Date, dias: number): Date {
  const resultado = new Date(data);
  resultado.setUTCDate(resultado.getUTCDate() + dias);
  return resultado;
}

export function formatarDataIso(data: Date): string {
  return data.toISOString().slice(0, 10);
}

export function serializarLancamento(item: {
  id: number;
  tipo: string;
  origem: string;
  descricao: string;
  categoria: string;
  valor: { toString(): string } | number;
  dataCompetencia: Date;
  observacoes: string | null;
  pedidoId: number | null;
}) {
  return {
    id: item.id,
    tipo: item.tipo,
    origem: item.origem,
    descricao: item.descricao,
    categoria: item.categoria,
    valor: Number(item.valor),
    dataCompetencia: formatarDataIso(item.dataCompetencia),
    observacoes: item.observacoes,
    pedidoId: item.pedidoId,
  };
}

export function parseValorLancamento(valor: unknown) {
  if (typeof valor === "number") {
    return Number.isFinite(valor) ? valor : Number.NaN;
  }
  if (typeof valor !== "string") return Number.NaN;

  const bruto = valor.trim();
  if (!bruto) return Number.NaN;

  const normalizado = bruto.includes(",")
    ? bruto.replace(/\./g, "").replace(",", ".")
    : bruto;
  const numero = Number(normalizado);
  return Number.isFinite(numero) ? numero : Number.NaN;
}
