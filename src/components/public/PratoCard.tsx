"use client";

import { memo, useState } from "react";
import Image from "next/image";
import { Heart, Plus, Star } from "lucide-react";
import { ProductDetailDialog } from "./ProductDetailDialog";

type IngredienteTag = {
  ingrediente: { id: number; nome: string; alergenico: boolean };
};
type TamanhoType = { tamanho: string; preco: number };

type PratoCardProps = {
  prato: {
    id: number;
    nome: string;
    descricao: string | null;
    preco: number | string;
    imagem: string | null;
    ativo: boolean;
    destaque: boolean;
    ingredientes: IngredienteTag[];
    tamanhos?: TamanhoType[];
    rating?: { avg: number; count: number };
  };
  categoria: {
    id: number;
    nome: string;
    descricao: string | null;
  };
};

const menorPreco = (preco: number | string, tamanhos?: TamanhoType[]) => {
  if (tamanhos?.length) return Math.min(...tamanhos.map((t) => Number(t.preco)));
  return Number(preco);
};

const PratoCardComponent = ({ prato }: PratoCardProps) => {
  const [detailOpen, setDetailOpen] = useState(false);
  const precoBase = menorPreco(prato.preco, prato.tamanhos);

  return (
    <>
      <article className="group relative overflow-hidden rounded-2xl border border-[#eadfd3] bg-white shadow-[0_10px_30px_rgba(57,31,22,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(57,31,22,0.14)]">
        <button
          type="button"
          data-testid={`produto-${prato.id}`}
          aria-label={`Ver detalhes de ${prato.nome}`}
          onClick={() => setDetailOpen(true)}
          className="grid min-h-[164px] w-full grid-cols-[42%_1fr] text-left sm:grid-cols-[220px_1fr]"
        >
          <div className="relative bg-[#fff3e2]">
            {prato.imagem ? (
              <Image
                src={prato.imagem}
                alt={prato.nome}
                fill
                sizes="(max-width: 640px) 42vw, 220px"
                className="object-cover transition duration-500 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <Image
                src="/img/pizzas/placeholder-pizza.svg"
                alt={prato.nome}
                fill
                sizes="(max-width: 640px) 42vw, 220px"
                className="object-contain p-5"
                loading="lazy"
              />
            )}
          </div>

          <div className="flex min-w-0 flex-col p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-2 text-lg font-black leading-tight text-[#241313] sm:text-2xl">
                  {prato.nome}
                </h3>
                <p className="mt-1 line-clamp-3 text-sm leading-5 text-[#6f6461] sm:text-base">
                  {prato.descricao || "Receita especial da casa."}
                </p>
              </div>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[#5b5552] transition group-hover:bg-[#fff3f3] group-hover:text-[#c90010]">
                <Heart className="h-6 w-6" />
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-[#6f6461]">
              {prato.destaque && (
                <span className="rounded-full bg-[#ffe3a0] px-2 py-1 font-bold text-[#9a0007]">
                  Mais pedida
                </span>
              )}
              {prato.tamanhos?.length ? <span>Grande | 8 fatias</span> : null}
              <span className="inline-flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-[#f7b500] text-[#f7b500]" />
                {prato.rating?.avg ? prato.rating.avg.toFixed(1) : "4.8"}
              </span>
            </div>

            <div className="mt-auto flex items-end justify-between gap-2 pt-4">
              <div className="whitespace-nowrap text-xl font-black text-[#c90010] sm:text-3xl">
                R$ {precoBase.toFixed(2).replace(".", ",")}
              </div>
              <span className="inline-flex h-11 shrink-0 items-center gap-1 rounded-xl bg-[#d71920] px-3 text-sm font-black text-white shadow-md transition group-hover:bg-[#b50008] sm:gap-2 sm:px-4">
                <Plus className="h-5 w-5" />
                <span className="hidden min-[430px]:inline">Adicionar</span>
              </span>
            </div>
          </div>
        </button>
      </article>

      <ProductDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        prato={prato}
      />
    </>
  );
};

export const PratoCard = memo(PratoCardComponent);
