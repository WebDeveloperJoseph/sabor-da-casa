"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { CupSoda, LayoutGrid, Pizza, Search, X } from "lucide-react";
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

type TipoFiltro = "todos" | "pizzas" | "bebidas" | "outros";

type Props = {
  categorias: CategoriaWithPratos[];
};

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const getTipoCategoria = (
  nomeCategoria: string,
): Exclude<TipoFiltro, "todos"> => {
  const nome = normalizeText(nomeCategoria);

  if (nome.includes("pizza") || nome.includes("tradicional")) {
    return "pizzas";
  }

  if (
    nome.includes("bebida") ||
    nome.includes("refrigerante") ||
    nome.includes("suco")
  ) {
    return "bebidas";
  }

  return "outros";
};

export function CardapioFiltros({ categorias }: Props) {
  const [busca, setBusca] = useState("");
  const [tipoSelecionado, setTipoSelecionado] = useState<TipoFiltro>("todos");
  const [categoriaAtivaId, setCategoriaAtivaId] = useState<number | null>(null);

  const buscaNormalizada = normalizeText(busca.trim());

  const contadores = useMemo(() => {
    const base = { todos: 0, pizzas: 0, bebidas: 0, outros: 0 };

    categorias.forEach((categoria) => {
      const tipo = getTipoCategoria(categoria.nome);
      base[tipo] += categoria.pratos.length;
      base.todos += categoria.pratos.length;
    });

    return base;
  }, [categorias]);

  const categoriasFiltradas = useMemo(() => {
    return categorias
      .map((categoria) => {
        const tipoCategoria = getTipoCategoria(categoria.nome);

        const pratosFiltrados = categoria.pratos.filter((prato) => {
          const passaNoTipo =
            tipoSelecionado === "todos" || tipoSelecionado === tipoCategoria;

          if (!passaNoTipo) return false;
          if (!buscaNormalizada) return true;

          const ingredientes = prato.ingredientes
            .map((item) => item.ingrediente.nome)
            .join(" ");
          const alvoBusca = normalizeText(
            [
              prato.nome,
              prato.descricao ?? "",
              categoria.nome,
              ingredientes,
            ].join(" "),
          );

          return alvoBusca.includes(buscaNormalizada);
        });

        return {
          ...categoria,
          pratos: pratosFiltrados,
        };
      })
      .filter((categoria) => categoria.pratos.length > 0);
  }, [categorias, tipoSelecionado, buscaNormalizada]);

  const filtros: Array<{
    key: TipoFiltro;
    label: string;
    icon: ReactNode;
    count: number;
  }> = [
    {
      key: "todos",
      label: "Todos",
      icon: <LayoutGrid className="h-4 w-4" />,
      count: contadores.todos,
    },
    {
      key: "pizzas",
      label: "Pizzas",
      icon: <Pizza className="h-4 w-4" />,
      count: contadores.pizzas,
    },
    {
      key: "bebidas",
      label: "Bebidas",
      icon: <CupSoda className="h-4 w-4" />,
      count: contadores.bebidas,
    },
    {
      key: "outros",
      label: "Outros",
      icon: <span className="text-xs">+</span>,
      count: contadores.outros,
    },
  ];

  const categoriasNavegacao = categoriasFiltradas.map((categoria) => ({
    id: categoria.id,
    nome: categoria.nome,
    total: categoria.pratos.length,
  }));

  const scrollToCategoria = (categoriaId: number) => {
    const alvo = document.getElementById(`categoria-${categoriaId}`);
    if (!alvo) return;

    setCategoriaAtivaId(categoriaId);
    alvo.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-6">
      <div className="sticky top-16 z-20 -mx-2 rounded-2xl border border-orange-200 bg-white/95 p-3 shadow-lg backdrop-blur md:static md:mx-0 md:bg-orange-50/70 md:shadow-none">
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-500" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar pizza, bebida ou ingrediente..."
            className="h-11 w-full rounded-xl border border-orange-300 bg-white pl-10 pr-10 text-sm text-gray-800 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          />
          {busca && (
            <button
              type="button"
              onClick={() => setBusca("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-500 hover:bg-orange-100 hover:text-orange-700"
              aria-label="Limpar busca"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {filtros.map((filtro) => {
            const ativo = tipoSelecionado === filtro.key;
            return (
              <button
                key={filtro.key}
                type="button"
                onClick={() => setTipoSelecionado(filtro.key)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition ${
                  ativo
                    ? "border-orange-500 bg-orange-500 text-white shadow"
                    : "border-orange-200 bg-white text-orange-700 hover:border-orange-300 hover:bg-orange-50"
                }`}
              >
                {filtro.icon}
                <span>{filtro.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                    ativo
                      ? "bg-white/25 text-white"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {filtro.count}
                </span>
              </button>
            );
          })}
        </div>

        {categoriasNavegacao.length > 0 && (
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {categoriasNavegacao.map((categoria) => {
              const ativa = categoriaAtivaId === categoria.id;
              return (
                <button
                  key={categoria.id}
                  type="button"
                  onClick={() => scrollToCategoria(categoria.id)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    ativa
                      ? "border-red-500 bg-red-500 text-white"
                      : "border-red-200 bg-white text-red-700 hover:border-red-300 hover:bg-red-50"
                  }`}
                >
                  <span>{categoria.nome}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                      ativa
                        ? "bg-white/20 text-white"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {categoria.total}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-16">
        {categoriasFiltradas.map((categoria) => (
          <section
            key={categoria.id}
            id={`categoria-${categoria.id}`}
            className="relative overflow-hidden rounded-3xl border-2 border-orange-100 bg-linear-to-br from-white to-orange-50/30 p-8 shadow-xl md:p-10"
          >
            <div className="absolute right-0 top-0 z-0 h-64 w-64 rounded-full bg-linear-to-br from-orange-200/20 to-red-200/20 blur-3xl" />

            <h2 className="relative mb-3 bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-center text-3xl font-bold text-transparent md:text-left md:text-4xl">
              {categoria.nome}
            </h2>
            <p className="relative mb-8 text-center text-base text-gray-700 md:text-left md:text-lg">
              {categoria.descricao}
            </p>

            <div className="relative grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {categoria.pratos.map((prato) => (
                <PratoCard key={prato.id} prato={prato} categoria={categoria} />
              ))}
            </div>
          </section>
        ))}

        {categoriasFiltradas.length === 0 && (
          <div className="rounded-2xl border-2 border-orange-200 bg-orange-50 px-4 py-10 text-center">
            <p className="font-semibold text-orange-800">
              Nenhum item encontrado para os filtros selecionados.
            </p>
            <p className="mt-2 text-sm text-orange-700">
              Tente limpar a busca ou mudar o tipo de produto.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
