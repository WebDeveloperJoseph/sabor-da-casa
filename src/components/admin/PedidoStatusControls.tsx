"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

type Props = {
  id: number
  currentStatus: string
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'em_preparo', label: 'Em Preparo' },
  { value: 'saiu_entrega', label: 'Saiu para Entrega' },
  { value: 'entregue', label: 'Entregue' },
  { value: 'cancelado', label: 'Cancelado' },
]

export default function PedidoStatusControls({ id, currentStatus }: Props) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const updateStatus = async (newStatus: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/pedidos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err?.erro || 'Erro ao atualizar status')
        setStatus(currentStatus)
        return
      }

      const updated = await res.json()
      setStatus(updated.status)
      toast.success('Status atualizado')
      // Atualiza a página/server components
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error('Erro ao atualizar status')
      setStatus(currentStatus)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-2">
      <label className="sr-only">Status</label>
      <select
        value={status}
        onChange={(e) => updateStatus(e.target.value)}
        disabled={loading}
        className="text-sm border rounded px-2 py-1"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}
