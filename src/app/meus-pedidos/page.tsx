"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AvaliarPedidoDialog } from "@/components/public/AvaliarPedidoDialog"
import { Clock, CheckCircle, Truck, Package, Star } from "lucide-react"
import Link from "next/link"

interface Pedido {
  id: number
  dailyNumber: number | null
  nomeCliente: string
  telefone: string | null
  status: string
  valorTotal: number
  createdAt: string
  avaliacao: {
    estrelas: number
    comentario: string | null
    createdAt: string
  } | null
  itens: Array<{
    id: number
    nomePrato: string
    quantidade: number
    precoUnit: number
    subtotal: number
  }>
}

export default function MeusPedidosPage() {
  const [telefone, setTelefone] = useState("")
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState("")

  const buscarPedidos = async () => {
    if (!telefone.trim()) {
      setErro("Digite seu telefone")
      return
    }

    setLoading(true)
    setErro("")
    
    try {
      const res = await fetch(`/api/pedidos?telefone=${encodeURIComponent(telefone)}`)
      
      if (!res.ok) {
        throw new Error("Erro ao buscar pedidos")
      }

      const data = await res.json()
      setPedidos(data)
      
      if (data.length === 0) {
        setErro("Nenhum pedido encontrado com este telefone")
      }
    } catch (error) {
      console.error(error)
      setErro("Erro ao buscar pedidos. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Clock className="w-5 h-5" />
      case 'em_preparo':
        return <Package className="w-5 h-5" />
      case 'saiu_entrega':
        return <Truck className="w-5 h-5" />
      case 'entregue':
        return <CheckCircle className="w-5 h-5" />
      default:
        return <Clock className="w-5 h-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'em_preparo':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'saiu_entrega':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'entregue':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelado':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'Pendente'
      case 'em_preparo':
        return 'Em Preparo'
      case 'saiu_entrega':
        return 'Saiu para Entrega'
      case 'entregue':
        return 'Entregue'
      case 'cancelado':
        return 'Cancelado'
      default:
        return status
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Meus Pedidos</h1>
              <p className="text-orange-100 text-sm">Acompanhe seus pedidos e avalie</p>
            </div>
            <Link href="/" className="text-white hover:text-orange-100 text-sm underline">
              ← Voltar ao cardápio
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Busca por telefone */}
        <div className="max-w-md mx-auto mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Digite seu telefone para ver seus pedidos
            </label>
            <div className="flex gap-2">
              <Input
                type="tel"
                placeholder="(DDD) 9 9999-9999"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && buscarPedidos()}
                className="flex-1"
              />
              <Button
                onClick={buscarPedidos}
                disabled={loading}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {loading ? "Buscando..." : "Buscar"}
              </Button>
            </div>
            {erro && (
              <p className="mt-2 text-sm text-red-600">{erro}</p>
            )}
          </div>
        </div>

        {/* Lista de pedidos */}
        {pedidos.length > 0 && (
          <div className="max-w-4xl mx-auto space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {pedidos.length} pedido{pedidos.length > 1 ? 's' : ''} encontrado{pedidos.length > 1 ? 's' : ''}
            </h2>

            {pedidos.map((pedido) => (
              <div key={pedido.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-4 md:p-6">
                  {/* Cabeçalho do pedido */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Pedido #{pedido.dailyNumber || pedido.id}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(pedido.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 font-medium text-sm ${getStatusColor(pedido.status)}`}>
                        {getStatusIcon(pedido.status)}
                        {getStatusText(pedido.status)}
                      </span>
                    </div>
                  </div>

                  {/* Itens */}
                  <div className="bg-orange-50 rounded-lg p-4 mb-4">
                    <p className="text-sm font-semibold text-gray-800 mb-2">Itens:</p>
                    <div className="space-y-2">
                      {pedido.itens.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-700">
                            {item.quantidade}x {item.nomePrato}
                          </span>
                          <span className="font-medium text-gray-900">
                            R$ {Number(item.subtotal).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-orange-200 mt-3 pt-3">
                      <div className="flex justify-between font-bold text-orange-600">
                        <span>Total:</span>
                        <span>R$ {Number(pedido.valorTotal).toFixed(2).replace('.', ',')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Avaliação */}
                  {pedido.avaliacao ? (
                    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-5 h-5 ${
                                star <= pedido.avaliacao!.estrelas
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-bold text-gray-700">
                          Sua avaliação: {pedido.avaliacao.estrelas}/5
                        </span>
                      </div>
                      {pedido.avaliacao.comentario && (
                        <p className="text-sm text-gray-700 mt-2">
                          &ldquo;{pedido.avaliacao.comentario}&rdquo;
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Avaliado em {new Date(pedido.avaliacao.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  ) : pedido.status === 'entregue' ? (
                    <div className="flex justify-center">
                      <AvaliarPedidoDialog
                        pedidoId={pedido.id}
                        pedidoNumero={pedido.dailyNumber ?? undefined}
                      />
                    </div>
                  ) : (
                    <p className="text-center text-sm text-gray-500 italic">
                      Você poderá avaliar este pedido quando for entregue
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
