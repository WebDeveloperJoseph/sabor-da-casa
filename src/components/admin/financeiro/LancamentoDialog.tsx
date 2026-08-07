"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
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

type Formulario = {
  tipo: TipoLancamento;
  descricao: string;
  categoria: string;
  valor: string;
  dataCompetencia: string;
  observacoes: string;
};

function formularioInicial(lancamento?: LancamentoFinanceiroDTO | null): Formulario {
  return {
    tipo: lancamento?.tipo ?? "despesa",
    descricao: lancamento?.descricao ?? "",
    categoria: lancamento?.categoria ?? "Ingredientes",
    valor: lancamento ? String(lancamento.valor) : "",
    dataCompetencia: lancamento?.dataCompetencia ?? new Date().toISOString().slice(0, 10),
    observacoes: lancamento?.observacoes ?? "",
  };
}

type LancamentoDialogProps = {
  aberto: boolean;
  lancamento?: LancamentoFinanceiroDTO | null;
  onOpenChange: (aberto: boolean) => void;
  onSalvo: () => void;
};

export function LancamentoDialog({
  aberto,
  lancamento,
  onOpenChange,
  onSalvo,
}: LancamentoDialogProps) {
  const [form, setForm] = useState<Formulario>(() => formularioInicial(lancamento));
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (aberto) setForm(formularioInicial(lancamento));
  }, [aberto, lancamento]);

  async function salvar(event: React.FormEvent) {
    event.preventDefault();
    setSalvando(true);
    try {
      const url = lancamento
        ? `/api/admin/financeiro/${lancamento.id}`
        : "/api/admin/financeiro";
      const resposta = await fetch(url, {
        method: lancamento ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, valor: Number(form.valor) }),
      });
      const corpo = await resposta.json();
      if (!resposta.ok) throw new Error(corpo.erro ?? "Não foi possível salvar");

      toast.success(lancamento ? "Lançamento atualizado" : "Lançamento adicionado");
      onOpenChange(false);
      onSalvo();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar lançamento");
    } finally {
      setSalvando(false);
    }
  }

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
        <form onSubmit={salvar} className="space-y-5 px-7 pb-7">
          <div className="grid grid-cols-2 gap-3">
            {(["despesa", "entrada"] as const).map((tipo) => (
              <button
                key={tipo}
                type="button"
                onClick={() => setForm((atual) => ({ ...atual, tipo }))}
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
            <Input required minLength={2} maxLength={200} value={form.descricao} onChange={(event) => setForm({ ...form, descricao: event.target.value })} placeholder="Ex.: Compra semanal de mussarela" />
          </Campo>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo label="Categoria">
              <Input required list="categorias-financeiras" value={form.categoria} onChange={(event) => setForm({ ...form, categoria: event.target.value })} />
              <datalist id="categorias-financeiras">
                {CATEGORIAS_DESPESA.map((categoria) => <option key={categoria} value={categoria} />)}
                <option value="Outras entradas" />
              </datalist>
            </Campo>
            <Campo label="Valor (R$)">
              <Input required type="number" min="0.01" step="0.01" value={form.valor} onChange={(event) => setForm({ ...form, valor: event.target.value })} placeholder="0,00" />
            </Campo>
          </div>
          <Campo label="Data de competência">
            <Input required type="date" value={form.dataCompetencia} onChange={(event) => setForm({ ...form, dataCompetencia: event.target.value })} />
          </Campo>
          <Campo label="Observações (opcional)">
            <Textarea rows={3} maxLength={1000} value={form.observacoes} onChange={(event) => setForm({ ...form, observacoes: event.target.value })} placeholder="Fornecedor, forma de pagamento ou referência..." />
          </Campo>
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
