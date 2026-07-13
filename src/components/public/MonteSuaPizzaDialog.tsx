"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Check,
  CupSoda,
  Minus,
  Pizza,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
  bordasExtras: Array<{ id: number; nome: string; preco: number }>;
  bebidas: Array<{ id: number; nome: string; preco: number }>;
};

const TAMANHOS = [
  { id: "P", label: "Pequena", fatias: "4 fatias", regra: "ate 2 sabores" },
  { id: "M", label: "Media", fatias: "6 fatias", regra: "ate 2 sabores" },
  { id: "G", label: "Grande", fatias: "8 fatias", regra: "ate 2 sabores" },
];

const ADICIONAIS_PIZZA = [
  { nome: "Bacon", preco: 3 },
  { nome: "Azeitona", preco: 2 },
  { nome: "Milho", preco: 2 },
  { nome: "Requeijao cremoso", preco: 8 },
  { nome: "Creme cheese", preco: 8 },
  { nome: "Requeijao cheddar", preco: 8 },
  { nome: "Nata", preco: 5 },
  { nome: "Molho barbecue", preco: 3 },
  { nome: "Carne de sol", preco: 10 },
  { nome: "Calabresa", preco: 5 },
];

const formatCurrency = (value: number) =>
  `R$ ${value.toFixed(2).replace(".", ",")}`;

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export function MonteSuaPizzaDialog({
  open,
  onOpenChange,
  pizzas,
  bordasExtras,
  bebidas,
}: Props) {
  const { add } = useCart();
  const [saboresSelecionados, setSaboresSelecionados] = useState<number[]>([]);
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState("M");
  const [buscaSabor, setBuscaSabor] = useState("");
  const [adicionaisSelecionados, setAdicionaisSelecionados] = useState<
    string[]
  >([]);
  const [bordaExtraSelecionadaId, setBordaExtraSelecionadaId] = useState<
    number | null
  >(null);
  const [bebidasSelecionadas, setBebidasSelecionadas] = useState<
    Record<number, number>
  >({});
  const saboresRef = useRef<HTMLElement | null>(null);
  const adicionaisRef = useRef<HTMLElement | null>(null);
  const bebidasRef = useRef<HTMLElement | null>(null);
  const bordasRef = useRef<HTMLElement | null>(null);

  const maxSabores = 2;
  const minSabores = tamanhoSelecionado === "G" ? 1 : 2;
  const faltamMinimo = Math.max(0, minSabores - saboresSelecionados.length);

  const precoBaseCalculado = useMemo(() => {
    if (saboresSelecionados.length === 0) return 0;

    const precos = saboresSelecionados.map((pizzaId) => {
      const pizza = pizzas.find((p) => p.id === pizzaId);
      const tamanho = pizza?.tamanhos.find(
        (t) => t.tamanho === tamanhoSelecionado,
      );
      return Number(tamanho?.preco || 0);
    });

    return Math.max(...precos);
  }, [pizzas, saboresSelecionados, tamanhoSelecionado]);

  const adicionaisEscolhidos = useMemo(
    () =>
      ADICIONAIS_PIZZA.filter((adicional) =>
        adicionaisSelecionados.includes(adicional.nome),
      ),
    [adicionaisSelecionados],
  );

  const bordaExtraSelecionada = useMemo(
    () =>
      bordasExtras.find((borda) => borda.id === bordaExtraSelecionadaId) ||
      null,
    [bordaExtraSelecionadaId, bordasExtras],
  );

  const precoAdicionais = useMemo(
    () =>
      adicionaisEscolhidos.reduce((acc, adicional) => acc + adicional.preco, 0),
    [adicionaisEscolhidos],
  );

  const bebidasEscolhidas = useMemo(
    () =>
      bebidas
        .map((bebida) => ({
          ...bebida,
          quantidade: bebidasSelecionadas[bebida.id] || 0,
        }))
        .filter((bebida) => bebida.quantidade > 0),
    [bebidas, bebidasSelecionadas],
  );

  const quantidadeBebidas = useMemo(
    () => bebidasEscolhidas.reduce((acc, bebida) => acc + bebida.quantidade, 0),
    [bebidasEscolhidas],
  );

  const precoBebidas = useMemo(
    () =>
      bebidasEscolhidas.reduce(
        (acc, bebida) => acc + bebida.preco * bebida.quantidade,
        0,
      ),
    [bebidasEscolhidas],
  );

  const precoBordaExtra = bordaExtraSelecionada?.preco || 0;
  const precoCalculado =
    precoBaseCalculado + precoAdicionais + precoBordaExtra + precoBebidas;

  const pizzasFiltradas = useMemo(() => {
    const termo = normalizeText(buscaSabor.trim());

    return pizzas
      .filter((pizza) => {
        if (!termo) return true;
        return normalizeText(`${pizza.nome} ${pizza.descricao || ""}`).includes(
          termo,
        );
      })
      .sort((a, b) => {
        const aSelected = saboresSelecionados.includes(a.id) ? 0 : 1;
        const bSelected = saboresSelecionados.includes(b.id) ? 0 : 1;
        if (aSelected !== bSelected) return aSelected - bSelected;
        return a.nome.localeCompare(b.nome);
      });
  }, [buscaSabor, pizzas, saboresSelecionados]);

  const toggleSabor = (pizzaId: number) => {
    setSaboresSelecionados((prev) => {
      if (prev.includes(pizzaId)) return prev.filter((id) => id !== pizzaId);
      if (prev.length >= maxSabores) {
        toast.error(`Esse tamanho permite no maximo ${maxSabores} sabores`);
        return prev;
      }
      return [...prev, pizzaId];
    });
  };

  const handleTamanho = (tamanho: string) => {
    setTamanhoSelecionado(tamanho);
    const novoMax = 2;
    setSaboresSelecionados((prev) => prev.slice(0, novoMax));
  };

  const toggleAdicional = (nomeAdicional: string) => {
    setAdicionaisSelecionados((prev) =>
      prev.includes(nomeAdicional)
        ? prev.filter((item) => item !== nomeAdicional)
        : [...prev, nomeAdicional],
    );
  };

  const updateBebidaQuantidade = (bebidaId: number, delta: number) => {
    setBebidasSelecionadas((prev) => {
      const atual = prev[bebidaId] || 0;
      const proxima = Math.max(0, Math.min(20, atual + delta));
      if (proxima === 0) {
        const clone = { ...prev };
        delete clone[bebidaId];
        return clone;
      }
      return { ...prev, [bebidaId]: proxima };
    });
  };

  const handleAddToCart = () => {
    if (saboresSelecionados.length < minSabores) {
      toast.error(
        `Escolha ${minSabores} ${minSabores === 1 ? "sabor" : "sabores"}`,
      );
      return;
    }

    const nomesSabores = saboresSelecionados
      .map((id) => pizzas.find((p) => p.id === id)?.nome)
      .filter(Boolean)
      .join(" + ");

    const obs = [
      `Sabores: ${nomesSabores}`,
      adicionaisEscolhidos.length
        ? `Adicionais: ${adicionaisEscolhidos.map((item) => `${item.nome} (+${formatCurrency(item.preco)})`).join(", ")}`
        : "",
      bordaExtraSelecionada
        ? `Borda extra: ${bordaExtraSelecionada.nome} (+${formatCurrency(bordaExtraSelecionada.preco)})`
        : "",
      bebidasEscolhidas.length
        ? `Bebidas: ${bebidasEscolhidas.map((item) => `${item.nome} x${item.quantidade} (${formatCurrency(item.preco * item.quantidade)})`).join(", ")}`
        : "",
    ]
      .filter(Boolean)
      .join(" | ");

    add({
      pratoId: 999,
      nome: `Pizza Mista (${saboresSelecionados.length} sabores)`,
      preco: precoCalculado,
      tamanho: tamanhoSelecionado,
      observacoes: obs,
      adicionais: adicionaisEscolhidos,
      bordaId: bordaExtraSelecionada?.id,
      bordaNome: bordaExtraSelecionada?.nome,
      bordaPreco: bordaExtraSelecionada?.preco,
    });

    bebidasEscolhidas.forEach((bebida) => {
      add(
        {
          pratoId: bebida.id,
          nome: bebida.nome,
          preco: bebida.preco,
        },
        bebida.quantidade,
      );
    });

    toast.success(
      bebidasEscolhidas.length > 0
        ? "Pizza e bebidas adicionadas ao carrinho!"
        : "Pizza adicionada ao carrinho!",
    );
    setSaboresSelecionados([]);
    setTamanhoSelecionado("M");
    setBuscaSabor("");
    setAdicionaisSelecionados([]);
    setBordaExtraSelecionadaId(null);
    setBebidasSelecionadas({});
    onOpenChange(false);
  };

  const scrollToSection = (ref: React.RefObject<HTMLElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[92dvh] w-[96vw] overflow-y-auto overscroll-contain rounded-2xl border-0 p-0 sm:max-w-4xl">
        <div className="relative flex h-full flex-col bg-[#fff7ea]">
          <DialogHeader className="shrink-0 border-b border-[#ead7bd] bg-white px-4 py-4">
            <DialogTitle className="flex items-center gap-3 text-xl font-black text-[#241313]">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff0f0] text-[#c90010]">
                <Pizza className="h-6 w-6" />
              </span>
              Monte sua pizza
            </DialogTitle>
            <DialogDescription className="sr-only">
              Modal para escolher sabores e adicionar pizza mista ao carrinho.
            </DialogDescription>
            <p className="text-sm font-medium text-[#6f6461]">
              Escolha o tamanho e combine seus sabores favoritos.
            </p>
          </DialogHeader>

          <div className="min-h-0 flex-1 px-4 pb-5 pt-4 touch-pan-y [-webkit-overflow-scrolling:touch]">
            <div className="grid grid-cols-3 gap-2">
              {TAMANHOS.map((tamanho) => {
                const ativo = tamanhoSelecionado === tamanho.id;
                return (
                  <button
                    key={tamanho.id}
                    type="button"
                    onClick={() => handleTamanho(tamanho.id)}
                    className={`rounded-2xl border p-3 text-center transition ${
                      ativo
                        ? "border-[#c90010] bg-white text-[#c90010] shadow-md"
                        : "border-[#ead7bd] bg-white/70 text-[#241313]"
                    }`}
                  >
                    <span className="block text-xl font-black">
                      {tamanho.id}
                    </span>
                    <span className="block text-[11px] font-bold">
                      {tamanho.regra}
                    </span>
                    <span className="block text-[11px] text-[#6f6461]">
                      {tamanho.fatias}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 rounded-2xl border border-[#ffc984] bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-[#9a0007]">
                    Sabores {saboresSelecionados.length}/{maxSabores}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#6f6461]">
                    {faltamMinimo > 0
                      ? `Faltam ${faltamMinimo} para continuar`
                      : "Pronta para adicionar"}
                  </p>
                </div>
                <div className="text-right text-2xl font-black text-[#c90010]">
                  R$ {precoCalculado.toFixed(2).replace(".", ",")}
                </div>
              </div>

              {precoAdicionais > 0 ||
              precoBebidas > 0 ||
              precoBordaExtra > 0 ? (
                <p className="mt-2 text-xs font-semibold text-[#7a2900]">
                  Base: {formatCurrency(precoBaseCalculado)}
                  {precoAdicionais > 0
                    ? ` | Adicionais: +${formatCurrency(precoAdicionais)}`
                    : ""}
                  {precoBebidas > 0
                    ? ` | Bebidas: +${formatCurrency(precoBebidas)}`
                    : ""}
                  {precoBordaExtra > 0
                    ? ` | Borda: +${formatCurrency(precoBordaExtra)}`
                    : ""}
                </p>
              ) : null}

              {saboresSelecionados.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {saboresSelecionados.map((id) => {
                    const sabor = pizzas.find((p) => p.id === id);
                    if (!sabor) return null;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => toggleSabor(id)}
                        className="inline-flex items-center gap-1 rounded-full bg-[#fff0f0] px-3 py-1 text-xs font-bold text-[#c90010]"
                      >
                        {sabor.nome}
                        <X className="h-3 w-3" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="sticky top-0 z-20 mt-4 rounded-2xl border border-[#ead7bd] bg-white/95 p-2 shadow-sm backdrop-blur">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <button
                  type="button"
                  onClick={() => scrollToSection(saboresRef)}
                  className="rounded-xl border border-[#ead7bd] bg-[#fff7ea] px-2 py-2 text-xs font-black text-[#7a2900] transition hover:border-[#c90010] hover:text-[#c90010]"
                >
                  Sabores ({saboresSelecionados.length})
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection(adicionaisRef)}
                  className="rounded-xl border border-[#ead7bd] bg-[#fff7ea] px-2 py-2 text-xs font-black text-[#7a2900] transition hover:border-[#c90010] hover:text-[#c90010]"
                >
                  Adicionais ({adicionaisSelecionados.length})
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection(bebidasRef)}
                  className="rounded-xl border border-[#ead7bd] bg-[#fff7ea] px-2 py-2 text-xs font-black text-[#7a2900] transition hover:border-[#c90010] hover:text-[#c90010]"
                >
                  Bebidas ({quantidadeBebidas})
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection(bordasRef)}
                  className="rounded-xl border border-[#ead7bd] bg-[#fff7ea] px-2 py-2 text-xs font-black text-[#7a2900] transition hover:border-[#c90010] hover:text-[#c90010]"
                >
                  Bordas {bordaExtraSelecionada ? "(1)" : "(0)"}
                </button>
              </div>
            </div>

            <div className="relative mt-3">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#c90010]" />
              <input
                type="search"
                value={buscaSabor}
                onChange={(e) => setBuscaSabor(e.target.value)}
                placeholder="Buscar sabor..."
                className="h-[52px] w-full rounded-2xl border border-[#ead7bd] bg-white pl-12 pr-4 text-sm outline-none focus:border-[#c90010] focus:ring-2 focus:ring-[#ffd15a]/40"
              />
            </div>

            <section ref={saboresRef} className="mt-4">
              <h3 className="mb-3 text-lg font-black text-[#241313]">
                1. Sabores
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {pizzasFiltradas.map((pizza) => {
                  const selecionado = saboresSelecionados.includes(pizza.id);
                  const tamanho = pizza.tamanhos.find(
                    (t) => t.tamanho === tamanhoSelecionado,
                  );

                  return (
                    <button
                      key={pizza.id}
                      type="button"
                      onClick={() => toggleSabor(pizza.id)}
                      className={`grid grid-cols-[82px_1fr] gap-3 rounded-2xl border bg-white p-2 text-left transition ${
                        selecionado
                          ? "border-[#c90010] ring-2 ring-[#c90010]/15"
                          : "border-[#ead7bd] hover:border-[#c90010]"
                      }`}
                    >
                      <span className="relative h-20 overflow-hidden rounded-xl bg-[#fff3e2]">
                        {pizza.imagem ? (
                          <Image
                            src={pizza.imagem}
                            alt={pizza.nome}
                            fill
                            sizes="82px"
                            className="object-cover"
                          />
                        ) : (
                          <Pizza className="m-auto h-full w-10 text-[#c90010]" />
                        )}
                      </span>
                      <span className="min-w-0 py-1">
                        <span className="flex items-start justify-between gap-2">
                          <span className="line-clamp-2 text-sm font-black text-[#241313]">
                            {pizza.nome}
                          </span>
                          {selecionado && (
                            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#c90010] text-white">
                              <Check className="h-4 w-4" />
                            </span>
                          )}
                        </span>
                        <span className="mt-1 line-clamp-2 text-xs text-[#6f6461]">
                          {pizza.descricao || "Sabor especial da casa"}
                        </span>
                        <span className="mt-2 inline-flex items-center gap-1 text-sm font-black text-[#c90010]">
                          <Sparkles className="h-3.5 w-3.5" />
                          R${" "}
                          {Number(tamanho?.preco || pizza.preco)
                            .toFixed(2)
                            .replace(".", ",")}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section ref={adicionaisRef} className="mt-6 scroll-mt-28">
              <h3 className="mb-3 text-lg font-black text-[#241313]">
                2. Adicionais
              </h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {ADICIONAIS_PIZZA.map((adicional) => {
                  const checked = adicionaisSelecionados.includes(
                    adicional.nome,
                  );
                  return (
                    <button
                      key={adicional.nome}
                      type="button"
                      onClick={() => toggleAdicional(adicional.nome)}
                      className={`flex min-h-12 items-center justify-between gap-2 rounded-2xl border px-3 text-left text-sm font-bold transition ${
                        checked
                          ? "border-[#c90010] bg-[#fff0f0] text-[#c90010]"
                          : "border-[#ead7bd] bg-white text-[#241313]"
                      }`}
                    >
                      <span>{adicional.nome}</span>
                      <span className="inline-flex items-center gap-1 text-xs font-black">
                        +{formatCurrency(adicional.preco)}
                        {checked ? <Check className="h-4 w-4" /> : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {bebidas.length > 0 && (
              <section ref={bebidasRef} className="mt-6 scroll-mt-28">
                <h3 className="mb-3 text-lg font-black text-[#241313]">
                  3. Bebidas
                </h3>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {bebidas.map((bebida) => {
                    const quantidade = bebidasSelecionadas[bebida.id] || 0;
                    return (
                      <div
                        key={bebida.id}
                        className={`flex min-h-12 items-center justify-between gap-2 rounded-2xl border px-3 py-2 text-left text-sm font-bold transition ${
                          quantidade > 0
                            ? "border-[#c90010] bg-[#fff0f0] text-[#c90010]"
                            : "border-[#ead7bd] bg-white text-[#241313]"
                        }`}
                      >
                        <div>
                          <p className="font-bold">{bebida.nome}</p>
                          <p className="text-xs">
                            +{formatCurrency(bebida.preco)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              updateBebidaQuantidade(bebida.id, -1)
                            }
                            className="grid h-8 w-8 place-items-center rounded-full border border-[#d7c3a5] bg-white"
                            aria-label={`Remover uma unidade de ${bebida.nome}`}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-5 text-center text-sm font-black">
                            {quantidade}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateBebidaQuantidade(bebida.id, 1)}
                            className="grid h-8 w-8 place-items-center rounded-full border border-[#d7c3a5] bg-white"
                            aria-label={`Adicionar uma unidade de ${bebida.nome}`}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-2 flex items-center gap-2 text-xs font-semibold text-[#6f6461]">
                  <CupSoda className="h-4 w-4 text-[#c90010]" />
                  As bebidas escolhidas entram como itens separados no carrinho.
                </p>
              </section>
            )}

            {bordasExtras.length > 0 && (
              <section ref={bordasRef} className="mt-6 scroll-mt-28">
                <h3 className="mb-3 text-lg font-black text-[#241313]">
                  4. Bordas extras
                </h3>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setBordaExtraSelecionadaId(null)}
                    className={`flex min-h-12 items-center justify-between gap-2 rounded-2xl border px-3 text-left text-sm font-bold transition ${
                      bordaExtraSelecionadaId === null
                        ? "border-[#c90010] bg-[#fff0f0] text-[#c90010]"
                        : "border-[#ead7bd] bg-white text-[#241313]"
                    }`}
                  >
                    <span>Sem borda extra</span>
                    {bordaExtraSelecionadaId === null ? (
                      <Check className="h-4 w-4" />
                    ) : null}
                  </button>

                  {bordasExtras.map((borda) => {
                    const checked = bordaExtraSelecionadaId === borda.id;
                    return (
                      <button
                        key={borda.id}
                        type="button"
                        onClick={() => setBordaExtraSelecionadaId(borda.id)}
                        className={`flex min-h-12 items-center justify-between gap-2 rounded-2xl border px-3 text-left text-sm font-bold transition ${
                          checked
                            ? "border-[#c90010] bg-[#fff0f0] text-[#c90010]"
                            : "border-[#ead7bd] bg-white text-[#241313]"
                        }`}
                      >
                        <span>{borda.nome}</span>
                        <span className="inline-flex items-center gap-1">
                          +{formatCurrency(borda.preco)}
                          {checked ? <Check className="h-4 w-4" /> : null}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          <div className="sticky bottom-0 shrink-0 border-t border-[#ead7bd] bg-white/95 p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] shadow-[0_-12px_30px_rgba(57,31,22,0.12)] backdrop-blur">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSaboresSelecionados([])}
                className="h-[52px] w-[52px] rounded-2xl border-[#ead7bd] p-0"
                aria-label="Limpar sabores"
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                onClick={handleAddToCart}
                disabled={saboresSelecionados.length < minSabores}
                className="h-[52px] flex-1 rounded-2xl bg-[#d71920] text-base font-black text-white hover:bg-[#b50008] disabled:bg-[#f5a08a]"
              >
                Adicionar • R$ {precoCalculado.toFixed(2).replace(".", ",")}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
