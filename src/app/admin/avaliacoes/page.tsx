import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Star, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function AvaliacoesPage() {
  const avaliacoes = await prisma.avaliacao.findMany({
    include: {
      pedido: {
        select: {
          id: true,
          dailyNumber: true,
          nomeCliente: true,
          valorTotal: true,
          createdAt: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 100
  })

  const stats = {
    total: avaliacoes.length,
    media: avaliacoes.length > 0 ? (avaliacoes.reduce((acc, av) => acc + av.estrelas, 0) / avaliacoes.length) : 0,
    cincoestrelas: avaliacoes.filter(av => av.estrelas === 5).length,
    quatroestrelas: avaliacoes.filter(av => av.estrelas === 4).length,
    tresestrelas: avaliacoes.filter(av => av.estrelas === 3).length,
    duasestrelas: avaliacoes.filter(av => av.estrelas === 2).length,
    umaestrela: avaliacoes.filter(av => av.estrelas === 1).length,
    comcomentario: avaliacoes.filter(av => av.comentario).length
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Avaliações dos Clientes</h1>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            <span className="font-medium">Total de Avaliações</span>
          </div>
          <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-600" />
            <span className="font-medium">Média Geral</span>
          </div>
          <p className="text-2xl font-bold text-yellow-700">
            {stats.media.toFixed(1)} ⭐
          </p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-green-600" />
            <span className="font-medium">5 Estrelas</span>
          </div>
          <p className="text-2xl font-bold text-green-700">{stats.cincoestrelas}</p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-purple-600" />
            <span className="font-medium">Com Comentários</span>
          </div>
          <p className="text-2xl font-bold text-purple-700">{stats.comcomentario}</p>
        </div>
      </div>

      {/* Distribuição de Estrelas */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="font-semibold mb-4">Distribuição de Avaliações</h3>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((estrela) => {
            const count = [stats.cincoestrelas, stats.quatroestrelas, stats.tresestrelas, stats.duasestrelas, stats.umaestrela][5-estrela]
            const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0
            return (
              <div key={estrela} className="flex items-center gap-3">
                <span className="text-sm w-12">{estrela} ⭐</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-16">{count} ({percentage.toFixed(1)}%)</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Lista de Avaliações */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="font-semibold">Todas as Avaliações</h3>
        </div>

        {avaliacoes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Nenhuma avaliação ainda</p>
            <p className="text-sm">As avaliações aparecerão aqui quando os clientes avaliarem seus pedidos</p>
          </div>
        ) : (
          <div className="divide-y">
            {avaliacoes.map((avaliacao) => (
              <div key={avaliacao.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{avaliacao.pedido.nomeCliente}</h4>
                      <span className="text-sm text-gray-500">
                        Pedido #{avaliacao.pedido.dailyNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= avaliacao.estrelas
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">{avaliacao.estrelas}/5</span>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>{new Date(avaliacao.createdAt).toLocaleDateString('pt-BR')}</p>
                    <p>{new Date(avaliacao.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>

                {avaliacao.comentario && (
                  <blockquote className="bg-gray-50 p-3 rounded border-l-4 border-blue-400">
                    <p className="text-gray-700 italic">&ldquo;{avaliacao.comentario}&rdquo;</p>
                  </blockquote>
                )}

                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                  <span className="text-sm text-gray-500">
                    Valor do pedido: R$ {Number(avaliacao.pedido.valorTotal).toFixed(2).replace('.', ',')}
                  </span>
                  <Link href={`/admin/pedidos`}>
                    <Button variant="outline" size="sm">
                      Ver Pedido
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}