"use client"

import { memo } from 'react'
import Image from 'next/image'
import { Star } from 'lucide-react'
import { AddPizzaToCartButton } from './AddPizzaToCartButton'
import { AddToCartButton } from './AddToCartButton'

type IngredienteTag = { ingrediente: { id: number; nome: string; alergenico: boolean } }
type TamanhoType = { tamanho: string; preco: number }

type PratoCardProps = {
  prato: {
    id: number
    nome: string
    descricao: string | null
    preco: number | string
    imagem: string | null
    ativo: boolean
    destaque: boolean
    ingredientes: IngredienteTag[]
    tamanhos?: TamanhoType[]
    rating?: { avg: number; count: number }
  }
  categoria: {
    id: number
    nome: string
    descricao: string | null
  }
}

const PratoCardComponent = ({ prato, categoria }: PratoCardProps) => {
  return (
    <div
      className={`group relative bg-white rounded-2xl p-6 border-2 transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 flex flex-col h-full ${
        prato.destaque ? 'border-orange-400 ring-4 ring-orange-200 shadow-lg' : 'border-gray-200 hover:border-orange-300'
      }`}
    >
      {/* Área do selo Destaque (altura fixa e centralizada para padronizar todos os cards) */}
      <div className="flex justify-center items-center h-10 mb-4">
        {prato.destaque ? (
          <div className="inline-block bg-linear-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
            🔥 Destaque
          </div>
        ) : null}
      </div>
      
      {/* Imagem da pizza */}
      {prato.imagem && (
        <div className="relative overflow-hidden rounded-xl mb-4 bg-gray-50">
          <Image
            src={prato.imagem}
            alt={prato.nome}
            width={600}
            height={400}
            className="w-full h-48 object-contain transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
        </div>
      )}
      
      <div className="mb-2 flex flex-col items-center text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{prato.nome}</h3>
        {/* Mostrar preço apenas para produtos sem tamanhos (bebidas, sobremesas, etc) */}
        {(!prato.tamanhos || prato.tamanhos.length === 0) && (
          <span className="text-2xl font-extrabold bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
            R$ {Number(prato.preco).toFixed(2).replace('.', ',')}
          </span>
        )}
        <p className="text-gray-600 text-sm leading-relaxed mb-3">{prato.descricao}</p>
      </div>
      
      {/* Conteúdo inferior padronizado */}
      <div className="mt-auto">
        {/* Ingredientes */}
        {prato.ingredientes.length > 0 && (
          <div className="mb-4 flex flex-wrap justify-center gap-2">
            {prato.ingredientes.map((pi: IngredienteTag) => (
              <span
                key={pi.ingrediente.id}
                className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
                  pi.ingrediente.alergenico
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : 'bg-green-100 text-green-800 border border-green-200'
                }`}
              >
                {pi.ingrediente.nome}
                {pi.ingrediente.alergenico && ' ⚠️'}
              </span>
            ))}
          </div>
        )}

        {/* Avaliação média do prato */}
        <div className="flex items-center justify-center gap-2 mb-3">
          {Array.from({ length: 5 }).map((_, i) => {
            const filled = prato.rating?.avg ? i < Math.round(prato.rating.avg - 0.01) : false
            return (
              <Star key={i} className={`w-4 h-4 ${filled ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
            )
          })}
          <span className="text-xs text-gray-600">{prato.rating?.avg ? prato.rating.avg.toFixed(1) : '0.0'} ({prato.rating?.count || 0})</span>
        </div>

        {/* Botão */}
        <div className="flex items-center justify-center">
          {categoria.nome.toLowerCase().includes('pizza') || categoria.nome.toLowerCase().includes('tradicional') ? (
            <AddPizzaToCartButton 
              pratoId={prato.id} 
              nome={prato.nome} 
              preco={Number(prato.preco)}
              tamanhos={prato.tamanhos && prato.tamanhos.length > 0 ? prato.tamanhos : undefined}
              categoriaNome={categoria.nome}
            />
          ) : (
            <AddToCartButton 
              pratoId={prato.id} 
              nome={prato.nome} 
              preco={Number(prato.preco)}
              tamanhos={prato.tamanhos && prato.tamanhos.length > 0 ? prato.tamanhos : undefined}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export const PratoCard = memo(PratoCardComponent)