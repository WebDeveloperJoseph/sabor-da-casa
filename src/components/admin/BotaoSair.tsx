"use client"

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'

export function BotaoSair() {
  const router = useRouter()

  async function onSignOut() {
    if (!supabase) return router.push('/login')
    try {
      await supabase.auth.signOut()
      toast.success('Sessão encerrada')
      router.push('/login')
    } catch (err) {
      console.error(err)
      toast.error('Falha ao encerrar sessão')
    }
  }

  return (
    <Button variant="outline" onClick={onSignOut} size="sm">
      Sair
    </Button>
  )
}
