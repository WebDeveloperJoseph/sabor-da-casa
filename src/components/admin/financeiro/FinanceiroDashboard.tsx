"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  Trash2,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { FinanceiroResponse, LancamentoFinanceiroDTO } from "@/types/financeiro";

import { exportarFinanceiroCsv, exportarFinanceiroPdf } from "./exportar-relatorio";
import { GraficoCategorias, GraficoEvolucao } from "./GraficosFinanceiros";
import { LancamentoDialog } from "./LancamentoDialog";

type Filtros = {
  inicio: string;
  fim: string;
  tipo: string;
  categoria: string;
  busca: string;
};

function filtrosIniciais(): Filtros {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const ultimoDia = new Date(ano, agora.getMonth() + 1, 0).getDate();
  return {
    inicio: `${ano}-${mes}-01`,
    fim: `${ano}-${mes}-${String(ultimoDia).padStart(2, "0")}`,
    tipo: "todos",
    categoria: "todas",
    busca: "",
  };
}

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function FinanceiroDashboard() {
  const [filtros, setFiltros] = useState<Filtros>(filtrosIniciais);
  const [filtrosAplicados, setFiltrosAplicados] = useState<Filtros>(filtrosIniciais);
  const [dados, setDados] = useState<FinanceiroResponse | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [exportando, setExportando] = useState(false);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [editando, setEditando] = useState<LancamentoFinanceiroDTO | null>(null);
  const [pagina, setPagina] = useState(1);
  const porPagina = 25;

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const params = new URLSearchParams(filtrosAplicados);
      params.set("pagina", String(pagina));
      params.set("porPagina", String(porPagina));
      const resposta = await fetch(`/api/admin/financeiro?${params}`, { cache: "no-store" });
      const corpo = await resposta.json();
      if (!resposta.ok) throw new Error(corpo.erro ?? "Não foi possível carregar os dados");
      if (pagina > corpo.paginacao.totalPaginas) {
        setPagina(corpo.paginacao.totalPaginas);
        return;
      }
      setDados(corpo);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao carregar financeiro");
    } finally {
      setCarregando(false);
    }
  }, [filtrosAplicados, pagina]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function excluir(lancamento: LancamentoFinanceiroDTO) {
    if (!window.confirm(`Excluir o lançamento “${lancamento.descricao}”?`)) return;
    try {
      const resposta = await fetch(`/api/admin/financeiro/${lancamento.id}`, { method: "DELETE" });
      const corpo = await resposta.json();
      if (!resposta.ok) throw new Error(corpo.erro ?? "Não foi possível excluir");
      toast.success("Lançamento excluído");
      await carregar();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao excluir");
    }
  }

  async function carregarDadosParaExportacao() {
    const params = new URLSearchParams(filtrosAplicados);
    params.set("exportar", "todos");
    const resposta = await fetch(`/api/admin/financeiro?${params}`, { cache: "no-store" });
    const corpo = await resposta.json();
    if (!resposta.ok) throw new Error(corpo.erro ?? "Não foi possível preparar o relatório");
    return corpo as FinanceiroResponse;
  }

  async function gerarPdf() {
    setExportando(true);
    try {
      await exportarFinanceiroPdf(await carregarDadosParaExportacao());
      toast.success("Relatório PDF gerado");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível gerar o PDF");
    } finally {
      setExportando(false);
    }
  }

  async function gerarCsv() {
    setExportando(true);
    try {
      exportarFinanceiroCsv(await carregarDadosParaExportacao());
      toast.success("Relatório CSV gerado");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível gerar o CSV");
    } finally {
      setExportando(false);
    }
  }

  return (
    <div className="space-y-6 pb-10">
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-7 text-white shadow-2xl shadow-slate-900/10 md:px-8">
        <div className="absolute -right-20 -top-32 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-orange-200">
              <WalletCards className="h-3.5 w-3.5" /> Controle financeiro
            </div>
            <h1 className="text-3xl font-black tracking-tight md:text-4xl">Gestão financeira</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300 md:text-base">
              Receitas de pedidos, despesas operacionais e resultado mensal em um único lugar.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={gerarCsv} disabled={!dados || exportando} className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white">
              <FileSpreadsheet /> Excel/CSV
            </Button>
            <Button variant="outline" onClick={gerarPdf} disabled={!dados || exportando} className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white">
              {exportando ? <Loader2 className="animate-spin" /> : <Download />} PDF
            </Button>
            <Button onClick={() => { setEditando(null); setDialogAberto(true); }} className="bg-orange-500 text-white hover:bg-orange-600">
              <Plus /> Novo lançamento
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <form
          className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_1fr_1.4fr_auto]"
          onSubmit={(event) => { event.preventDefault(); setPagina(1); setFiltrosAplicados(filtros); }}
        >
          <Filtro label="Data inicial"><Input type="date" value={filtros.inicio} onChange={(event) => setFiltros({ ...filtros, inicio: event.target.value })} /></Filtro>
          <Filtro label="Data final"><Input type="date" value={filtros.fim} onChange={(event) => setFiltros({ ...filtros, fim: event.target.value })} /></Filtro>
          <Filtro label="Movimento">
            <select value={filtros.tipo} onChange={(event) => setFiltros({ ...filtros, tipo: event.target.value })} className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-orange-500/30">
              <option value="todos">Todos</option><option value="entrada">Entradas</option><option value="despesa">Despesas</option>
            </select>
          </Filtro>
          <Filtro label="Categoria">
            <select value={filtros.categoria} onChange={(event) => setFiltros({ ...filtros, categoria: event.target.value })} className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-orange-500/30">
              <option value="todas">Todas</option>
              {dados?.categorias.map((categoria) => <option key={categoria} value={categoria}>{categoria}</option>)}
            </select>
          </Filtro>
          <Filtro label="Pesquisar">
            <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={filtros.busca} onChange={(event) => setFiltros({ ...filtros, busca: event.target.value })} className="pl-9" placeholder="Descrição, categoria..." /></div>
          </Filtro>
          <Button type="submit" className="mt-auto bg-slate-900 hover:bg-slate-800"><CalendarRange /> Aplicar</Button>
        </form>
      </section>

      {carregando && !dados ? <Carregando /> : dados && (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi titulo="Entradas" valor={moeda.format(dados.resumo.entradas)} detalhe={`${dados.resumo.pedidos} pedidos registrados`} icone={ArrowUpRight} cor="emerald" />
            <Kpi titulo="Despesas" valor={moeda.format(dados.resumo.despesas)} detalhe="Custos do período" icone={ArrowDownRight} cor="rose" />
            <Kpi titulo="Resultado líquido" valor={moeda.format(dados.resumo.saldo)} detalhe={dados.resumo.saldo >= 0 ? "Saldo positivo" : "Atenção ao caixa"} icone={TrendingUp} cor={dados.resumo.saldo >= 0 ? "blue" : "rose"} />
            <Kpi titulo="Ticket médio" valor={moeda.format(dados.resumo.ticketMedio)} detalhe={`${dados.resumo.lancamentos} movimentações`} icone={ShoppingBag} cor="orange" />
          </section>

          <section className="grid gap-5 xl:grid-cols-[1.7fr_1fr]">
            <Painel titulo="Fluxo financeiro" subtitulo="Entradas e despesas ao longo do período" legenda>
              <GraficoEvolucao dados={dados.evolucao} />
            </Painel>
            <Painel titulo="Despesas por categoria" subtitulo="Principais destinos do caixa">
              <GraficoCategorias dados={dados.despesasPorCategoria} />
            </Painel>
          </section>

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between md:px-6">
              <div><h2 className="text-lg font-black text-slate-900">Livro-caixa</h2><p className="text-sm text-slate-500">{dados.lancamentos.length} lançamentos encontrados</p></div>
              <Button variant="outline" size="sm" onClick={carregar} disabled={carregando}><RefreshCw className={carregando ? "animate-spin" : ""} /> Atualizar</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-6 py-4">Data</th><th className="px-4 py-4">Movimento</th><th className="px-4 py-4">Descrição</th><th className="px-4 py-4">Categoria</th><th className="px-4 py-4 text-right">Valor</th><th className="px-6 py-4 text-right">Ações</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {dados.lancamentos.map((item) => (
                    <tr key={item.id} className="transition hover:bg-slate-50/70">
                      <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-600">{formatarData(item.dataCompetencia)}</td>
                      <td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${item.tipo === "entrada" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{item.tipo === "entrada" ? "Entrada" : "Despesa"}</span></td>
                      <td className="px-4 py-4"><div className="font-bold text-slate-800">{item.descricao}</div><div className="mt-0.5 text-xs text-slate-400">{item.origem === "pedido" ? "Automático" : item.observacoes || "Manual"}</div></td>
                      <td className="px-4 py-4 text-slate-600">{item.categoria}</td>
                      <td className={`px-4 py-4 text-right font-black ${item.tipo === "entrada" ? "text-emerald-600" : "text-rose-600"}`}>{item.tipo === "entrada" ? "+" : "-"} {moeda.format(item.valor)}</td>
                      <td className="px-6 py-4"><div className="flex justify-end gap-1">{item.origem === "manual" ? <><Button variant="ghost" size="icon-sm" title="Editar" onClick={() => { setEditando(item); setDialogAberto(true); }}><Pencil /></Button><Button variant="ghost" size="icon-sm" title="Excluir" className="text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => excluir(item)}><Trash2 /></Button></> : <span className="text-xs font-medium text-slate-400">Protegido</span>}</div></td>
                    </tr>
                  ))}
                  {dados.lancamentos.length === 0 && <tr><td colSpan={6} className="px-6 py-16 text-center text-slate-500">Nenhuma movimentação encontrada com estes filtros.</td></tr>}
                </tbody>
              </table>
            </div>
            {dados.paginacao.total > 0 && (
              <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
                <p className="text-sm text-slate-500">
                  Exibindo <strong className="text-slate-700">{(dados.paginacao.pagina - 1) * dados.paginacao.porPagina + 1}</strong> a{" "}
                  <strong className="text-slate-700">{Math.min(dados.paginacao.pagina * dados.paginacao.porPagina, dados.paginacao.total)}</strong> de{" "}
                  <strong className="text-slate-700">{dados.paginacao.total}</strong> lançamentos
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPagina((atual) => Math.max(1, atual - 1))} disabled={carregando || dados.paginacao.pagina <= 1}>
                    <ChevronLeft /> Anterior
                  </Button>
                  <span className="min-w-24 text-center text-sm font-bold text-slate-700">
                    {dados.paginacao.pagina} de {dados.paginacao.totalPaginas}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => setPagina((atual) => Math.min(dados.paginacao.totalPaginas, atual + 1))} disabled={carregando || dados.paginacao.pagina >= dados.paginacao.totalPaginas}>
                    Próxima <ChevronRight />
                  </Button>
                </div>
              </div>
            )}
          </section>
        </>
      )}

      <LancamentoDialog aberto={dialogAberto} lancamento={editando} onOpenChange={setDialogAberto} onSalvo={carregar} />
    </div>
  );
}

function Kpi({ titulo, valor, detalhe, icone: Icone, cor }: { titulo: string; valor: string; detalhe: string; icone: React.ElementType; cor: "emerald" | "rose" | "blue" | "orange" }) {
  const cores = { emerald: "bg-emerald-50 text-emerald-600", rose: "bg-rose-50 text-rose-600", blue: "bg-blue-50 text-blue-600", orange: "bg-orange-50 text-orange-600" };
  return <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{titulo}</p><p className="mt-3 text-2xl font-black tracking-tight text-slate-900">{valor}</p><p className="mt-2 text-xs text-slate-500">{detalhe}</p></div><div className={`rounded-2xl p-3 ${cores[cor]}`}><Icone className="h-5 w-5" /></div></div></article>;
}

function Painel({ titulo, subtitulo, legenda = false, children }: { titulo: string; subtitulo: string; legenda?: boolean; children: React.ReactNode }) {
  return <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6"><div className="mb-4 flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-black text-slate-900">{titulo}</h2><p className="mt-1 text-sm text-slate-500">{subtitulo}</p></div>{legenda && <div className="flex gap-4 text-xs font-semibold text-slate-500"><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Entradas</span><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-rose-500" />Despesas</span></div>}</div>{children}</article>;
}

function Filtro({ label, children }: { label: string; children: React.ReactNode }) { return <label className="space-y-1.5 text-xs font-bold text-slate-500"><span>{label}</span>{children}</label>; }
function Carregando() { return <div className="flex min-h-80 items-center justify-center rounded-3xl bg-white"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>; }
function formatarData(data: string) { return new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR"); }
