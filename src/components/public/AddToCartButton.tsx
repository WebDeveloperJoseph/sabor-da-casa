"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useCart } from "./CartProvider"
import { ShoppingCart } from "lucide-react"

type Borda = {
  id: number
  nome: string
  precoAdicional: number
  ativo: boolean
}

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
  const [bordas, setBordas] = useState<Borda[]>([])
  const [bordaSelecionada, setBordaSelecionada] = useState<number | null>(null)

  useEffect(() => {
    // Carregar bordas disponíveis
    fetch('/api/bordas')
      .then(res => res.json())
      .then(data => {
        const bordasAtivas = data.filter((b: Borda) => b.ativo)
        setBordas(bordasAtivas)
      })
      .catch(err => console.error('Erro ao carregar bordas:', err))
  }, [])

  const precoFinal = temTamanhos 
    ? tamanhos.find(t => t.tamanho === tamanhoSelecionado)?.preco ?? preco
    : preco

  const handleAdd = () => {
    const bordaObj = bordaSelecionada ? bordas.find(b => b.id === bordaSelecionada) : null
    
    add({ 
      pratoId, 
      nome, 
      preco: precoFinal,
      tamanho: temTamanhos ? tamanhoSelecionado : undefined,
      bordaId: bordaObj?.id,
      nomeBorda: bordaObj?.nome,
      precoBorda: bordaObj?.precoAdicional
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
      
      {bordas.length > 0 && (
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-700">Borda recheada (opcional):</label>
          <select
            value={bordaSelecionada ?? ''}
            onChange={(e) => setBordaSelecionada(e.target.value ? Number(e.target.value) : null)}
            className="text-sm border border-gray-300 rounded px-2 py-1.5 bg-white hover:border-orange-500 focus:border-orange-500 focus:outline-none"
          >
            <option value="">Sem borda recheada</option>
            {bordas.map((borda) => (
              <option key={borda.id} value={borda.id}>
                {borda.nome} (+R$ {borda.precoAdicional.toFixed(2)})
              </option>
            ))}
          </select>
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

