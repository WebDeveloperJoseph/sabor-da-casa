"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Check, Heart, Minus, Plus, ShieldCheck, Star, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "./CartProvider";
import { toast } from "sonner";

type IngredienteTag = {
  ingrediente: { id: number; nome: string; alergenico: boolean };
};

type TamanhoType = { tamanho: string; preco: number };
type BordaExtraOption = { id: number; nome: string; preco: number };

type ProductDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoriaNome?: string;
  bordasExtras?: BordaExtraOption[];
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
};

const fatiasByTamanho: Record<string, string> = {
  P: "4 fatias",
  M: "6 fatias",
  G: "8 fatias",
  F: "12 fatias",
};

const adicionais = [
  { nome: "Bacon", preco: 3 },
  { nome: "Azeitona", preco: 2 },
  { nome: "Milho", preco: 2 },
  { nome: "Requeijao cremoso", preco: 8 },
  { nome: "Creme cheese", preco: 8 },
  { nome: "Requeijao cheddar", preco: 8 },
  { nome: "Fatia de chocolate ao leite", preco: 6 },
  { nome: "Fatia de 2 amores", preco: 6 },
  { nome: "Fatia de banana nevada", preco: 6 },
  { nome: "Fatia de Romeu e julieta", preco: 6 },
  { nome: "Fatia de banana com chocolate", preco: 6 },
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

const isBebidaContext = (nomeCategoria?: string, nomePrato?: string) => {
  const texto = normalizeText(`${nomeCategoria || ""} ${nomePrato || ""}`);
  return (
    texto.includes("bebida") ||
    texto.includes("refrigerante") ||
    texto.includes("suco") ||
    texto.includes("agua") ||
    texto.includes("cerveja")
  );
};

const isPizzaCategory = (nomeCategoria?: string) => {
  const categoria = normalizeText(nomeCategoria || "");
  return categoria.includes("pizza") || categoria.includes("tradicional");
};

export function ProductDetailDialog({
  open,
  onOpenChange,
  categoriaNome,
  bordasExtras = [],
  prato,
}: ProductDetailDialogProps) {
  const { add, settings } = useCart();
  const tamanhos = useMemo(
    () => (prato.tamanhos?.length ? prato.tamanhos : []),
    [prato.tamanhos],
  );
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState(
    tamanhos[0]?.tamanho || "",
  );
  const [quantidade, setQuantidade] = useState(1);
  const [qtyAnim, setQtyAnim] = useState<"up" | "down">("up");
  const [observacoes, setObservacoes] = useState("");
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [bordaExtraSelecionadaId, setBordaExtraSelecionadaId] = useState<
    number | null
  >(null);
  const [favorite, setFavorite] = useState(false);
  const [heartBurst, setHeartBurst] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  const precoUnitario = useMemo(() => {
    if (tamanhos.length) {
      return (
        tamanhos.find((t) => t.tamanho === tamanhoSelecionado)?.preco ??
        tamanhos[0].preco
      );
    }

    return Number(prato.preco);
  }, [prato.preco, tamanhoSelecionado, tamanhos]);

  const rating = prato.rating?.avg || 4.8;
  const ratingCount = prato.rating?.count || 0;
  const isBebida = isBebidaContext(categoriaNome, prato.nome);
  const isPizza = useMemo(
    () => isPizzaCategory(categoriaNome),
    [categoriaNome],
  );
  const bordaExtraSelecionada = useMemo(
    () =>
      bordasExtras.find((borda) => borda.id === bordaExtraSelecionadaId) ||
      null,
    [bordasExtras, bordaExtraSelecionadaId],
  );
  const adicionaisSelecionados = useMemo(
    () =>
      adicionais.filter((adicional) => selecionados.includes(adicional.nome)),
    [selecionados],
  );
  const precoAdicionais = useMemo(
    () =>
      adicionaisSelecionados.reduce(
        (acc, adicional) => acc + adicional.preco,
        0,
      ),
    [adicionaisSelecionados],
  );
  const precoBordaExtra = bordaExtraSelecionada?.preco || 0;
  const precoUnitarioFinal = precoUnitario + precoBordaExtra + precoAdicionais;
  const totalComExtras = precoUnitarioFinal * quantidade;
  const exibirBordasExtras = !isBebida && isPizza && bordasExtras.length > 0;

  const toggleSolicitacao = (item: string) => {
    setSelecionados((prev) =>
      prev.includes(item)
        ? prev.filter((value) => value !== item)
        : [...prev, item],
    );
  };

  const handleAdd = () => {
    if (!settings.aceitarPedidos) {
      toast.error("Pedidos estao temporariamente pausados.");
      return;
    }

    const obs = [
      adicionaisSelecionados.length
        ? `Adicionais: ${adicionaisSelecionados.map((item) => `${item.nome} (+${formatCurrency(item.preco)})`).join(", ")}`
        : "",
      bordaExtraSelecionada
        ? `Borda extra: ${bordaExtraSelecionada.nome} (+${formatCurrency(bordaExtraSelecionada.preco)})`
        : "",
      observacoes.trim(),
    ]
      .filter(Boolean)
      .join(" | ");

    setIsAdding(true);
    add(
      {
        pratoId: prato.id,
        nome: prato.nome,
        preco: precoUnitarioFinal,
        tamanho: tamanhos.length ? tamanhoSelecionado : undefined,
        observacoes: obs || undefined,
      },
      quantidade,
    );

    toast.success(`${prato.nome} adicionado ao carrinho`);
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(18);
    }
    setQuantidade(1);
    setObservacoes("");
    setSelecionados([]);
    setBordaExtraSelecionadaId(null);
    window.setTimeout(() => {
      setIsAdding(false);
      onOpenChange(false);
    }, 240);
  };

  const changeQty = (next: number, direction: "up" | "down") => {
    setQtyAnim(direction);
    setQuantidade(next);
  };

  const triggerFavorite = () => {
    setFavorite((value) => !value);
    setHeartBurst((value) => value + 1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="bottom-0 top-auto left-1/2 h-[94dvh] w-[96vw] translate-x-[-50%] translate-y-0 overflow-y-auto overscroll-contain rounded-t-[1.75rem] rounded-b-none border-0 bg-[#fff7ea] p-0 data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom sm:bottom-4 sm:max-w-3xl sm:rounded-[1.75rem]"
      >
        <div className="flex h-full flex-col">
          <div className="relative h-[28vh] min-h-52 shrink-0 overflow-hidden bg-[#2b1212]">
            {prato.imagem ? (
              <Image
                src={prato.imagem}
                alt={prato.nome}
                fill
                sizes="(max-width: 768px) 96vw, 768px"
                className="object-cover"
                priority
              />
            ) : (
              <div className="grid h-full place-items-center text-white">
                {prato.nome}
              </div>
            )}
            <div className="absolute inset-0 bg-linear-to-b from-black/25 via-black/5 to-black/25" />
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="absolute left-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white text-[#241313] shadow-lg"
              aria-label="Voltar"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={triggerFavorite}
              className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white text-[#241313] shadow-lg"
              aria-label={`Favoritar ${prato.nome}`}
            >
              <Heart
                className={`h-5 w-5 ${favorite ? "anim-heart-pop fill-[#d71920] text-[#d71920]" : ""}`}
              />
              {heartBurst > 0 &&
                [0, 1, 2, 3].map((index) => (
                  <span
                    key={`${heartBurst}-${index}`}
                    className={`pointer-events-none absolute text-[11px] text-[#d71920] anim-heart-float heart-particle-${index}`}
                  >
                    ❤
                  </span>
                ))}
            </button>
          </div>

          <div className="-mt-7 min-h-0 flex-1 rounded-t-4xl bg-[#fff7ea] px-4 pb-5 pt-3 touch-pan-y [-webkit-overflow-scrolling:touch]">
            <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-[#d8c7b3]" />
            <DialogHeader className="text-left">
              <DialogTitle className="text-3xl font-black leading-tight text-[#241313]">
                {prato.nome}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Modal de detalhes do produto com personalizacao e adicao ao
                carrinho.
              </DialogDescription>
              <p className="text-base leading-6 text-[#6f6461]">
                {prato.descricao || "Receita especial da casa."}
              </p>
            </DialogHeader>

            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="inline-flex items-center gap-2 text-sm font-bold text-[#241313]">
                <Star className="h-5 w-5 fill-[#f7b500] text-[#f7b500]" />
                {rating.toFixed(1)}
                <span className="font-medium text-[#7b706c]">
                  {ratingCount ? `(${ratingCount} avaliacoes)` : "Muito pedido"}
                </span>
              </div>
              <div className="text-3xl font-black text-[#c90010]">
                {formatCurrency(precoUnitario)}
              </div>
            </div>

            {tamanhos.length > 0 && (
              <section className="mt-6">
                <h3 className="mb-3 text-lg font-black text-[#241313]">
                  1. Tamanho
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {tamanhos.map((tamanho) => {
                    const ativo = tamanhoSelecionado === tamanho.tamanho;
                    return (
                      <button
                        key={tamanho.tamanho}
                        type="button"
                        onClick={() => {
                          setTamanhoSelecionado(tamanho.tamanho);
                        }}
                        className={`rounded-2xl border p-3 text-center transition ${
                          ativo
                            ? "border-[#c90010] bg-white text-[#c90010] shadow-md ring-2 ring-[#c90010]/10 scale-[1.03]"
                            : "border-[#ead7bd] bg-white text-[#241313]"
                        }`}
                      >
                        {ativo && (
                          <span className="mx-auto mb-1 block h-0.5 w-8 rounded-full bg-[#ffd15a] anim-fade-up" />
                        )}
                        <span className="block text-xl font-black">
                          {tamanho.tamanho}
                        </span>
                        <span className="block text-[11px] text-[#6f6461]">
                          {fatiasByTamanho[tamanho.tamanho] || "Tamanho"}
                        </span>
                        <span className="mt-1 block text-sm font-black text-[#c90010]">
                          {formatCurrency(tamanho.preco)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {!isBebida && (
              <section className="mt-6">
                <h3 className="mb-3 text-lg font-black text-[#241313]">
                  2. Adicionais
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {adicionais.map((item) => {
                    const checked = selecionados.includes(item.nome);
                    return (
                      <button
                        key={item.nome}
                        type="button"
                        onClick={() => toggleSolicitacao(item.nome)}
                        className={`flex min-h-12 items-center gap-2 rounded-2xl border px-3 text-left text-sm font-bold transition ${
                          checked
                            ? "border-[#c90010] bg-[#fff0f0] text-[#c90010]"
                            : "border-[#ead7bd] bg-white text-[#241313]"
                        }`}
                      >
                        <span
                          className={`grid h-5 w-5 shrink-0 place-items-center rounded border ${
                            checked
                              ? "border-[#c90010] bg-[#c90010] text-white"
                              : "border-[#c9b9a7]"
                          }`}
                        >
                          {checked && (
                            <Check className="h-3.5 w-3.5 anim-check-pop" />
                          )}
                        </span>
                        <span className="flex-1">{item.nome}</span>
                        <span className="text-xs font-black">
                          +{formatCurrency(item.preco)}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs font-medium text-[#7b706c]">
                  Os adicionais escolhidos entram no valor do item e nas
                  observacoes para a cozinha.
                </p>
              </section>
            )}

            {exibirBordasExtras && (
              <section className="mt-6">
                <h3 className="mb-3 text-lg font-black text-[#241313]">
                  3. Bordas extras
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
                    {bordaExtraSelecionadaId === null && (
                      <Check className="h-4 w-4" />
                    )}
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
                          {checked && <Check className="h-4 w-4" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs font-medium text-[#7b706c]">
                  As bordas extras sao carregadas automaticamente do painel
                  administrativo.
                </p>
              </section>
            )}

            {!isBebida && prato.ingredientes.length > 0 && (
              <section className="mt-6 rounded-2xl border border-[#ead7bd] bg-white p-4">
                <h3 className="mb-3 text-lg font-black text-[#241313]">
                  Ingredientes
                </h3>
                <div className="flex flex-wrap gap-2">
                  {prato.ingredientes.map((item) => (
                    <span
                      key={item.ingrediente.id}
                      className="rounded-full bg-[#fff7ea] px-3 py-1.5 text-xs font-bold text-[#6f6461]"
                    >
                      {item.ingrediente.nome}
                    </span>
                  ))}
                </div>
              </section>
            )}

            <section className="mt-6">
              <h3 className="mb-3 text-lg font-black text-[#241313]">
                {isBebida
                  ? "2. Observacoes"
                  : exibirBordasExtras
                    ? "4. Observacoes"
                    : "3. Observacoes"}
              </h3>
              <Textarea
                value={observacoes}
                onChange={(event) => setObservacoes(event.target.value)}
                placeholder="Ex.: sem cebola, pouco molho, bem passada..."
                className="h-24 min-h-24 max-h-24 resize-none overflow-y-auto rounded-2xl border-[#ead7bd] bg-white text-sm field-sizing-fixed"
                maxLength={160}
              />
              <div className="mt-2 flex items-center gap-2 text-xs font-medium text-[#527a4f]">
                <ShieldCheck className="h-4 w-4" />
                Pedido enviado com suas preferencias.
              </div>
            </section>
          </div>

          <div className="sticky bottom-0 shrink-0 border-t border-[#ead7bd] bg-white/95 p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] shadow-[0_-12px_30px_rgba(57,31,22,0.12)] backdrop-blur">
            <div className="flex gap-3">
              <div className="flex h-14 items-center rounded-2xl border border-[#ead7bd] bg-white">
                <button
                  type="button"
                  onClick={() => changeQty(Math.max(1, quantidade - 1), "down")}
                  className="grid h-14 w-12 place-items-center text-[#241313]"
                  aria-label="Diminuir quantidade"
                >
                  <Minus className="h-5 w-5" />
                </button>
                <span
                  key={`${quantidade}-${qtyAnim}`}
                  className={`w-8 text-center text-lg font-black ${qtyAnim === "up" ? "anim-qty-up" : "anim-qty-down"}`}
                >
                  {quantidade}
                </span>
                <button
                  type="button"
                  onClick={() => changeQty(quantidade + 1, "up")}
                  className="grid h-14 w-12 place-items-center text-[#241313]"
                  aria-label="Aumentar quantidade"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              <Button
                type="button"
                onClick={handleAdd}
                className={`h-14 flex-1 rounded-2xl text-base font-black text-white shadow-lg transition ${
                  isAdding
                    ? "anim-soft-bounce bg-[#21a358]"
                    : "bg-[#d71920] hover:bg-[#b50008]"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  {isAdding ? (
                    <Check className="h-5 w-5 anim-check-pop" />
                  ) : null}
                  {isAdding
                    ? "Adicionado"
                    : `Adicionar • ${formatCurrency(totalComExtras)}`}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
