import { prisma } from "@/lib/prisma"
import Link from "next/link"
import DeletePedidoButton from '@/components/admin/DeletePedidoButton'
import AdminOrderRealtimeNotifier from '@/components/admin/AdminOrderRealtimeNotifier'
import PedidoStatusControls from '@/components/admin/PedidoStatusControls'
import LimparPedidosTesteButton from '@/components/admin/LimparPedidosTesteButton'
import ZerarPedidosButton from '@/components/admin/ZerarPedidosButton'
import { 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  XCircle,
  Truck,
  Package,
  Eye,
  Star
} from "lucide-react"

export default async function PedidosPage() {
  const pedidos = await prisma.pedido.findMany({
    include: {
      itens: {
        include: {
          prato: true
        }
      },
      avaliacao: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 50
  })

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
      case 'cancelado':
        return <XCircle className="w-5 h-5" />
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

  const getStatusLabel = (status: string) => {
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

  const pedidosPorStatus = {
    pendente: pedidos.filter(p => p.status === 'pendente').length,
    em_preparo: pedidos.filter(p => p.status === 'em_preparo').length,
    saiu_entrega: pedidos.filter(p => p.status === 'saiu_entrega').length,
    entregue: pedidos.filter(p => p.status === 'entregue').length,
    cancelado: pedidos.filter(p => p.status === 'cancelado').length,
  }

  return (
    <div className="space-y-6">
  {/* Notificador de novos pedidos (realtime) */}
  <AdminOrderRealtimeNotifier />
      {/* Cabeçalho */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-orange-100 p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl font-bold bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent flex items-center">
              <ShoppingCart className="w-10 h-10 mr-4 text-orange-600" />
              Pedidos
            </h1>
            <p className="text-gray-600 mt-2">
              Gerencie todos os pedidos recebidos
            </p>
          </div>
          <div className="flex items-center gap-2">
            <LimparPedidosTesteButton />
            <ZerarPedidosButton />
          </div>
        </div>
      </div>

      {/* Resumo por Status */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white border-2 border-yellow-300 rounded-2xl p-5 hover:shadow-xl hover:scale-105 transition-all duration-300">
          <Clock className="w-7 h-7 text-yellow-600 mb-3" />
          <p className="text-3xl font-extrabold text-yellow-900">{pedidosPorStatus.pendente}</p>
          <p className="text-sm font-semibold text-yellow-700 uppercase tracking-wide">Pendentes</p>
        </div>
        
        <div className="bg-white border-2 border-blue-300 rounded-2xl p-5 hover:shadow-xl hover:scale-105 transition-all duration-300">
          <Package className="w-7 h-7 text-blue-600 mb-3" />
          <p className="text-3xl font-extrabold text-blue-900">{pedidosPorStatus.em_preparo}</p>
          <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Em Preparo</p>
        </div>
        
        <div className="bg-white border-2 border-purple-300 rounded-2xl p-5 hover:shadow-xl hover:scale-105 transition-all duration-300">
          <Truck className="w-7 h-7 text-purple-600 mb-3" />
          <p className="text-3xl font-extrabold text-purple-900">{pedidosPorStatus.saiu_entrega}</p>
          <p className="text-sm font-semibold text-purple-700 uppercase tracking-wide">Em Entrega</p>
        </div>
        
        <div className="bg-white border-2 border-green-300 rounded-2xl p-5 hover:shadow-xl hover:scale-105 transition-all duration-300">
          <CheckCircle className="w-7 h-7 text-green-600 mb-3" />
          <p className="text-3xl font-extrabold text-green-900">{pedidosPorStatus.entregue}</p>
          <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">Entregues</p>
        </div>
        
        <div className="bg-white border-2 border-red-300 rounded-2xl p-5 hover:shadow-xl hover:scale-105 transition-all duration-300">
          <XCircle className="w-7 h-7 text-red-600 mb-3" />
          <p className="text-3xl font-extrabold text-red-900">{pedidosPorStatus.cancelado}</p>
          <p className="text-sm font-semibold text-red-700 uppercase tracking-wide">Cancelados</p>
        </div>
      </div>

      {/* Lista de Pedidos */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-100 overflow-x-auto">
        <div className="p-6 border-b border-orange-100 bg-linear-to-r from-orange-50 to-red-50">
          <h2 className="text-xl font-bold text-gray-900">
            Todos os Pedidos ({pedidos.length})
          </h2>
        </div>

        <div className="divide-y divide-orange-100">
          {pedidos.length > 0 ? (
            pedidos.map((pedido) => (
              <div key={pedido.id} className="p-4 md:p-6 hover:bg-orange-50/50 transition-all duration-200">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4 space-y-4 lg:space-y-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-3">
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 wrap-break-word">
                        Pedido #{pedido.id}
                        {((pedido as unknown as { dailyNumber?: number }).dailyNumber) && (
                          <span className="ml-2 text-xs md:text-sm font-medium px-2 md:px-3 py-1 bg-orange-100 text-orange-700 rounded-full whitespace-nowrap">hoje: #{(pedido as unknown as { dailyNumber?: number }).dailyNumber}</span>
                        )}
                      </h3>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-bold border-2 shadow-sm ${getStatusColor(pedido.status)}`}>
                            <span className="mr-1 md:mr-2">{getStatusIcon(pedido.status)}</span>
                            <span className="hidden sm:inline">{getStatusLabel(pedido.status)}</span>
                          </span>
                          <PedidoStatusControls id={pedido.id} currentStatus={pedido.status} />
                        </div>
                    </div>
                    
                    <div className="text-xs md:text-sm text-gray-700 space-y-2 bg-gray-50 rounded-lg p-3 md:p-4 border border-gray-200">
                      <p className="wrap-break-word"><strong className="text-gray-900">Cliente:</strong> {pedido.nomeCliente}</p>
                      {pedido.telefone && <p className="wrap-break-word"><strong className="text-gray-900">Telefone:</strong> {pedido.telefone}</p>}
                      {pedido.endereco && <p className="wrap-break-word"><strong className="text-gray-900">Endereço:</strong> {pedido.endereco}</p>}
                      <p className="wrap-break-word"><strong className="text-gray-900">Data:</strong> {new Date(pedido.createdAt).toLocaleString('pt-BR')}</p>
                    </div>
                  </div>

                  <div className="text-left lg:text-right lg:ml-6 shrink-0">
                    <p className="text-2xl md:text-3xl font-extrabold text-orange-600 mb-3">
                      R$ {Number(pedido.valorTotal).toFixed(2).replace('.', ',')}
                    </p>
                    <div className="flex flex-col gap-2">
                      <Link
                        href={`/admin/pedidos/print/${pedido.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-4 py-2 bg-linear-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all text-sm md:text-base"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver / Imprimir
                      </Link>
                      {/* Botão de excluir (componente cliente) */}
                      <DeletePedidoButton id={pedido.id} />
                    </div>
                  </div>
                </div>

                {/* Itens do Pedido */}
                <div className="bg-linear-to-br from-orange-50 to-red-50 rounded-xl p-5 mt-4 border-2 border-orange-200">
                  <p className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">Itens do pedido:</p>
                  <div className="space-y-2">
                    {pedido.itens.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm bg-white rounded-lg p-3 shadow-sm">
                        <span className="text-gray-700 font-medium">
                          <span className="inline-block w-8 h-8 bg-orange-500 text-white rounded-full text-center leading-8 font-bold mr-2">{item.quantidade}</span>
                          {item.nomePrato}
                        </span>
                        <span className="font-bold text-gray-900">
                          R$ {Number(item.subtotal).toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {pedido.observacoes && (
                  <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-300 rounded-xl">
                    <p className="text-sm text-blue-900 font-medium">
                      <strong>Observações:</strong> {pedido.observacoes}
                    </p>
                  </div>
                )}

                {/* Avaliação do Pedido */}
                {pedido.avaliacao && (
                  <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
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
                        {pedido.avaliacao.estrelas}/5 estrelas
                      </span>
                    </div>
                    {pedido.avaliacao.comentario && (
                      <p className="text-sm text-gray-700 mt-2">
                        <strong>Comentário:</strong> {pedido.avaliacao.comentario}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Avaliado em {new Date(pedido.avaliacao.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-16 text-center">
              <ShoppingCart className="w-16 h-16 text-orange-300 mx-auto mb-4" />
              <p className="text-gray-500 text-xl font-medium">Nenhum pedido recebido ainda</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
