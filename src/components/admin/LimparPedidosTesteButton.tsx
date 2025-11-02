'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export default function LimparPedidosTesteButton() {
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleLimpar = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/pedidos/limpar-testes', {
        method: 'DELETE'
      })
      
      if (res.ok) {
        const data = await res.json()
        toast.success(`${data.count || 0} pedidos de teste removidos com sucesso!`)
        setTimeout(() => window.location.reload(), 1500)
      } else {
        toast.error('Erro ao limpar pedidos de teste')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao limpar pedidos de teste')
    } finally {
      setLoading(false)
      setShowConfirm(false)
    }
  }

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium shadow-md hover:shadow-lg"
      >
        <Trash2 className="w-4 h-4" />
        Limpar Pedidos de Teste
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 bg-red-50 border-2 border-red-300 rounded-lg p-3">
      <p className="text-sm font-medium text-red-900">
  Tem certeza? Isso vai deletar todos os pedidos de teste (ID #1 até #23).
      </p>
      <button
        onClick={handleLimpar}
        disabled={loading}
        className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
      >
        {loading ? 'Limpando...' : 'Confirmar'}
      </button>
      <button
        onClick={() => setShowConfirm(false)}
        disabled={loading}
        className="px-3 py-1.5 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 disabled:opacity-50 text-sm font-medium"
      >
        Cancelar
      </button>
    </div>
  )
}
