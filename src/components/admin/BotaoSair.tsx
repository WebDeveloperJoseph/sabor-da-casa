"use client"

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export function BotaoSair() {
  const router = useRouter()

  async function onSignOut() {
    try {
      // Limpar cookie de autenticação
      await fetch('/api/auth/logout', { method: 'POST' })
      toast.success('Sessão encerrada')
      router.push('/login')
      router.refresh()
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
