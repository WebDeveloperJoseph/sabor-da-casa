"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Trash } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  id: number
}

export default function DeletePedidoButton({ id }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    const ok = confirm('Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita.')
    if (!ok) return
    try {
      setLoading(true)
      const res = await fetch(`/api/pedidos/${id}`, { method: 'DELETE' })
      const body = await res.json()
      if (!res.ok) throw new Error(body?.erro || 'Erro ao excluir pedido')
      toast.success('Pedido excluído')
      router.refresh()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao excluir pedido'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      size="sm"
      variant="destructive"
      onClick={handleDelete}
      disabled={loading}
      className="ml-2 inline-flex items-center gap-2"
    >
      <Trash className="w-4 h-4" />
      Excluir
    </Button>
  )
}
