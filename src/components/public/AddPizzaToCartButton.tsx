"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useCart } from "./CartProvider"
import { ShoppingCart } from "lucide-react"


export function AddPizzaToCartButton({
  pratoId,
  nome,
  preco,
  tamanhos,
  categoriaNome
}: {
  pratoId: number
  nome: string
  preco: number
  tamanhos?: Array<{ tamanho: string; preco: number }>
  categoriaNome?: string
}) {
  const { add, settings } = useCart()
  const disabled = !settings.aceitarPedidos
  
  const temTamanhos = tamanhos && tamanhos.length > 0
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState<string>(temTamanhos ? tamanhos[0].tamanho : '')


  const precoBase = temTamanhos 
    ? tamanhos.find(t => t.tamanho === tamanhoSelecionado)?.preco ?? preco
    : preco

  const precoFinal = Number(precoBase)

  const handleAdd = () => {
    add({ 
      pratoId, 
      nome, 
      preco: precoFinal,
      tamanho: temTamanhos ? tamanhoSelecionado : undefined,
    }, 1)
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Seleção de Tamanho */}
      {temTamanhos && (
        <div className="flex gap-2 justify-center">
          {tamanhos.map((t) => (
            <button
              key={t.tamanho}
              type="button"
              onClick={() => setTamanhoSelecionado(t.tamanho)}
              className={`px-3 py-1 text-sm font-medium rounded border transition-all duration-300 transform cursor-pointer flex flex-col items-center ${
                tamanhoSelecionado === t.tamanho
                  ? 'bg-orange-500 text-white border-orange-500 scale-105 shadow-md'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-orange-500 hover:scale-105 hover:shadow-md hover:bg-orange-50'
              }`}
            >
              <span>{t.tamanho} - R$ {t.preco.toFixed(2).replace('.', ',')}</span>
              <span className={`text-xs ${
                tamanhoSelecionado === t.tamanho ? 'text-orange-100' : 'text-blue-600'
              }`}>
                {t.tamanho === 'P' ? '4 fatias' : t.tamanho === 'M' ? '6 fatias' : '8 fatias'}
              </span>
            </button>
          ))}
        </div>
      )}


      {/* Botão Adicionar ao Carrinho */}
      <Button 
        onClick={handleAdd}
        disabled={disabled}
        className="w-full bg-orange-600 hover:bg-orange-700 cursor-pointer"
      >
        <ShoppingCart className="w-4 h-4 mr-2" />
        {`R$ ${precoFinal.toFixed(2).replace('.', ',')}`}
      </Button>
    </div>
  )
}