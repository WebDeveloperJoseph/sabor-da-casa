"use client"

import { createContext, useContext, useMemo, useState } from 'react'

export type CartItem = {
  pratoId: number
  nome: string
  preco: number
  quantidade: number
  observacoes?: string
  tamanho?: string // P, M, G (opcional)
}

export type Settings = {
  aceitarPedidos: boolean
  pedidoMinimo: number
  taxaEntrega: number
}

type CartContextType = {
  items: CartItem[]
  add: (item: Omit<CartItem, 'quantidade'>, qtd?: number) => void
  remove: (pratoId: number, tamanho?: string, observacoes?: string) => void
  updateQty: (pratoId: number, qtd: number, tamanho?: string, observacoes?: string) => void
  updateObs: (pratoId: number, obs: string, tamanho?: string, observacoesOriginais?: string) => void
  clear: () => void
  subtotal: number
  total: number
  settings: Settings
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children, settings }: { children: React.ReactNode, settings: Settings }) {
  const [items, setItems] = useState<CartItem[]>([])

  const add: CartContextType['add'] = (item, qtd = 1) => {
    setItems((prev) => {
      // Identifica item pelo pratoId e tamanho (NÃO por observações)
      const chave = (p: CartItem) => `${p.pratoId}-${p.tamanho || ''}`
      const novaChave = `${item.pratoId}-${item.tamanho || ''}`
      const i = prev.find((p) => chave(p) === novaChave)
      if (i) {
        return prev.map((p) => chave(p) === novaChave ? { ...p, quantidade: p.quantidade + qtd } : p)
      }
      return [...prev, { ...item, quantidade: qtd }]
    })
  }

  const remove = (pratoId: number, tamanho?: string) => {
    setItems((prev) => prev.filter((i) => {
      const chave = `${i.pratoId}-${i.tamanho || ''}`
      const chaveRemover = `${pratoId}-${tamanho || ''}`
      return chave !== chaveRemover
    }))
  }

  const updateQty = (pratoId: number, qtd: number, tamanho?: string) => {
    setItems((prev) => prev.map((i) => {
      const chave = `${i.pratoId}-${i.tamanho || ''}`
      const chaveAtualizar = `${pratoId}-${tamanho || ''}`
      return chave === chaveAtualizar ? { ...i, quantidade: Math.max(1, qtd) } : i
    }))
  }

  const updateObs = (pratoId: number, obs: string, tamanho?: string) => {
    setItems((prev) => prev.map((i) => {
      const chave = `${i.pratoId}-${i.tamanho || ''}`
      const chaveAtualizar = `${pratoId}-${tamanho || ''}`
      return chave === chaveAtualizar ? { ...i, observacoes: obs } : i
    }))
  }

  const clear = () => setItems([])

  const subtotal = useMemo(() => 
    items.reduce((acc, i) => acc + i.preco * i.quantidade, 0), 
    [items]
  )
  const total = useMemo(() => subtotal + Number(settings.taxaEntrega || 0), [subtotal, settings.taxaEntrega])

  const value = { items, add, remove, updateQty, updateObs, clear, subtotal, total, settings }
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
