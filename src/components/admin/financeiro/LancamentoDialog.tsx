"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { LancamentoFinanceiroDTO, TipoLancamento } from "@/types/financeiro";

const CATEGORIAS_DESPESA = [
  "Ingredientes",
  "Embalagens",
  "Bebidas e estoque",
  "Funcionários",
  "Aluguel",
  "Energia e água",
  "Marketing",
  "Manutenção",
  "Taxas e impostos",
  "Outras despesas",
];

const CATEGORIAS_ENTRADA = [
  "Vendas",
  "Outras entradas",
  "Aporte",
  "Reembolso",
];

type Formulario = {
  tipo: TipoLancamento;
  descricao: string;
  categoria: string;
  valor: string;
  dataCompetencia: string;
  observacoes: string;
};

function dataHojeIso() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function categoriaPadrao(tipo: TipoLancamento, categoriaAtual?: string) {
  const categorias = tipo === "entrada" ? CATEGORIAS_ENTRADA : CATEGORIAS_DESPESA;
  if (categoriaAtual && categorias.includes(categoriaAtual)) return categoriaAtual;
  return tipo === "entrada" ? "Outras entradas" : "Ingredientes";
}

function parseValorMonetario(valor: string) {
  const bruto = valor.trim();
  if (!bruto) return null;

  const normalizado = bruto.includes(",")
    ? bruto.replace(/\./g, "").replace(",", ".")
    : bruto;
  const numero = Number(normalizado);
  if (!Number.isFinite(numero) || numero <= 0) return null;
  return Math.round(numero * 100) / 100;
}

function formularioInicial(lancamento?: LancamentoFinanceiroDTO | null): Formulario {
  const tipo = lancamento?.tipo ?? "despesa";
  return {
    tipo,
    descricao: lancamento?.descricao ?? "",
    categoria: categoriaPadrao(tipo, lancamento?.categoria),
    valor: lancamento ? String(lancamento.valor).replace(".", ",") : "",
    dataCompetencia: lancamento?.dataCompetencia ?? dataHojeIso(),
    observacoes: lancamento?.observacoes ?? "",
  };
}

type LancamentoDialogProps = {
  aberto: boolean;
  lancamento?: LancamentoFinanceiroDTO | null;
  onOpenChange: (aberto: boolean) => void;
  onSalvo: (salvo: { dataCompetencia: string }) => void;
};

export function LancamentoDialog({
  aberto,
  lancamento,
  onOpenChange,
  onSalvo,
}: LancamentoDialogProps) {
  const [form, setForm] = useState<Formulario>(() => formularioInicial(lancamento));
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (aberto) {
      setForm(formularioInicial(lancamento));
      setErro("");
    }
  }, [aberto, lancamento]);

  function alterarTipo(tipo: TipoLancamento) {
    setForm((atual) => ({
      ...atual,
      tipo,
      categoria: categoriaPadrao(tipo, atual.categoria),
    }));
  }

  async function salvar(event: React.FormEvent) {
    event.preventDefault();
    setErro("");

    const descricao = form.descricao.trim();
    const categoria = form.categoria.trim();
    const valor = parseValorMonetario(form.valor);

    if (descricao.length < 2) {
      setErro("Informe uma descrição com pelo menos 2 caracteres.");
      return;
    }
    if (categoria.length < 2) {
      setErro("Informe a categoria do lançamento.");
      return;
    }
    if (valor == null) {
      setErro("Informe um valor válido maior que zero. Ex.: 150,00");
      return;
    }
    if (!form.dataCompetencia) {
      setErro("Informe a data de competência.");
      return;
    }

    setSalvando(true);
    try {
      const url = lancamento
        ? `/api/admin/financeiro/${lancamento.id}`
        : "/api/admin/financeiro";
      const resposta = await fetch(url, {
        method: lancamento ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          tipo: form.tipo,
          descricao,
          categoria,
          valor,
          dataCompetencia: form.dataCompetencia,
          observacoes: form.observacoes.trim() || null,
        }),
      });

      let corpo: { erro?: string } = {};
      try {
        corpo = await resposta.json();
      } catch {
        throw new Error("Não foi possível salvar o lançamento");
      }
      if (!resposta.ok) throw new Error(corpo.erro ?? "Não foi possível salvar");

      toast.success(lancamento ? "Lançamento atualizado" : "Lançamento adicionado");
      onOpenChange(false);
      onSalvo({ dataCompetencia: form.dataCompetencia });
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : "Erro ao salvar lançamento";
      setErro(mensagem);
      toast.error(mensagem);
    } finally {
      setSalvando(false);
    }
  }

  const categorias = form.tipo === "entrada" ? CATEGORIAS_ENTRADA : CATEGORIAS_DESPESA;

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl border-0 p-0 sm:max-w-xl">
        <div className="bg-linear-to-r from-slate-950 via-slate-900 to-orange-950 px-7 py-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl">{lancamento ? "Editar lançamento" : "Novo lançamento"}</DialogTitle>
            <DialogDescription className="text-slate-300">
              Registre uma entrada avulsa ou uma despesa operacional.
            </DialogDescription>
          </DialogHeader>
        </div>
        <form noValidate onSubmit={salvar} className="space-y-5 px-7 pb-7">
          <div className="grid grid-cols-2 gap-3">
            {(["despesa", "entrada"] as const).map((tipo) => (
              <button
                key={tipo}
                type="button"
                onClick={() => alterarTipo(tipo)}
                className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${
                  form.tipo === tipo
                    ? tipo === "entrada"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-rose-500 bg-rose-50 text-rose-700"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                {tipo === "entrada" ? "Entrada" : "Despesa"}
              </button>
            ))}
          </div>
          <Campo label="Descrição">
            <Input
              required
              minLength={2}
              maxLength={200}
              value={form.descricao}
              onChange={(event) => setForm({ ...form, descricao: event.target.value })}
              placeholder={form.tipo === "entrada" ? "Ex.: Recebimento avulso" : "Ex.: Compra semanal de mussarela"}
            />
          </Campo>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo label="Categoria">
              <Input
                required
                list="categorias-financeiras"
                value={form.categoria}
                onChange={(event) => setForm({ ...form, categoria: event.target.value })}
              />
              <datalist id="categorias-financeiras">
                {categorias.map((categoria) => <option key={categoria} value={categoria} />)}
              </datalist>
            </Campo>
            <Campo label="Valor (R$)">
              <Input
                required
                type="text"
                inputMode="decimal"
                value={form.valor}
                onChange={(event) => setForm({ ...form, valor: event.target.value })}
                placeholder="0,00"
              />
            </Campo>
          </div>
          <Campo label="Data de competência">
            <Input required type="date" value={form.dataCompetencia} onChange={(event) => setForm({ ...form, dataCompetencia: event.target.value })} />
          </Campo>
          <Campo label="Observações (opcional)">
            <Textarea rows={3} maxLength={1000} value={form.observacoes} onChange={(event) => setForm({ ...form, observacoes: event.target.value })} placeholder="Fornecedor, forma de pagamento ou referência..." />
          </Campo>
          {erro && (
            <div role="alert" className="flex gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {erro}
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={salvando} className="bg-orange-600 hover:bg-orange-700">
              {salvando && <Loader2 className="animate-spin" />}
              {salvando ? "Salvando..." : "Salvar lançamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2 text-sm font-semibold text-slate-700">
      <span>{label}</span>
      {children}
    </label>
  );
}
