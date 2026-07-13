"use client";

import { useState } from "react";
import { ChevronRight, Pizza } from "lucide-react";
import { MonteSuaPizzaDialog } from "./MonteSuaPizzaDialog";

type PratoTamanho = {
  id: number;
  pratoId: number;
  tamanho: string;
  preco: number;
};

type Prato = {
  id: number;
  nome: string;
  preco: number;
  descricao?: string | null;
  imagem?: string | null;
  tamanhos: PratoTamanho[];
};

type Props = {
  pizzas: Prato[];
  bordasExtras: Array<{ id: number; nome: string; preco: number }>;
  bebidas: Array<{ id: number; nome: string; preco: number }>;
};

export function MonteSuaPizzaButton({ pizzas, bordasExtras, bebidas }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        data-testid="monte-sua-pizza"
        aria-label="Abrir montagem de pizza personalizada"
        onClick={() => setOpen(true)}
        className="flex w-full max-w-3xl cursor-pointer items-center gap-4 rounded-2xl border border-[#ffd15a] bg-linear-to-r from-[#ffd15a] to-[#ffc329] p-4 text-left text-[#2b1212] shadow-[0_12px_28px_rgba(127,41,0,0.16)] transition hover:-translate-y-0.5 hover:shadow-2xl"
      >
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#b50008] text-white shadow-lg">
          <Pizza className="h-7 w-7" />
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block text-base font-black sm:text-lg">
            Monte sua pizza
          </span>
          <span className="mt-1 block text-xs font-semibold leading-4 text-[#7a2900] sm:text-sm">
            P/M ate 2 sabores • G ate 2 sabores
          </span>
        </span>
        <ChevronRight className="h-6 w-6 shrink-0" />
      </button>

      <MonteSuaPizzaDialog
        open={open}
        onOpenChange={setOpen}
        pizzas={pizzas}
        bordasExtras={bordasExtras}
        bebidas={bebidas}
      />
    </>
  );
}
