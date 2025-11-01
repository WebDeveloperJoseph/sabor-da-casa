"use client"

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

export function BotaoExcluirCategoria({ id }: { id: number }) {
  const router = useRouter()

  async function onDelete() {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return
    try {
      // Obter token de autenticação
      if (!supabase) {
        throw new Error('Supabase não configurado')
      }
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Sessão expirada. Faça login novamente.')
        router.push('/login')
        return
      }

      const res = await fetch(`/api/categorias/${id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { message?: string }
        throw new Error(err?.message || 'Falha ao excluir categoria')
      }
      toast.success('Categoria excluída')
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao excluir categoria'
      toast.error(message)
      console.error(error)
    }
  }

  return (
    <Button variant="destructive" size="icon" title="Excluir" onClick={onDelete}>
      <Trash2 className="w-4 h-4" />
    </Button>
  )
}
