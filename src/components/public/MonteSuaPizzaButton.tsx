"use client";

import { useState } from "react";
import { Pizza } from "lucide-react";
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
};

export function MonteSuaPizzaButton({ pizzas }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full md:w-auto px-6 py-4 bg-linear-to-r from-orange-500 to-red-500 text-white rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3 border-2 border-white cursor-pointer"
      >
        <Pizza className="w-6 h-6 shrink-0" />
        <div className="flex flex-col items-start leading-tight text-left">
          <span className="text-base sm:text-lg font-bold">
            Monte sua Pizza
          </span>
          <span className="text-[11px] sm:text-xs text-orange-100">
            P/M até 2 sabores • G até 2 sabores
          </span>
        </div>
      </button>

      <MonteSuaPizzaDialog open={open} onOpenChange={setOpen} pizzas={pizzas} />
    </>
  );
}
