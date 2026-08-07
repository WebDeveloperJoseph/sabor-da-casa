"use client";

import { useDeferredValue, useMemo, useState } from "react";

import { useFavoritosCardapio } from "../hooks/use-favoritos-cardapio";
import type {
  CardapioFiltrosProps,
  TipoFiltroCardapio,
} from "../types/cardapio.type";
import { filtrarCategoriasCardapio } from "../utils/filtrar-categorias-cardapio";
import { BuscaCardapio } from "./cardapio/BuscaCardapio";
import { ConteudoCardapio } from "./cardapio/ConteudoCardapio";
import {
  FILTROS_CARDAPIO,
  FiltrosCardapio,
} from "./cardapio/FiltrosCardapio";

export function CardapioFiltros({
  categorias,
  bordasExtras,
}: CardapioFiltrosProps) {
  const [busca, setBusca] = useState("");
  const buscaAdiada = useDeferredValue(busca);
  const [filtro, setFiltro] = useState<TipoFiltroCardapio>("todos");
  const { favoritosIds, toggleFavorito } = useFavoritosCardapio();

  const categoriasFiltradas = useMemo(
    () =>
      filtrarCategoriasCardapio({
        categorias,
        busca: buscaAdiada,
        tipoSelecionado: filtro,
        favoritosIds,
      }),
    [categorias, buscaAdiada, filtro, favoritosIds],
  );

  const titulo =
    filtro === "todos"
      ? "Cardápio completo"
      : (FILTROS_CARDAPIO.find(({ key }) => key === filtro)?.label ??
        "Cardápio");

  return (
    <div className="space-y-7">
      <div className="rounded-4xl bg-[#fff7ea] px-1 pt-1">
        <div className="sticky top-0 z-20 -mx-1 border-b border-[#f0dfc9] bg-[#fff7ea]/96 px-1 pb-4 pt-4 backdrop-blur md:static md:border-b-0">
          <BuscaCardapio
            busca={busca}
            pesquisando={busca !== buscaAdiada}
            onBuscaChange={setBusca}
          />
          <FiltrosCardapio selecionado={filtro} onSelecionar={setFiltro} />
        </div>

        <div className="px-3 pb-10 pt-2 sm:px-5">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-black text-[#241313]">{titulo}</h2>
              <div className="mt-2 h-1 w-16 rounded-full bg-[#c90010]" />
            </div>
            {filtro !== "todos" && (
              <button
                type="button"
                onClick={() => setFiltro("todos")}
                className="text-sm font-bold text-[#c90010]"
              >
                Ver todas
              </button>
            )}
          </div>

          <div className="anim-fade-up space-y-8">
            <ConteudoCardapio
              categorias={categoriasFiltradas}
              bordasExtras={bordasExtras}
              filtro={filtro}
              favoritosIds={favoritosIds}
              onToggleFavorito={toggleFavorito}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
