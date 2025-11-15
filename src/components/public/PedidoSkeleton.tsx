"use client"

export function PedidoSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
      <div className="p-4 md:p-6">
        {/* Cabeçalho do pedido */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-40"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded-full w-24"></div>
        </div>

        {/* Itens */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="h-5 bg-gray-200 rounded w-16 mb-2"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 mt-3 pt-3">
            <div className="flex justify-between">
              <div className="h-5 bg-gray-300 rounded w-16"></div>
              <div className="h-5 bg-gray-300 rounded w-24"></div>
            </div>
          </div>
        </div>

        {/* Área de avaliação/ação */}
        <div className="h-12 bg-gray-200 rounded w-full"></div>
      </div>
    </div>
  )
}

export function BuscaPedidosLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="h-8 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
      {[1, 2, 3].map((i) => (
        <PedidoSkeleton key={i} />
      ))}
    </div>
  )
}