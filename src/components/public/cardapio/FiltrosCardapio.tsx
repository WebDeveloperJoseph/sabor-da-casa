"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ComponentType, SVGProps } from "react";
import { CakeSlice, CupSoda, Heart, LayoutGrid, Pizza } from "lucide-react";

import type { TipoFiltroCardapio } from "../../types/cardapio.type";

type IconeFiltro = ComponentType<SVGProps<SVGSVGElement>>;

export const FILTROS_CARDAPIO: ReadonlyArray<{
  key: TipoFiltroCardapio;
  label: string;
  Icone: IconeFiltro;
}> = [
  { key: "todos", label: "Cardápio", Icone: LayoutGrid },
  { key: "favoritos", label: "Favoritos", Icone: Heart },
  { key: "pizzas", label: "Pizzas", Icone: Pizza },
  { key: "bebidas", label: "Bebidas", Icone: CupSoda },
  { key: "sobremesas", label: "Pizzas Doces", Icone: CakeSlice },
];

const DELAYS_ANIMACAO = [
  "anim-d-90",
  "anim-d-135",
  "anim-d-180",
  "anim-d-225",
  "anim-d-270",
] as const;

type FiltrosCardapioProps = {
  selecionado: TipoFiltroCardapio;
  onSelecionar: (filtro: TipoFiltroCardapio) => void;
};

export function FiltrosCardapio({
  selecionado,
  onSelecionar,
}: FiltrosCardapioProps) {
  const [slideClass, setSlideClass] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const filtroRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeIndex = FILTROS_CARDAPIO.findIndex(
    ({ key }) => key === selecionado,
  );

  const centralizarFiltro = useCallback((index: number) => {
    const container = containerRef.current;
    const target = filtroRefs.current[index];
    if (!container || !target) return;

    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const left =
      container.scrollLeft +
      targetRect.left -
      containerRect.left -
      (containerRect.width - targetRect.width) / 2;

    container.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (activeIndex >= 0) centralizarFiltro(activeIndex);
  }, [activeIndex, centralizarFiltro]);

  function selecionarFiltro(filtro: TipoFiltroCardapio, index: number) {
    if (filtro === selecionado) return;

    setSlideClass("");
    window.requestAnimationFrame(() => {
      setSlideClass(
        index > activeIndex
          ? "anim-filter-slide-left"
          : "anim-filter-slide-right",
      );
    });
    onSelecionar(filtro);
  }

  return (
    <div className="anim-fade-up anim-d-150 mt-5">
      <div
        ref={containerRef}
        className={`relative flex gap-3 overflow-x-auto px-1 pb-3 ${slideClass}`}
        onAnimationEnd={(event) => {
          if (
            event.target === event.currentTarget &&
            event.animationName.includes("filter-slide")
          ) {
            setSlideClass("");
          }
        }}
        aria-label="Filtros do cardápio"
      >
        {FILTROS_CARDAPIO.map(({ key, label, Icone }, index) => {
          const ativo = selecionado === key;

          return (
            <button
              key={key}
              ref={(element) => {
                filtroRefs.current[index] = element;
              }}
              type="button"
              onClick={() => selecionarFiltro(key, index)}
              aria-pressed={ativo}
              className={`anim-fade-up ${DELAYS_ANIMACAO[index] ?? "anim-d-180"} inline-flex min-h-14 shrink-0 items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-black transition duration-200 active:scale-[0.97] ${
                ativo
                  ? "border-[#c90010] bg-[#c90010] text-white shadow-lg"
                  : "border-[#ead7bd] bg-white text-[#9a0007] hover:border-[#c90010]"
              }`}
            >
              <Icone className="h-5 w-5" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
      <div className="relative mx-2 h-0.5 rounded-full bg-[#efdccb]">
        <span
          className={`absolute top-0 h-0.5 w-1/6 rounded-full bg-[#c90010] transition-transform duration-250 underline-pos-${Math.max(0, activeIndex)}`}
        />
      </div>
    </div>
  );
}
