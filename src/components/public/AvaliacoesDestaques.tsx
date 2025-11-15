"use client"

import { Star, Quote } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface Avaliacao {
  id: number
  estrelas: number
  comentario: string | null
  createdAt: string | Date
  pedido: {
    nomeCliente: string
  }
}

interface AvaliacoesDestaquesProps {
  avaliacoes: Avaliacao[]
}

export function AvaliacoesDestaques({ avaliacoes }: AvaliacoesDestaquesProps) {
  if (!avaliacoes || avaliacoes.length === 0) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            O que nossos clientes dizem
          </h2>
          <p className="text-gray-600">
            Depoimentos reais de quem já experimentou nossos sabores
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {avaliacoes.map((avaliacao) => (
            <Card key={avaliacao.id} className="bg-white border-2 hover:border-orange-300 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= avaliacao.estrelas
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-orange-300" />
                </div>

                {avaliacao.comentario && (
                  <blockquote className="text-gray-700 mb-4 italic">
                    &ldquo;{avaliacao.comentario}&rdquo;
                  </blockquote>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {avaliacao.pedido.nomeCliente}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(avaliacao.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-orange-500">
                      {avaliacao.estrelas}
                    </span>
                    <span className="text-sm text-gray-500">/5</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {avaliacoes.length >= 3 && (
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Já são <span className="font-bold text-orange-600">{avaliacoes.length}+</span> clientes satisfeitos! 
              <br />
              Faça seu pedido e deixe também sua avaliação.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}