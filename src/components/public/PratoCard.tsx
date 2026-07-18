"use client";

import { memo, useEffect, useRef, useState } from "react";
import { Heart, Plus, Star } from "lucide-react";
import { ProductDetailDialog } from "./ProductDetailDialog";

type IngredienteTag = {
  ingrediente: { id: number; nome: string; alergenico: boolean };
};
type TamanhoType = { tamanho: string; preco: number };
type BordaExtraOption = { id: number; nome: string; preco: number };

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
  bordasExtras: BordaExtraOption[];
  animationDelay?: number;
  isFavorite?: boolean;
  onToggleFavorite?: (pratoId: number) => void;
};

const menorPreco = (preco: number | string, tamanhos?: TamanhoType[]) => {
  if (tamanhos?.length)
    return Math.min(...tamanhos.map((t) => Number(t.preco)));
  return Number(preco);
};

const PratoCardComponent = ({
  prato,
  categoria,
  bordasExtras,
  animationDelay = 0,
  isFavorite,
  onToggleFavorite,
}: PratoCardProps) => {
  const [detailOpen, setDetailOpen] = useState(false);
  const [localFavorite, setLocalFavorite] = useState(false);
  const [heartBurst, setHeartBurst] = useState(0);
  const [plusPulse, setPlusPulse] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [imageSrc, setImageSrc] = useState(
    prato.imagem || "/img/pizzas/placeholder-pizza.svg",
  );
  const cardRef = useRef<HTMLElement | null>(null);
  const precoBase = menorPreco(prato.preco, prato.tamanhos);

  useEffect(() => {
    setImageSrc(prato.imagem || "/img/pizzas/placeholder-pizza.svg");
  }, [prato.imagem]);
  const favorite = isFavorite ?? localFavorite;
  const delayClass =
    animationDelay <= 0
      ? ""
      : animationDelay <= 90
        ? "anim-d-90"
        : animationDelay <= 135
          ? "anim-d-135"
          : animationDelay <= 180
            ? "anim-d-180"
            : animationDelay <= 225
              ? "anim-d-225"
              : "anim-d-240";

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.16 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const triggerFavorite = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    if (onToggleFavorite) {
      onToggleFavorite(prato.id);
    } else {
      setLocalFavorite((value) => !value);
    }
    setHeartBurst((value) => value + 1);
  };

  const handleOpenDetail = () => {
    setPlusPulse(true);
    window.setTimeout(() => setPlusPulse(false), 280);
    setDetailOpen(true);
  };

  return (
    <>
      <article
        ref={cardRef}
        className={`group relative overflow-hidden rounded-2xl border border-[#eadfd3] bg-white shadow-[0_10px_30px_rgba(57,31,22,0.08)] transition duration-250 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(57,31,22,0.14)] active:scale-[0.985] ${
          isVisible ? "anim-fade-up" : "opacity-0 translate-y-5 scale-95"
        } ${delayClass}`}
      >
        <button
          type="button"
          data-testid={`produto-${prato.id}`}
          aria-label={`Ver detalhes de ${prato.nome}`}
          onClick={handleOpenDetail}
          className="grid min-h-[164px] w-full grid-cols-[42%_1fr] text-left sm:grid-cols-[220px_1fr]"
        >
          <div className="relative bg-[#fff3e2]">
            <img
              src={imageSrc}
              alt={prato.nome}
              className={`h-full w-full transition duration-300 group-hover:scale-[1.04] ${imageSrc === "/img/pizzas/placeholder-pizza.svg" ? "object-contain p-5" : "object-cover"}`}
              loading="lazy"
              onError={() => {
                if (imageSrc !== "/img/pizzas/placeholder-pizza.svg") {
                  setImageSrc("/img/pizzas/placeholder-pizza.svg");
                }
              }}
            />
          </div>

          <div className="flex min-w-0 flex-col p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1 pr-10">
                <h3 className="line-clamp-2 text-lg font-black leading-tight text-[#241313] sm:text-2xl">
                  {prato.nome}
                </h3>
                <p className="mt-1 line-clamp-3 text-sm leading-5 text-[#6f6461] sm:text-base">
                  {prato.descricao || "Receita especial da casa."}
                </p>
              </div>
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
              <span
                className={`relative inline-flex h-11 shrink-0 items-center gap-1 rounded-xl bg-[#d71920] px-3 text-sm font-black text-white shadow-md transition group-hover:bg-[#b50008] sm:gap-2 sm:px-4 ${
                  plusPulse ? "anim-soft-bounce anim-ripple" : ""
                }`}
              >
                <Plus
                  className={`h-5 w-5 transition-transform duration-250 ${plusPulse ? "rotate-90" : "rotate-0"}`}
                />
                <span className="hidden min-[430px]:inline">Adicionar</span>
              </span>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={triggerFavorite}
          className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/85 text-[#5b5552] shadow-sm backdrop-blur transition group-hover:bg-[#fff3f3] group-hover:text-[#c90010]"
          aria-label={`Favoritar ${prato.nome}`}
        >
          <Heart
            className={`h-6 w-6 ${favorite ? "fill-[#d71920] text-[#d71920]" : ""} ${heartBurst > 0 ? "anim-heart-pop" : ""}`}
          />
          {heartBurst > 0 &&
            [0, 1, 2, 3].map((index) => (
              <span
                key={`${heartBurst}-${index}`}
                className={`pointer-events-none absolute text-[10px] text-[#d71920] anim-heart-float heart-particle-${index}`}
              >
                ❤
              </span>
            ))}
        </button>
      </article>

      <ProductDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        categoriaNome={categoria.nome}
        prato={prato}
        bordasExtras={bordasExtras}
      />
    </>
  );
};

export const PratoCard = memo(PratoCardComponent);
