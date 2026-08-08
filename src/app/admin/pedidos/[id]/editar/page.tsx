import { notFound } from "next/navigation";

import { EditarPedidoForm } from "@/components/admin/EditarPedidoForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditarPedidoPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
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

  const somaItens = pedido.itens.reduce((total, item) => total + Number(item.subtotal), 0);
  const taxaEntrega = Math.max(0, Number(pedido.valorTotal) - somaItens);

  return (
    <EditarPedidoForm
      pedido={{
        id: pedido.id,
        nomeCliente: pedido.nomeCliente,
        telefone: pedido.telefone ?? "",
        endereco: pedido.endereco ?? "",
        observacoes: pedido.observacoes ?? "",
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
