"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Loader2, Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Produto = {
  id: number;
  nome: string;
  preco: number;
  tamanhos: Array<{ tamanho: string; preco: number }>;
};

type ItemEditavel = {
  chave: string;
  id?: number;
  pratoId: number;
  originalPratoId?: number;
  quantidade: number;
  tamanho: string;
  originalTamanho?: string;
  observacoes: string;
  precoAtual?: number;
  bordaNome?: string | null;
};

type PedidoEditavel = {
  id: number;
  nomeCliente: string;
  telefone: string;
  endereco: string;
  observacoes: string;
  dataPedido: string;
  taxaEntrega: number;
  itens: ItemEditavel[];
};

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function EditarPedidoForm({
  pedido,
  produtos,
  retorno,
}: {
  pedido: PedidoEditavel;
  produtos: Produto[];
  retorno?: string;
}) {
  const [form, setForm] = useState(pedido);
  const [salvando, setSalvando] = useState(false);
  const voltarHref = retorno === "financeiro" ? "/admin/financeiro" : "/admin/pedidos";

  const totalEstimado = useMemo(() => {
    const subtotalItens = form.itens.reduce((total, item) => {
      const produto = produtos.find((opcao) => opcao.id === item.pratoId);
      const semTroca = item.id && item.pratoId === item.originalPratoId && item.tamanho === (item.originalTamanho ?? "");
      const preco = semTroca
        ? item.precoAtual ?? 0
        : produto?.tamanhos.find((opcao) => opcao.tamanho === item.tamanho)?.preco ?? produto?.preco ?? item.precoAtual ?? 0;
      return total + preco * item.quantidade;
    }, 0);
    return subtotalItens + Number(form.taxaEntrega || 0);
  }, [form.itens, form.taxaEntrega, produtos]);

  function alterarItem(chave: string, alteracao: Partial<ItemEditavel>) {
    setForm((atual) => ({
      ...atual,
      itens: atual.itens.map((item) => item.chave === chave ? { ...item, ...alteracao } : item),
    }));
  }

  function trocarProduto(chave: string, pratoId: number) {
    const produto = produtos.find((item) => item.id === pratoId);
    alterarItem(chave, {
      pratoId,
      tamanho: produto?.tamanhos[0]?.tamanho ?? "",
      bordaNome: null,
    });
  }

  function adicionarItem() {
    const produto = produtos[0];
    if (!produto) return;
    setForm((atual) => ({
      ...atual,
      itens: [...atual.itens, {
        chave: crypto.randomUUID(),
        pratoId: produto.id,
        quantidade: 1,
        tamanho: produto.tamanhos[0]?.tamanho ?? "",
        observacoes: "",
      }],
    }));
  }

  function removerItem(chave: string) {
    if (form.itens.length === 1) {
      toast.error("O pedido precisa ter pelo menos um item");
      return;
    }
    setForm((atual) => ({ ...atual, itens: atual.itens.filter((item) => item.chave !== chave) }));
  }

  async function salvar(event: React.FormEvent) {
    event.preventDefault();
    setSalvando(true);
    try {
      const resposta = await fetch(`/api/pedidos/${pedido.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomeCliente: form.nomeCliente,
          telefone: form.telefone || null,
          endereco: form.endereco,
          observacoes: form.observacoes || null,
          dataPedido: form.dataPedido,
          taxaEntrega: Number(form.taxaEntrega || 0),
          itens: form.itens.map((item) => ({
            id: item.id,
            pratoId: item.pratoId,
            quantidade: item.quantidade,
            tamanho: item.tamanho || null,
            observacoes: item.observacoes || null,
          })),
        }),
      });
      const corpo = await resposta.json();
      if (!resposta.ok) throw new Error(corpo.erro ?? "Não foi possível salvar");
      toast.success("Pedido atualizado com sucesso");
      window.location.assign(voltarHref);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao editar pedido");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={salvar} className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl bg-slate-950 p-6 text-white shadow-xl sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href={voltarHref} className="mb-3 inline-flex items-center text-sm font-semibold text-slate-300 hover:text-white"><ArrowLeft className="mr-1 h-4 w-4" /> Voltar</Link>
          <h1 className="text-3xl font-black">Editar pedido #{pedido.id}</h1>
          <p className="mt-1 text-sm text-slate-300">Altere nome, produtos, data e taxa de entrega. As mudanças refletem no financeiro.</p>
        </div>
        <div className="rounded-2xl bg-white/10 px-5 py-3 text-right">
          <p className="text-xs font-bold uppercase text-slate-300">Novo total estimado</p>
          <p className="text-2xl font-black text-emerald-300">{moeda.format(totalEstimado)}</p>
        </div>
      </div>

      <section className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2 md:p-6">
        <h2 className="md:col-span-2 text-lg font-black text-slate-900">Dados do pedido</h2>
        <Campo label="Nome do cliente"><Input value={form.nomeCliente} onChange={(event) => setForm({ ...form, nomeCliente: event.target.value })} required minLength={3} /></Campo>
        <Campo label="Telefone"><Input value={form.telefone} onChange={(event) => setForm({ ...form, telefone: event.target.value })} /></Campo>
        <Campo label="Endereço" className="md:col-span-2"><Input value={form.endereco} onChange={(event) => setForm({ ...form, endereco: event.target.value })} required minLength={5} /></Campo>
        <Campo label="Data do pedido"><Input type="datetime-local" value={form.dataPedido} onChange={(event) => setForm({ ...form, dataPedido: event.target.value })} required /></Campo>
        <Campo label="Taxa de entrega (R$)"><Input type="number" min={0} step="0.01" value={form.taxaEntrega} onChange={(event) => setForm({ ...form, taxaEntrega: Number(event.target.value) })} /></Campo>
        <Campo label="Observações do pedido" className="md:col-span-2">
          <textarea value={form.observacoes} onChange={(event) => setForm({ ...form, observacoes: event.target.value })} rows={3} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400" />
        </Campo>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div><h2 className="text-lg font-black text-slate-900">Itens do pedido</h2><p className="text-sm text-slate-500">Trocar o produto ou tamanho remove os extras anteriores daquele item.</p></div>
          <Button type="button" variant="outline" onClick={adicionarItem}><Plus /> Adicionar item</Button>
        </div>
        <div className="space-y-4">
          {form.itens.map((item, index) => {
            const produto = produtos.find((opcao) => opcao.id === item.pratoId);
            return (
              <article key={item.chave} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <div className="mb-3 flex items-center justify-between"><strong className="text-slate-800">Item {index + 1}</strong><Button type="button" variant="ghost" size="icon-sm" onClick={() => removerItem(item.chave)} className="text-rose-600"><Trash2 /></Button></div>
                <div className="grid gap-3 md:grid-cols-[2fr_1fr_0.7fr]">
                  <Campo label="Produto">
                    <select value={item.pratoId} onChange={(event) => trocarProduto(item.chave, Number(event.target.value))} className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm">
                      {!produtos.some((produto) => produto.id === item.pratoId) && <option value={item.pratoId}>Produto personalizado atual</option>}
                      {produtos.map((opcao) => <option key={opcao.id} value={opcao.id}>{opcao.nome}</option>)}
                    </select>
                  </Campo>
                  <Campo label="Tamanho">
                    <select value={item.tamanho} onChange={(event) => alterarItem(item.chave, { tamanho: event.target.value })} disabled={!produto?.tamanhos.length} className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm disabled:bg-slate-100">
                      {!produto?.tamanhos.length ? <option value="">Padrão</option> : produto.tamanhos.map((opcao) => <option key={opcao.tamanho} value={opcao.tamanho}>{opcao.tamanho}</option>)}
                    </select>
                  </Campo>
                  <Campo label="Quantidade"><Input type="number" min={1} max={99} value={item.quantidade} onChange={(event) => alterarItem(item.chave, { quantidade: Math.max(1, Number(event.target.value)) })} /></Campo>
                </div>
                {item.bordaNome && <p className="mt-2 text-xs font-semibold text-amber-700">Borda preservada: {item.bordaNome}</p>}
                <Campo label="Observações do item" className="mt-3"><Input value={item.observacoes} onChange={(event) => alterarItem(item.chave, { observacoes: event.target.value })} placeholder="Ex.: sem cebola, adicionais..." /></Campo>
              </article>
            );
          })}
        </div>
      </section>

      <div className="sticky bottom-4 flex justify-end">
        <Button type="submit" disabled={salvando} className="h-12 bg-linear-to-r from-orange-500 to-red-500 px-7 font-black text-white shadow-xl">
          {salvando ? <><Loader2 className="animate-spin" /> Salvando...</> : <><Save /> Salvar alterações</>}
        </Button>
      </div>
    </form>
  );
}

function Campo({ label, className = "", children }: { label: string; className?: string; children: React.ReactNode }) {
  return <label className={`block text-sm font-bold text-slate-700 ${className}`}><span className="mb-1.5 block">{label}</span>{children}</label>;
}
