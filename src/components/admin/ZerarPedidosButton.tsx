'use client'

import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { toast } from 'sonner'

export default function ZerarPedidosButton() {
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handle = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/pedidos/zerar', { method: 'DELETE' })
      if (res.ok) {
        const data = await res.json()
        toast.success(`Pedidos zerados. Removidos: ${data.pedidos} pedidos, ${data.itens} itens, ${data.avaliacoes} avaliações. Sequências resetadas.`)
        setTimeout(() => window.location.reload(), 1500)
      } else {
        toast.error('Erro ao zerar pedidos')
      }
    } catch (e) {
      console.error(e)
      toast.error('Erro ao zerar pedidos')
    } finally {
      setLoading(false)
      setConfirm(false)
    }
  }

  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium shadow-md hover:shadow-lg cursor-pointer"
      >
        <RotateCcw className="w-4 h-4" />
        Zerar Pedidos (IDs)
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 bg-orange-50 border-2 border-orange-300 rounded-lg p-3">
      <p className="text-sm font-medium text-orange-900">
        Confirmar? Isso vai deletar TODOS os pedidos e reiniciar os IDs a partir de #1.
      </p>
      <button
        onClick={handle}
        disabled={loading}
        className="px-3 py-1.5 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 text-sm font-medium cursor-pointer"
      >
        {loading ? 'Zerando...' : 'Confirmar'}
      </button>
      <button
        onClick={() => setConfirm(false)}
        disabled={loading}
        className="px-3 py-1.5 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 disabled:opacity-50 text-sm font-medium cursor-pointer"
      >
        Cancelar
      </button>
    </div>
  )
}
