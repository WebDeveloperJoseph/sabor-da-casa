import { PratoCard } from "../PratoCard";

import type {
  BordaExtraOption,
  CategoriaCardapio,
  TipoFiltroCardapio,
} from "../../types/cardapio.type";

type ConteudoCardapioProps = {
  categorias: CategoriaCardapio[];
  bordasExtras: BordaExtraOption[];
  filtro: TipoFiltroCardapio;
  favoritosIds: number[];
  onToggleFavorito: (pratoId: number) => void;
};

export function ConteudoCardapio({
  categorias,
  bordasExtras,
  filtro,
  favoritosIds,
  onToggleFavorito,
}: ConteudoCardapioProps) {
  if (categorias.length === 0) {
    return (
      <div className="rounded-2xl border border-[#ead7bd] bg-white px-4 py-10 text-center shadow-sm">
        <p className="font-semibold text-[#9a0007]">
          Nenhum item encontrado para os filtros selecionados.
        </p>
        <p className="mt-2 text-sm text-[#6f6461]">
          Tente limpar a busca ou escolher outra categoria.
        </p>
      </div>
    );
  }

  const favoritos = new Set(favoritosIds);

  return categorias.map((categoria) => (
    <section
      key={categoria.id}
      id={`categoria-${categoria.id}`}
      className="scroll-mt-40"
    >
      {filtro === "todos" && (
        <h3 className="mb-3 text-xl font-black text-[#3a1b18]">
          {categoria.nome}
        </h3>
      )}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {categoria.pratos.map((prato, index) => (
          <PratoCard
            key={prato.id}
            prato={prato}
            categoria={categoria}
            bordasExtras={bordasExtras}
            animationDelay={Math.min(index * 45, 240)}
            isFavorite={favoritos.has(prato.id)}
            onToggleFavorite={onToggleFavorito}
          />
        ))}
      </div>
    </section>
  ));
}
