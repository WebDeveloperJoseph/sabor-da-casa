import type {
  CategoriaCardapio,
  TipoFiltroCardapio,
} from "../types/cardapio.type";

import { calcularRelevanciaBusca } from "./calcular-relevancia-busca";
import { getTipoCategoria } from "./get-tipo-categoria";
import { normalizeText } from "./normalize-text";

type FiltrarCategoriasParams = {
  categorias: CategoriaCardapio[];
  busca: string;
  tipoSelecionado: TipoFiltroCardapio;
  favoritosIds: number[];
};

const prioridadeCategorias: Record<TipoFiltroCardapio, number> = {
  pizzas: 0,
  favoritos: 1,
  bebidas: 2,
  sobremesas: 3,
  outros: 4,
  todos: 5,
};

export function filtrarCategoriasCardapio({
  categorias,
  busca,
  tipoSelecionado,
  favoritosIds,
}: FiltrarCategoriasParams): CategoriaCardapio[] {
  const buscaNormalizada = normalizeText(busca);

  const favoritosSet = new Set(favoritosIds);

  return categorias
    .map((categoria) => {
      const tipoCategoria = getTipoCategoria(categoria.nome);

      const pratosFiltrados = categoria.pratos
        .map((prato) => {
          const isFavorito = favoritosSet.has(prato.id);

          const passaNoFiltro = verificarFiltro({
            tipoSelecionado,
            tipoCategoria,
            isFavorito,
          });

          if (!passaNoFiltro) return null;

          const relevancia = calcularRelevanciaBusca({
            prato,
            nomeCategoria: categoria.nome,
            busca: buscaNormalizada,
          });

          return relevancia > 0 ? { prato, relevancia } : null;
        })
        .filter((resultado) => resultado !== null)
        .sort((a, b) => b.relevancia - a.relevancia)
        .map(({ prato }) => prato);

      return {
        ...categoria,
        pratos: pratosFiltrados,
      };
    })
    .filter((categoria) => categoria.pratos.length > 0)
    .sort(
      (categoriaA, categoriaB) =>
        prioridadeCategorias[getTipoCategoria(categoriaA.nome)] -
        prioridadeCategorias[getTipoCategoria(categoriaB.nome)],
    );
}

type VerificarFiltroParams = {
  tipoSelecionado: TipoFiltroCardapio;
  tipoCategoria: TipoFiltroCardapio;
  isFavorito: boolean;
};

function verificarFiltro({
  tipoSelecionado,
  tipoCategoria,
  isFavorito,
}: VerificarFiltroParams): boolean {
  if (tipoSelecionado === "todos") {
    return true;
  }

  if (tipoSelecionado === "favoritos") {
    return isFavorito;
  }

  return tipoSelecionado === tipoCategoria;
}
