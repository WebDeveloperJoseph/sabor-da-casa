"use client";

import { createContext, useContext, useMemo, useState } from "react";

export type CartItem = {
  pratoId: number;
  nome: string;
  preco: number;
  quantidade: number;
  observacoes?: string;
  tamanho?: string; // P, M, G (opcional)
  adicionais?: Array<{ nome: string; preco: number }>;
  bordaId?: number;
  bordaNome?: string;
  bordaPreco?: number;
};

export type Settings = {
  aceitarPedidos: boolean;
  pedidoMinimo: number;
  taxaEntrega: number;
};

type CartContextType = {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantidade">, qtd?: number) => void;
  remove: (pratoId: number, tamanho?: string, observacoes?: string) => void;
  updateQty: (
    pratoId: number,
    qtd: number,
    tamanho?: string,
    observacoes?: string,
  ) => void;
  updateObs: (
    pratoId: number,
    obs: string,
    tamanho?: string,
    observacoesOriginais?: string,
  ) => void;
  clear: () => void;
  subtotal: number;
  total: number;
  settings: Settings;
  lastAddTick: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const getItemKey = (
  item: Pick<CartItem, "pratoId" | "tamanho" | "observacoes">,
) => `${item.pratoId}-${item.tamanho || ""}-${(item.observacoes || "").trim()}`;

export function CartProvider({
  children,
  settings,
}: {
  children: React.ReactNode;
  settings: Settings;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [lastAddTick, setLastAddTick] = useState(0);

  const add: CartContextType["add"] = (item, qtd = 1) => {
    setLastAddTick((value) => value + 1);
    setItems((prev) => {
      const novaChave = getItemKey(item);
      const i = prev.find((p) => getItemKey(p) === novaChave);
      if (i) {
        return prev.map((p) =>
          getItemKey(p) === novaChave
            ? { ...p, quantidade: p.quantidade + qtd }
            : p,
        );
      }
      return [...prev, { ...item, quantidade: qtd }];
    });
  };

  const remove = (pratoId: number, tamanho?: string, observacoes?: string) => {
    setItems((prev) =>
      prev.filter(
        (i) => getItemKey(i) !== getItemKey({ pratoId, tamanho, observacoes }),
      ),
    );
  };

  const updateQty = (
    pratoId: number,
    qtd: number,
    tamanho?: string,
    observacoes?: string,
  ) => {
    setItems((prev) =>
      prev.map((i) => {
        return getItemKey(i) === getItemKey({ pratoId, tamanho, observacoes })
          ? { ...i, quantidade: Math.max(1, qtd) }
          : i;
      }),
    );
  };

  const updateObs = (
    pratoId: number,
    obs: string,
    tamanho?: string,
    observacoesOriginais?: string,
  ) => {
    setItems((prev) =>
      prev.map((i) => {
        return getItemKey(i) ===
          getItemKey({
            pratoId,
            tamanho,
            observacoes: observacoesOriginais,
          })
          ? { ...i, observacoes: obs }
          : i;
      }),
    );
  };

  const clear = () => setItems([]);

  const subtotal = useMemo(
    () => items.reduce((acc, i) => acc + i.preco * i.quantidade, 0),
    [items],
  );
  const total = useMemo(
    () => subtotal + Number(settings.taxaEntrega || 0),
    [subtotal, settings.taxaEntrega],
  );

  const value = {
    items,
    add,
    remove,
    updateQty,
    updateObs,
    clear,
    subtotal,
    total,
    settings,
    lastAddTick,
  };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
