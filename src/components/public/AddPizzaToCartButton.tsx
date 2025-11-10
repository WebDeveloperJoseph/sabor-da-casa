"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useCart } from "./CartProvider"
import { ShoppingCart } from "lucide-react"

type Borda = {
  id: number
  nome: string
  preco: number
}

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
  
  const [bordas, setBordas] = useState<Borda[]>([])
  const [bordaSelecionada, setBordaSelecionada] = useState<Borda | null>(null)
  
  const temTamanhos = tamanhos && tamanhos.length > 0
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState<string>(temTamanhos ? tamanhos[0].tamanho : '')

  // Verificar se é uma pizza (categoria contém "Pizza" ou "Tradicional")
  const isPizza = categoriaNome?.toLowerCase().includes('pizza') || 
                  categoriaNome?.toLowerCase().includes('tradicional')

  // Buscar bordas disponíveis
  useEffect(() => {
    if (isPizza) {
      fetch('/api/bordas')
        .then(res => res.json())
        .then(data => setBordas(data.bordas || []))
        .catch(err => console.warn('Erro ao carregar bordas:', err))
    }
  }, [isPizza])

  const precoBase = temTamanhos 
    ? tamanhos.find(t => t.tamanho === tamanhoSelecionado)?.preco ?? preco
    : preco

  const precoBorda = bordaSelecionada?.preco ?? 0
  const precoFinal = Number(precoBase) + precoBorda

  const handleAdd = () => {
    const nomeCompleto = bordaSelecionada 
      ? `${nome} + ${bordaSelecionada.nome}`
      : nome

    add({ 
      pratoId, 
      nome: nomeCompleto, 
      preco: precoFinal,
      tamanho: temTamanhos ? tamanhoSelecionado : undefined,
      observacoes: bordaSelecionada ? `Borda: ${bordaSelecionada.nome}` : undefined
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
              className={`px-3 py-1 text-sm font-medium rounded border transition-all duration-300 transform cursor-pointer ${
                tamanhoSelecionado === t.tamanho
                  ? 'bg-orange-500 text-white border-orange-500 scale-105 shadow-md'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-orange-500 hover:scale-105 hover:shadow-md hover:bg-orange-50'
              }`}
            >
              {t.tamanho} - R$ {t.preco.toFixed(2).replace('.', ',')}
            </button>
          ))}
        </div>
      )}

      {/* Seleção de Borda (apenas para pizzas) */}
      {isPizza && bordas.length > 0 && (
        <div className="border-t pt-3">
          <p className="text-xs font-medium text-gray-600 mb-2">🍕 Bordas Recheadas (opcional):</p>
          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => setBordaSelecionada(null)}
              className={`px-3 py-2 text-xs rounded border transition-all cursor-pointer ${
                !bordaSelecionada
                  ? 'bg-gray-100 text-gray-800 border-gray-400'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-orange-300'
              }`}
            >
              Sem borda recheada
            </button>
            {bordas.map((borda) => (
              <button
                key={borda.id}
                type="button"
                onClick={() => setBordaSelecionada(borda)}
                className={`px-3 py-2 text-xs rounded border transition-all cursor-pointer text-left ${
                  bordaSelecionada?.id === borda.id
                    ? 'bg-orange-50 text-orange-800 border-orange-400'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-orange-300 hover:bg-orange-25'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>{borda.nome}</span>
                  <span className="font-medium">+R$ {borda.preco.toFixed(2).replace('.', ',')}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Botão Adicionar ao Carrinho */}
      <Button 
        onClick={handleAdd}
        disabled={disabled}
        className="w-full bg-orange-600 hover:bg-orange-700 cursor-pointer"
      >
        <ShoppingCart className="w-4 h-4 mr-2" />
        {precoBorda > 0 
          ? `R$ ${precoFinal.toFixed(2).replace('.', ',')} (Base: R$ ${Number(precoBase).toFixed(2).replace('.', ',')} + Borda: R$ ${precoBorda.toFixed(2).replace('.', ',')})`
          : `R$ ${precoFinal.toFixed(2).replace('.', ',')}`
        }
      </Button>
    </div>
  )
}