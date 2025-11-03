"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useCart } from "./CartProvider"
import { ShoppingCart } from "lucide-react"

export function AddToCartButton({
  pratoId,
  nome,
  preco,
  tamanhos
}: {
  pratoId: number
  nome: string
  preco: number
  tamanhos?: Array<{ tamanho: string; preco: number }>
}) {
  const { add, settings } = useCart()
  const disabled = !settings.aceitarPedidos
  
  const temTamanhos = tamanhos && tamanhos.length > 0
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState<string>(temTamanhos ? tamanhos[0].tamanho : '')

  const precoFinal = temTamanhos 
    ? tamanhos.find(t => t.tamanho === tamanhoSelecionado)?.preco ?? preco
    : preco

  const handleAdd = () => {
    add({ 
      pratoId, 
      nome, 
      preco: precoFinal,
      tamanho: temTamanhos ? tamanhoSelecionado : undefined
    }, 1)
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      {temTamanhos && (
        <div className="flex gap-2 justify-center">
          {tamanhos.map((t) => (
            <button
              key={t.tamanho}
              type="button"
              onClick={() => setTamanhoSelecionado(t.tamanho)}
              className={`px-3 py-1 text-sm font-medium rounded border transition-colors ${
                tamanhoSelecionado === t.tamanho
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-orange-500'
              }`}
            >
              {t.tamanho} - R$ {t.preco.toFixed(2)}
            </button>
          ))}
        </div>
      )}
      <Button
        onClick={handleAdd}
        className="bg-orange-500 hover:bg-orange-600 w-full"
        disabled={disabled}
      >
        <ShoppingCart />
        {disabled ? 'Pedidos pausados' : `Adicionar ${temTamanhos ? `(${tamanhoSelecionado})` : ''}`}
      </Button>
    </div>
  )
}
