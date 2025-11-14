"use client"

import { useState, useMemo, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { X, Pizza, Check } from 'lucide-react'
import { useCart } from './CartProvider'
import { toast } from 'sonner'

type Prato = {
  id: number
  nome: string
  preco: number
  descricao?: string | null
  imagem?: string | null
}

type PratoTamanho = {
  id: number
  pratoId: number
  tamanho: string
  preco: number
}

type Borda = {
  id: number
  nome: string
  preco: number
  descricao?: string
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  pizzas: (Prato & { tamanhos: PratoTamanho[] })[]
}

const TAMANHOS_DISPONIVEIS = ['P', 'M', 'G'] as const
const MAX_SABORES_P = 2
const MAX_SABORES_G = 4

export function MonteSuaPizzaDialog({ open, onOpenChange, pizzas }: Props) {
  const { add } = useCart()
  const [saboresSelecionados, setSaboresSelecionados] = useState<number[]>([])
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState<string>('M')
  const [bordas, setBordas] = useState<Borda[]>([])
  const [bordaSelecionada, setBordaSelecionada] = useState<Borda | null>(null)

  // Buscar bordas disponíveis
  useEffect(() => {
    if (open) {
      console.log('🍕 Carregando bordas...')
      fetch('/api/bordas')
        .then(res => {
          console.log('🍕 Resposta bordas:', res.status)
          return res.json()
        })
        .then(data => {
          console.log('🍕 Bordas carregadas:', data)
          setBordas(data.bordas || [])
        })
        .catch(err => {
          console.error('❌ Erro ao carregar bordas:', err)
          setBordas([])
        })
    }
  }, [open])

  // Calcula o preço pelo sabor mais caro no tamanho selecionado + borda
  const precoCalculado = useMemo(() => {
    if (saboresSelecionados.length === 0) return 0

    const precosPorSabor = saboresSelecionados.map((pizzaId) => {
      const pizza = pizzas.find((p) => p.id === pizzaId)
      if (!pizza) return 0
      
      const tamanho = pizza.tamanhos.find((t) => t.tamanho === tamanhoSelecionado)
      return tamanho ? Number(tamanho.preco) : 0
    })

    const precoBase = Math.max(...precosPorSabor)
    const precoBorda = bordaSelecionada ? bordaSelecionada.preco : 0
    
    return precoBase + precoBorda
  }, [saboresSelecionados, tamanhoSelecionado, pizzas, bordaSelecionada])

  const getMaxSabores = () => {
    if (tamanhoSelecionado === 'P' || tamanhoSelecionado === 'M') {
      return MAX_SABORES_P
    }
    return MAX_SABORES_G
  }

  const toggleSabor = (pizzaId: number) => {
    setSaboresSelecionados((prev) => {
      if (prev.includes(pizzaId)) {
        return prev.filter((id) => id !== pizzaId)
      }
      const maxSabores = getMaxSabores()
      if (prev.length >= maxSabores) {
        const tamanhoTexto = tamanhoSelecionado === 'G' ? 'Grande (3-4 sabores)' : 'P/M (até 2 sabores)'
        toast.error(`Tamanho ${tamanhoTexto}`)
        return prev
      }
      return [...prev, pizzaId]
    })
  }

  const handleAddToCart = () => {
    const minSabores = tamanhoSelecionado === 'G' ? 3 : 2
    
    if (saboresSelecionados.length < minSabores) {
      const texto = tamanhoSelecionado === 'G' ? 'pelo menos 3 sabores' : 'pelo menos 2 sabores'
      toast.error(`Escolha ${texto}`)
      return
    }

    const nomesSabores = saboresSelecionados
      .map((id) => pizzas.find((p) => p.id === id)?.nome)
      .filter(Boolean)
      .join(' + ')

    // Adiciona ao carrinho como pizza mista
    // Usaremos pratoId = 999 (Pizza Personalizada) criado no seed
    const nomeCompleto = bordaSelecionada 
      ? `Pizza Mista (${saboresSelecionados.length} sabores) + ${bordaSelecionada.nome}`
      : `Pizza Mista (${saboresSelecionados.length} sabores)`
    
    const observacoesFinal = bordaSelecionada
      ? `Sabores: ${nomesSabores} | Borda: ${bordaSelecionada.nome}`
      : `Sabores: ${nomesSabores}`
    
    const itemPizza = {
      pratoId: 999, // ID especial para pizzas mistas
      nome: nomeCompleto,
      preco: precoCalculado,
      tamanho: tamanhoSelecionado,
      observacoes: observacoesFinal
    }
    
    console.log('🍕 Adicionando pizza ao carrinho:', itemPizza)
    
    try {
      add(itemPizza)
      toast.success('Pizza adicionada ao carrinho!')
      console.log('✅ Pizza adicionada com sucesso')
    } catch (error) {
      console.error('❌ Erro ao adicionar pizza ao carrinho:', error)
      toast.error('Erro ao adicionar pizza ao carrinho')
      return
    }
    
    // Reset
    setSaboresSelecionados([])
    setTamanhoSelecionado('M')
    setBordaSelecionada(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <Pizza className="w-8 h-8 text-orange-600" />
            Monte sua Pizza
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-2">
            Tamanhos P e M: até 2 sabores | Tamanho G: 3 ou 4 sabores. O preço será do sabor mais caro.
          </p>
        </DialogHeader>

        {/* Seleção de Tamanho */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Escolha o Tamanho
          </label>
          <div className="flex gap-3">
            {TAMANHOS_DISPONIVEIS.map((tamanho) => (
              <button
                key={tamanho}
                onClick={() => {
                  setTamanhoSelecionado(tamanho)
                  // Resetar sabores se exceder o novo limite
                  const novoMax = tamanho === 'P' || tamanho === 'M' ? 2 : 4
                  setSaboresSelecionados(prev => prev.slice(0, novoMax))
                }}
                className={`flex-1 py-3 px-4 rounded-lg border-2 font-semibold transition-all cursor-pointer ${
                  tamanhoSelecionado === tamanho
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-orange-300'
                }`}
              >
                <div className="text-center">
                  <div>{tamanho}</div>
                  <div className="text-xs opacity-75">
                    {tamanho === 'G' ? '3-4 sabores' : 'até 2 sabores'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Seleção de Borda Recheada */}
        {bordas.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              🍕 Borda Recheada (Opcional)
            </label>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => setBordaSelecionada(null)}
                className={`p-3 rounded-lg border-2 text-left transition-all cursor-pointer ${
                  !bordaSelecionada
                    ? 'border-gray-400 bg-gray-50 text-gray-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-orange-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">Sem borda recheada</span>
                  <span className="text-sm text-gray-500">R$ 0,00</span>
                </div>
              </button>
              {bordas.map((borda) => (
                <button
                  key={borda.id}
                  onClick={() => setBordaSelecionada(borda)}
                  className={`p-3 rounded-lg border-2 text-left transition-all cursor-pointer ${
                    bordaSelecionada?.id === borda.id
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-orange-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{borda.nome}</span>
                    <span className="font-medium text-orange-600">+R$ {borda.preco.toFixed(2).replace('.', ',')}</span>
                  </div>
                  {borda.descricao && (
                    <p className="text-xs text-gray-500 mt-1">{borda.descricao}</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Contador de Sabores */}
        <div className="mb-4 p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-700">
              Sabores selecionados: {saboresSelecionados.length}/{getMaxSabores()}
            </span>
            <span className="text-lg font-bold text-orange-600">
              R$ {precoCalculado.toFixed(2).replace('.', ',')}
            </span>
          </div>
          {saboresSelecionados.length > 0 && (
            <div className="mt-2 text-xs text-gray-600">
              {saboresSelecionados
                .map((id) => pizzas.find((p) => p.id === id)?.nome)
                .join(', ')}
            </div>
          )}
        </div>

        {/* Grid de Pizzas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pizzas.map((pizza) => {
            const selecionado = saboresSelecionados.includes(pizza.id)
            const tamanho = pizza.tamanhos.find((t) => t.tamanho === tamanhoSelecionado)
            
            return (
              <button
                key={pizza.id}
                onClick={() => toggleSabor(pizza.id)}
                className={`relative p-4 rounded-xl border-2 transition-all text-left cursor-pointer ${
                  selecionado
                    ? 'border-orange-500 bg-orange-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-orange-300'
                }`}
              >
                {selecionado && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-lg">
                    <Check className="w-4 h-4" />
                  </div>
                )}
                
                <div className="font-bold text-gray-900 mb-1">{pizza.nome}</div>
                
                {pizza.descricao && (
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {pizza.descricao}
                  </p>
                )}
                
                {tamanho && (
                  <div className="text-sm font-semibold text-orange-600">
                    R$ {Number(tamanho.preco).toFixed(2).replace('.', ',')}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-3 mt-6">
          <Button
            onClick={handleAddToCart}
            disabled={saboresSelecionados.length < (tamanhoSelecionado === 'G' ? 3 : 2)}
            className="flex-1 bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-6 text-lg"
          >
            Adicionar ao Carrinho
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="px-6"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
