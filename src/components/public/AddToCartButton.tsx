"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "./CartProvider";
import { Check, Plus } from "lucide-react";

export function AddToCartButton({
  pratoId,
  nome,
  preco,
  tamanhos,
}: {
  pratoId: number;
  nome: string;
  preco: number;
  tamanhos?: Array<{ tamanho: string; preco: number }>;
}) {
  const { add, settings } = useCart();
  const disabled = !settings.aceitarPedidos;

  const temTamanhos = tamanhos && tamanhos.length > 0;
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState<string>(
    temTamanhos ? tamanhos[0].tamanho : "",
  );
  const [adicionado, setAdicionado] = useState(false);
  const [ripple, setRipple] = useState(false);

  const precoFinal = temTamanhos
    ? (tamanhos.find((t) => t.tamanho === tamanhoSelecionado)?.preco ?? preco)
    : preco;

  const handleAdd = () => {
    setRipple(true);
    add(
      {
        pratoId,
        nome,
        preco: precoFinal,
        tamanho: temTamanhos ? tamanhoSelecionado : undefined,
      },
      1,
    );

    setAdicionado(true);
    window.setTimeout(() => setRipple(false), 280);
    window.setTimeout(() => setAdicionado(false), 900);
  };

  return (
    <div className="flex w-full flex-col gap-2">
      {temTamanhos && (
        <div className="grid grid-cols-2 gap-1.5 min-[420px]:grid-cols-3">
          {tamanhos.map((t) => (
            <button
              key={t.tamanho}
              type="button"
              onClick={() => setTamanhoSelecionado(t.tamanho)}
              className={`flex flex-col items-center rounded-xl border px-2 py-1 text-[11px] font-bold transition ${
                tamanhoSelecionado === t.tamanho
                  ? "border-[#c90010] bg-[#fff0f0] text-[#c90010]"
                  : "border-[#eadfd3] bg-white text-[#5f5250] hover:border-[#c90010]"
              }`}
            >
              <span>
                {t.tamanho} - R$ {t.preco.toFixed(2)}
              </span>
              <span
                className={`text-xs ${
                  tamanhoSelecionado === t.tamanho
                    ? "text-[#c90010]"
                    : "text-[#8b807c]"
                }`}
              >
                {t.tamanho === "P"
                  ? "4 fatias"
                  : t.tamanho === "M"
                    ? "6 fatias"
                    : "8 fatias"}
              </span>
            </button>
          ))}
        </div>
      )}

      <Button
        onClick={handleAdd}
        className={`relative h-11 w-full rounded-xl text-sm font-black shadow-md transition hover:shadow-lg ${
          adicionado
            ? "bg-green-600 hover:bg-green-700"
            : "bg-[#d71920] hover:bg-[#b50008]"
        } ${ripple ? "anim-ripple anim-soft-bounce" : ""}`}
        disabled={disabled}
      >
        {adicionado ? (
          <Check className="h-5 w-5 anim-check-pop" />
        ) : (
          <Plus
            className={`h-5 w-5 transition-transform duration-200 ${ripple ? "rotate-90" : "rotate-0"}`}
          />
        )}
        {disabled
          ? "Pedidos pausados"
          : adicionado
            ? "Adicionado!"
            : `Adicionar ${temTamanhos ? tamanhoSelecionado : ""}`}
      </Button>
    </div>
  );
}
