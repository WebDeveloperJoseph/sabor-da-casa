"use client"

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export function BotaoExcluirPrato({ id }: { id: number }) {
  const router = useRouter()

  async function onDelete() {
    if (!confirm('Tem certeza que deseja excluir este prato?')) return
    try {
      const res = await fetch(`/api/pratos/${id}`, { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.message || 'Falha ao excluir')
      }
      toast.success('Prato excluído')
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao excluir'
      toast.error(message)
      console.error(err)
    }
  }

  return (
    <Button variant="destructive" onClick={onDelete} size="sm">
      Excluir
    </Button>
  )
}
