import { notFound } from "next/navigation";

import { EditarPedidoForm } from "@/components/admin/EditarPedidoForm";
import { prisma } from "@/lib/prisma";
import { calcularSubtotalItens, calcularTaxaEntrega } from "@/lib/pedidoTotais";

export const dynamic = "force-dynamic";

function toDatetimeLocal(value: Date) {
  const data = new Date(value);
  const offset = data.getTimezoneOffset() * 60000;
  return new Date(data.getTime() - offset).toISOString().slice(0, 16);
}

export default async function EditarPedidoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ retorno?: string }>;
}) {
  const id = Number((await params).id);
  const retorno = (await searchParams).retorno;
  if (!Number.isInteger(id) || id <= 0) notFound();

  const [pedido, produtos] = await prisma.$transaction([
    prisma.pedido.findUnique({ where: { id }, include: { itens: true } }),
    prisma.prato.findMany({
      where: {
        ativo: true,
        id: { not: 999 },
        categoria: { nome: { not: { contains: "Bordas" } } },
      },
      include: { tamanhos: { where: { ativo: true }, orderBy: { preco: "asc" } } },
      orderBy: { nome: "asc" },
    }),
  ]);
  if (!pedido) notFound();

  const somaItens = calcularSubtotalItens(pedido.itens);
  const taxaEntrega = calcularTaxaEntrega(pedido.valorTotal, somaItens);

  return (
    <EditarPedidoForm
      retorno={retorno}
      pedido={{
        id: pedido.id,
        nomeCliente: pedido.nomeCliente,
        telefone: pedido.telefone ?? "",
        endereco: pedido.endereco ?? "",
        observacoes: pedido.observacoes ?? "",
        dataPedido: toDatetimeLocal(pedido.createdAt),
        taxaEntrega,
        itens: pedido.itens.map((item) => ({
          chave: String(item.id),
          id: item.id,
          pratoId: item.pratoId,
          originalPratoId: item.pratoId,
          quantidade: item.quantidade,
          tamanho: item.tamanho ?? "",
          originalTamanho: item.tamanho ?? "",
          observacoes: item.observacoes ?? "",
          precoAtual: Number(item.precoUnit),
          bordaNome: item.bordaNome,
        })),
      }}
      produtos={produtos.map((produto) => ({
        id: produto.id,
        nome: produto.nome,
        preco: Number(produto.preco),
        tamanhos: produto.tamanhos.map((tamanho) => ({ tamanho: tamanho.tamanho, preco: Number(tamanho.preco) })),
      }))}
    />
  );
}
