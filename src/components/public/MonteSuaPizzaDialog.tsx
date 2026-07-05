"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Pizza, Check, Search, RotateCcw } from "lucide-react";
import { useCart } from "./CartProvider";
import { toast } from "sonner";

type Prato = {
  id: number;
  nome: string;
  preco: number;
  descricao?: string | null;
  imagem?: string | null;
};

type PratoTamanho = {
  id: number;
  pratoId: number;
  tamanho: string;
  preco: number;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pizzas: (Prato & { tamanhos: PratoTamanho[] })[];
};

const TAMANHOS_DISPONIVEIS = ["P", "M", "G"] as const;
const MAX_SABORES_P = 2;
const MAX_SABORES_G = 3;

export function MonteSuaPizzaDialog({ open, onOpenChange, pizzas }: Props) {
  const { add } = useCart();
  const [saboresSelecionados, setSaboresSelecionados] = useState<number[]>([]);
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState<string>("M");
  const [buscaSabor, setBuscaSabor] = useState("");
  // Removido: bordas e bordaSelecionada

  // Removido: fetch de bordas

  // Calcula o preço pelo sabor mais caro no tamanho selecionado
  const precoCalculado = useMemo(() => {
    if (saboresSelecionados.length === 0) return 0;

    const precosPorSabor = saboresSelecionados.map((pizzaId) => {
      const pizza = pizzas.find((p) => p.id === pizzaId);
      if (!pizza) return 0;
      const tamanho = pizza.tamanhos.find(
        (t) => t.tamanho === tamanhoSelecionado,
      );
      return tamanho ? Number(tamanho.preco) : 0;
    });

    return Math.max(...precosPorSabor);
  }, [saboresSelecionados, tamanhoSelecionado, pizzas]);

  const getMaxSabores = () => {
    if (tamanhoSelecionado === "P" || tamanhoSelecionado === "M") {
      return MAX_SABORES_P;
    }
    return MAX_SABORES_G;
  };

  const minSabores = tamanhoSelecionado === "G" ? 1 : 2;
  const maxSabores = getMaxSabores();
  const faltamMinimo = Math.max(0, minSabores - saboresSelecionados.length);

  const pizzasFiltradas = useMemo(() => {
    const termo = buscaSabor
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

    const base = pizzas.filter((pizza) => {
      if (!termo) return true;
      const alvo = `${pizza.nome} ${pizza.descricao ?? ""}`
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
      return alvo.includes(termo);
    });

    return base.sort((a, b) => {
      const aSelecionado = saboresSelecionados.includes(a.id) ? 0 : 1;
      const bSelecionado = saboresSelecionados.includes(b.id) ? 0 : 1;
      if (aSelecionado !== bSelecionado) return aSelecionado - bSelecionado;
      return a.nome.localeCompare(b.nome);
    });
  }, [pizzas, buscaSabor, saboresSelecionados]);

  const toggleSabor = (pizzaId: number) => {
    setSaboresSelecionados((prev) => {
      if (prev.includes(pizzaId)) {
        return prev.filter((id) => id !== pizzaId);
      }
      const maxSabores = getMaxSabores();
      if (prev.length >= maxSabores) {
        const tamanhoTexto =
          tamanhoSelecionado === "G"
            ? "Grande (1-3 sabores)"
            : "P/M (até 2 sabores)";
        toast.error(`Tamanho ${tamanhoTexto}`);
        return prev;
      }
      return [...prev, pizzaId];
    });
  };

  const handleAddToCart = () => {
    if (saboresSelecionados.length < minSabores) {
      const texto = `pelo menos ${minSabores} ${minSabores === 1 ? "sabor" : "sabores"}`;
      toast.error(`Escolha ${texto}`);
      return;
    }

    const nomesSabores = saboresSelecionados
      .map((id) => pizzas.find((p) => p.id === id)?.nome)
      .filter(Boolean)
      .join(" + ");

    // Adiciona ao carrinho como pizza mista
    // Usaremos pratoId = 999 (Pizza Personalizada) criado no seed
    const nomeCompleto = `Pizza Mista (${saboresSelecionados.length} sabores)`;
    const observacoesFinal = `Sabores: ${nomesSabores}`;
    const itemPizza = {
      pratoId: 999, // ID especial para pizzas mistas
      nome: nomeCompleto,
      preco: precoCalculado,
      tamanho: tamanhoSelecionado,
      observacoes: observacoesFinal,
    };
    console.log("🍕 Adicionando pizza ao carrinho:", itemPizza);
    try {
      add(itemPizza);
      toast.success("Pizza adicionada ao carrinho!");
      console.log("✅ Pizza adicionada com sucesso");
    } catch (error) {
      console.error("❌ Erro ao adicionar pizza ao carrinho:", error);
      toast.error("Erro ao adicionar pizza ao carrinho");
      return;
    }
    // Reset
    setSaboresSelecionados([]);
    setTamanhoSelecionado("M");
    setBuscaSabor("");
    onOpenChange(false);
  };

  const limparSabores = () => setSaboresSelecionados([]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 pb-24 sm:pb-28">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-2xl">
            <Pizza className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
            Monte sua Pizza
          </DialogTitle>
          <div className="text-xs sm:text-sm text-gray-600 mt-2">
            <p className="mb-2">
              <span className="hidden sm:inline">
                Tamanhos P e M: até 2 sabores | Tamanho G: 1 a 3 sabores. O
                preço será do sabor mais caro.
              </span>
              <span className="sm:hidden">
                P/M: até 2 sabores | G: 1-3 sabores
              </span>
            </p>
            <div className="flex flex-wrap gap-2 sm:gap-4 text-xs bg-blue-50 p-2 rounded border">
              <span>
                <strong>P:</strong> 4 fatias
              </span>
              <span>
                <strong>M:</strong> 6 fatias
              </span>
              <span>
                <strong>G:</strong> 8 fatias
              </span>
            </div>
          </div>
        </DialogHeader>

        {/* Seleção de Tamanho */}
        <div className="mb-4 sm:mb-6">
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
            Escolha o Tamanho
          </label>
          <div className="flex gap-2 sm:gap-3">
            {TAMANHOS_DISPONIVEIS.map((tamanho) => (
              <button
                key={tamanho}
                onClick={() => {
                  setTamanhoSelecionado(tamanho);
                  // Resetar sabores se exceder o novo limite
                  const novoMax = tamanho === "P" || tamanho === "M" ? 2 : 3;
                  setSaboresSelecionados((prev) => prev.slice(0, novoMax));
                }}
                className={`flex-1 py-2 sm:py-3 px-2 sm:px-4 rounded-lg border-2 font-semibold transition-all cursor-pointer ${
                  tamanhoSelecionado === tamanho
                    ? "border-orange-500 bg-orange-50 text-orange-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-orange-300"
                }`}
              >
                <div className="text-center">
                  <div className="text-base sm:text-lg">{tamanho}</div>
                  <div className="text-[10px] sm:text-xs opacity-75">
                    {tamanho === "G" ? "1-3 sabores" : "até 2"}
                  </div>
                  <div className="text-[10px] sm:text-xs text-blue-600 font-semibold">
                    {tamanho === "P"
                      ? "4 fatias"
                      : tamanho === "M"
                        ? "6 fatias"
                        : "8 fatias"}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Seleção de Borda Recheada removida */}

        {/* Contador de Sabores */}
        <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">
              Sabores: {saboresSelecionados.length}/{maxSabores}
            </span>
            <span className="text-lg sm:text-xl font-bold text-orange-600">
              R$ {precoCalculado.toFixed(2).replace(".", ",")}
            </span>
          </div>
          <div className="mt-1 text-[11px] sm:text-xs text-gray-600">
            {faltamMinimo > 0
              ? `Faltam ${faltamMinimo} ${faltamMinimo === 1 ? "sabor" : "sabores"} para continuar.`
              : "Perfeito! Você já pode adicionar ao carrinho."}
          </div>
          {saboresSelecionados.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {saboresSelecionados.map((id) => {
                const sabor = pizzas.find((p) => p.id === id);
                if (!sabor) return null;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleSabor(id)}
                    className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-[10px] sm:text-xs font-medium text-orange-800 hover:bg-orange-200"
                  >
                    {sabor.nome}
                    <X className="h-3 w-3" />
                  </button>
                );
              })}
            </div>
          )}
          {saboresSelecionados.length > 0 && (
            <button
              type="button"
              onClick={limparSabores}
              className="mt-2 inline-flex items-center gap-1 text-[10px] sm:text-xs font-medium text-gray-600 hover:text-gray-800"
            >
              <RotateCcw className="h-3 w-3" />
              Limpar seleção
            </button>
          )}
        </div>

        {/* Busca de sabores */}
        <div className="mb-3 sm:mb-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-500" />
            <input
              type="text"
              value={buscaSabor}
              onChange={(e) => setBuscaSabor(e.target.value)}
              placeholder="Buscar sabor..."
              className="h-10 w-full rounded-lg border border-orange-200 bg-white pl-9 pr-9 text-sm text-gray-800 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
            {buscaSabor && (
              <button
                type="button"
                onClick={() => setBuscaSabor("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:bg-orange-100 hover:text-orange-700"
                aria-label="Limpar busca"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Grid de Pizzas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {pizzasFiltradas.map((pizza) => {
            const selecionado = saboresSelecionados.includes(pizza.id);
            const tamanho = pizza.tamanhos.find(
              (t) => t.tamanho === tamanhoSelecionado,
            );

            return (
              <button
                key={pizza.id}
                onClick={() => toggleSabor(pizza.id)}
                className={`relative p-3 sm:p-4 rounded-xl border-2 transition-all text-left cursor-pointer ${
                  selecionado
                    ? "border-orange-500 bg-orange-50 shadow-md"
                    : "border-gray-200 bg-white hover:border-orange-300"
                }`}
              >
                {selecionado && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-lg">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                  </div>
                )}

                <div className="font-bold text-sm sm:text-base text-gray-900 mb-1">
                  {pizza.nome}
                </div>

                {pizza.descricao && (
                  <p className="text-[10px] sm:text-xs text-gray-600 mb-2 line-clamp-2">
                    {pizza.descricao}
                  </p>
                )}

                {tamanho && (
                  <div className="text-xs sm:text-sm font-semibold text-orange-600">
                    R$ {Number(tamanho.preco).toFixed(2).replace(".", ",")}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {pizzasFiltradas.length === 0 && (
          <div className="mt-3 rounded-lg border border-orange-200 bg-orange-50 p-3 text-center text-xs sm:text-sm text-orange-800">
            Nenhum sabor encontrado para sua busca.
          </div>
        )}

        {/* Botões de Ação */}
        <div className="sticky bottom-0 mt-4 sm:mt-6 flex gap-2 sm:gap-3 border-t border-orange-100 bg-white/95 pt-3 backdrop-blur">
          <Button
            onClick={handleAddToCart}
            disabled={saboresSelecionados.length < minSabores}
            className="flex-1 bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 sm:py-6 text-sm sm:text-lg"
          >
            <span className="hidden sm:inline">
              Adicionar ao Carrinho • R${" "}
              {precoCalculado.toFixed(2).replace(".", ",")}
            </span>
            <span className="sm:hidden">
              Adicionar • R$ {precoCalculado.toFixed(2).replace(".", ",")}
            </span>
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="px-4 sm:px-6"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
