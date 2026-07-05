"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { CakeSlice, CupSoda, Gift, LayoutGrid, Pizza, Search, X } from "lucide-react";
import { PratoCard } from "./PratoCard";

type IngredienteTag = {
  ingrediente: { id: number; nome: string; alergenico: boolean };
};
type TamanhoType = { tamanho: string; preco: number };

type PratoWithIngred = {
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

type CategoriaWithPratos = {
  id: number;
  nome: string;
  descricao: string | null;
  pratos: PratoWithIngred[];
};

type TipoFiltro = "todos" | "pizzas" | "combos" | "bebidas" | "sobremesas" | "outros";

type Props = {
  categorias: CategoriaWithPratos[];
};

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const getTipoCategoria = (nomeCategoria: string): TipoFiltro => {
  const nome = normalizeText(nomeCategoria);

  if (nome.includes("bebida") || nome.includes("refrigerante") || nome.includes("suco")) {
    return "bebidas";
  }

  if (nome.includes("sobremesa") || nome.includes("doce")) {
    return "sobremesas";
  }

  if (nome.includes("combo") || nome.includes("promoc")) {
    return "combos";
  }

  if (nome.includes("pizza") || nome.includes("tradicional")) {
    return "pizzas";
  }

  return "outros";
};

const filtroVisual: Array<{
  key: TipoFiltro;
  label: string;
  icon: ReactNode;
}> = [
  { key: "todos", label: "Mais pedidas", icon: <LayoutGrid className="h-5 w-5" /> },
  { key: "pizzas", label: "Pizzas", icon: <Pizza className="h-5 w-5" /> },
  { key: "combos", label: "Combos", icon: <Gift className="h-5 w-5" /> },
  { key: "bebidas", label: "Bebidas", icon: <CupSoda className="h-5 w-5" /> },
  { key: "sobremesas", label: "Sobremesas", icon: <CakeSlice className="h-5 w-5" /> },
];

export function CardapioFiltros({ categorias }: Props) {
  const [busca, setBusca] = useState("");
  const [tipoSelecionado, setTipoSelecionado] = useState<TipoFiltro>("todos");

  const buscaNormalizada = normalizeText(busca.trim());

  const categoriasFiltradas = useMemo(() => {
    return categorias
      .map((categoria) => {
        const tipoCategoria = getTipoCategoria(categoria.nome);

        const pratosFiltrados = categoria.pratos.filter((prato) => {
          const passaNoTipo =
            tipoSelecionado === "todos" ||
            tipoSelecionado === tipoCategoria;

          if (!passaNoTipo) return false;
          if (!buscaNormalizada) return true;

          const ingredientes = prato.ingredientes
            .map((item) => item.ingrediente.nome)
            .join(" ");
          const alvoBusca = normalizeText(
            [prato.nome, prato.descricao ?? "", categoria.nome, ingredientes].join(" "),
          );

          return alvoBusca.includes(buscaNormalizada);
        });

        return { ...categoria, pratos: pratosFiltrados };
      })
      .filter((categoria) => categoria.pratos.length > 0)
      .sort((a, b) => {
        const prioridade: Record<TipoFiltro, number> = {
          pizzas: 0,
          combos: 1,
          bebidas: 2,
          sobremesas: 3,
          outros: 4,
          todos: 5,
        };
        return prioridade[getTipoCategoria(a.nome)] - prioridade[getTipoCategoria(b.nome)];
      });
  }, [categorias, tipoSelecionado, buscaNormalizada]);

  const titulo =
    tipoSelecionado === "todos"
      ? "Mais pedidas"
      : filtroVisual.find((item) => item.key === tipoSelecionado)?.label || "Cardapio";

  return (
    <div className="space-y-7">
      <div className="rounded-[2rem] bg-[#fff7ea] px-1 pt-1">
        <div className="sticky top-0 z-20 -mx-1 border-b border-[#f0dfc9] bg-[#fff7ea]/96 px-1 pb-4 pt-4 backdrop-blur md:static md:border-b-0">
          <div className="relative mx-auto max-w-3xl">
            <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#5f5250]" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar pizzas, sabores e mais..."
              className="h-14 w-full rounded-full border border-[#eadfd3] bg-white pl-14 pr-12 text-base text-[#231313] shadow-[0_8px_22px_rgba(57,31,22,0.08)] outline-none transition focus:border-[#c90010] focus:ring-2 focus:ring-[#ffd15a]/50"
            />
            {busca && (
              <button
                type="button"
                onClick={() => setBusca("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-2 text-[#7b706c] hover:bg-[#fff0f0] hover:text-[#c90010]"
                aria-label="Limpar busca"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="mt-5 flex gap-3 overflow-x-auto px-1 pb-1">
            {filtroVisual.map((filtro) => {
              const ativo = tipoSelecionado === filtro.key;
              return (
                <button
                  key={filtro.key}
                  type="button"
                  onClick={() => setTipoSelecionado(filtro.key)}
                  className={`inline-flex min-h-14 shrink-0 items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-black transition ${
                    ativo
                      ? "border-[#c90010] bg-[#c90010] text-white shadow-lg"
                      : "border-[#ead7bd] bg-white text-[#9a0007] hover:border-[#c90010]"
                  }`}
                >
                  {filtro.icon}
                  <span>{filtro.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-3 pb-10 pt-2 sm:px-5">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-black text-[#241313]">{titulo}</h2>
              <div className="mt-2 h-1 w-16 rounded-full bg-[#c90010]" />
            </div>
            {tipoSelecionado !== "todos" && (
              <button
                type="button"
                onClick={() => setTipoSelecionado("todos")}
                className="text-sm font-bold text-[#c90010]"
              >
                Ver todas
              </button>
            )}
          </div>

          <div className="space-y-8">
            {categoriasFiltradas.map((categoria) => (
              <section key={categoria.id} id={`categoria-${categoria.id}`} className="scroll-mt-40">
                {tipoSelecionado === "todos" && (
                  <h3 className="mb-3 text-xl font-black text-[#3a1b18]">{categoria.nome}</h3>
                )}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {categoria.pratos.map((prato) => (
                    <PratoCard key={prato.id} prato={prato} categoria={categoria} />
                  ))}
                </div>
              </section>
            ))}

            {categoriasFiltradas.length === 0 && (
              <div className="rounded-2xl border border-[#ead7bd] bg-white px-4 py-10 text-center shadow-sm">
                <p className="font-semibold text-[#9a0007]">
                  Nenhum item encontrado para os filtros selecionados.
                </p>
                <p className="mt-2 text-sm text-[#6f6461]">
                  Tente limpar a busca ou escolher outra categoria.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
