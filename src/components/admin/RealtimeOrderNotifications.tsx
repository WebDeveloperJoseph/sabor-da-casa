"use client"

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { Bell, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NewOrder {
  id: number
  dailyNumber: number
  nome_cliente: string
  valor_total: number
  created_at: string
}

export function RealtimeOrderNotifications() {
  const [lastCheck, setLastCheck] = useState<Date>(new Date())
  const [isEnabled, setIsEnabled] = useState(true)
  const [newOrdersCount, setNewOrdersCount] = useState(0)

  // Sons de notificação
  const playNotificationSound = () => {
    try {
      // Som de notificação usando Web Audio API
      const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const audioContext = new AudioCtx()
      
      // Criar um som de campainha simples
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1)
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2)
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (error) {
      console.log('Som de notificação não disponível:', error)
    }
  }

  // Verificar novos pedidos
  const checkNewOrders = useCallback(async () => {
    if (!isEnabled) return

    try {
      const response = await fetch(`/api/pedidos?desde=${lastCheck.toISOString()}&limite=10`)
      if (!response.ok) return

      const pedidos: NewOrder[] = await response.json()
      const newOrders = pedidos.filter(pedido => 
        new Date(pedido.created_at) > lastCheck
      )

      if (newOrders.length > 0) {
        setNewOrdersCount(prev => prev + newOrders.length)
        
        // Tocar som para cada novo pedido
        newOrders.forEach((pedido, index) => {
          setTimeout(() => {
            playNotificationSound()
            
            toast.success(`Novo Pedido #${pedido.dailyNumber}`, {
              description: `${pedido.nome_cliente} - R$ ${Number(pedido.valor_total).toFixed(2)}`,
              icon: <Package className="h-4 w-4" />,
              duration: 8000,
              action: {
                label: 'Ver Pedidos',
                onClick: () => window.location.reload()
              }
            })
          }, index * 1000) // Delay entre notificações
        })

        // Atualizar título da página com contador
        document.title = `(${newOrdersCount + newOrders.length}) Admin - Sabor da Casa`
      }

      setLastCheck(new Date())
    } catch (error) {
      console.error('Erro ao verificar novos pedidos:', error)
    }
  }, [lastCheck, isEnabled, newOrdersCount])

  // Polling a cada 10 segundos
  useEffect(() => {
    const interval = setInterval(checkNewOrders, 10000)
    return () => clearInterval(interval)
  }, [lastCheck, isEnabled, checkNewOrders])

  // Limpar contador quando a página for focada
  useEffect(() => {
    const handleFocus = () => {
      setNewOrdersCount(0)
      document.title = 'Admin - Sabor da Casa'
      setLastCheck(new Date())
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isEnabled ? "default" : "outline"}
        size="sm"
        onClick={() => setIsEnabled(!isEnabled)}
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {newOrdersCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {newOrdersCount > 99 ? '99+' : newOrdersCount}
          </span>
        )}
      </Button>
      <span className="text-sm text-muted-foreground">
        {isEnabled ? 'Notificações ativas' : 'Notificações pausadas'}
      </span>
    </div>
  )
}