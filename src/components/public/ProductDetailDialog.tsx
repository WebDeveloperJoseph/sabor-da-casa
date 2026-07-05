"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Check, Heart, Minus, Plus, ShieldCheck, Star, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
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

type ProductDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

const solicitacoes = [
  "Extra de queijo",
  "Azeitona",
  "Bacon",
  "Milho",
  "Pouco oregano",
  "Sem cebola",
];

const formatCurrency = (value: number) =>
  `R$ ${value.toFixed(2).replace(".", ",")}`;

export function ProductDetailDialog({
  open,
  onOpenChange,
  prato,
}: ProductDetailDialogProps) {
  const { add, settings } = useCart();
  const tamanhos = prato.tamanhos?.length ? prato.tamanhos : [];
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState(
    tamanhos[0]?.tamanho || "",
  );
  const [quantidade, setQuantidade] = useState(1);
  const [observacoes, setObservacoes] = useState("");
  const [selecionados, setSelecionados] = useState<string[]>([]);

  const precoUnitario = useMemo(() => {
    if (tamanhos.length) {
      return (
        tamanhos.find((t) => t.tamanho === tamanhoSelecionado)?.preco ??
        tamanhos[0].preco
      );
    }

    return Number(prato.preco);
  }, [prato.preco, tamanhoSelecionado, tamanhos]);

  const total = precoUnitario * quantidade;
  const rating = prato.rating?.avg || 4.8;
  const ratingCount = prato.rating?.count || 0;

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
      selecionados.length ? `Solicitacoes: ${selecionados.join(", ")}` : "",
      observacoes.trim(),
    ]
      .filter(Boolean)
      .join(" | ");

    add(
      {
        pratoId: prato.id,
        nome: prato.nome,
        preco: precoUnitario,
        tamanho: tamanhos.length ? tamanhoSelecionado : undefined,
        observacoes: obs || undefined,
      },
      quantidade,
    );

    toast.success(`${prato.nome} adicionado ao carrinho`);
    setQuantidade(1);
    setObservacoes("");
    setSelecionados([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="h-[94dvh] w-[96vw] overflow-hidden rounded-[1.75rem] border-0 bg-[#fff7ea] p-0 sm:max-w-3xl"
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
              className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white text-[#241313] shadow-lg"
              aria-label={`Favoritar ${prato.nome}`}
            >
              <Heart className="h-5 w-5" />
            </button>
          </div>

          <div className="-mt-7 min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-t-[2rem] bg-[#fff7ea] px-4 pb-28 pt-3 [-webkit-overflow-scrolling:touch]">
            <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-[#d8c7b3]" />
            <DialogHeader className="text-left">
              <DialogTitle className="text-3xl font-black leading-tight text-[#241313]">
                {prato.nome}
              </DialogTitle>
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
                        onClick={() => setTamanhoSelecionado(tamanho.tamanho)}
                        className={`rounded-2xl border p-3 text-center transition ${
                          ativo
                            ? "border-[#c90010] bg-white text-[#c90010] shadow-md ring-2 ring-[#c90010]/10"
                            : "border-[#ead7bd] bg-white text-[#241313]"
                        }`}
                      >
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

            <section className="mt-6">
              <h3 className="mb-3 text-lg font-black text-[#241313]">
                2. Preferencias do preparo
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {solicitacoes.map((item) => {
                  const checked = selecionados.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleSolicitacao(item)}
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
                        {checked && <Check className="h-3.5 w-3.5" />}
                      </span>
                      {item}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs font-medium text-[#7b706c]">
                Essas preferencias entram nas observacoes do item para a cozinha.
              </p>
            </section>

            {prato.ingredientes.length > 0 && (
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
                <p className="mt-3 text-xs font-medium text-[#7b706c]">
                  Ingredientes cadastrados no painel administrativo.
                </p>
              </section>
            )}

            <section className="mt-6">
              <h3 className="mb-3 text-lg font-black text-[#241313]">
                3. Observacoes
              </h3>
              <Textarea
                value={observacoes}
                onChange={(event) => setObservacoes(event.target.value)}
                placeholder="Ex.: sem cebola, pouco molho, bem passada..."
                className="min-h-24 rounded-2xl border-[#ead7bd] bg-white text-sm"
                maxLength={160}
              />
              <div className="mt-2 flex items-center gap-2 text-xs font-medium text-[#527a4f]">
                <ShieldCheck className="h-4 w-4" />
                Pedido enviado com suas preferencias.
              </div>
            </section>
          </div>

          <div className="absolute inset-x-0 bottom-0 shrink-0 border-t border-[#ead7bd] bg-white/95 p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] shadow-[0_-12px_30px_rgba(57,31,22,0.12)] backdrop-blur">
            <div className="flex gap-3">
              <div className="flex h-14 items-center rounded-2xl border border-[#ead7bd] bg-white">
                <button
                  type="button"
                  onClick={() => setQuantidade((value) => Math.max(1, value - 1))}
                  className="grid h-14 w-12 place-items-center text-[#241313]"
                  aria-label="Diminuir quantidade"
                >
                  <Minus className="h-5 w-5" />
                </button>
                <span className="w-8 text-center text-lg font-black">
                  {quantidade}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantidade((value) => value + 1)}
                  className="grid h-14 w-12 place-items-center text-[#241313]"
                  aria-label="Aumentar quantidade"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              <Button
                type="button"
                onClick={handleAdd}
                className="h-14 flex-1 rounded-2xl bg-[#d71920] text-base font-black text-white shadow-lg hover:bg-[#b50008]"
              >
                Adicionar • {formatCurrency(total)}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
