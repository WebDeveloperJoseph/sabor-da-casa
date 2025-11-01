"use client"

import { useEffect, useRef } from "react"
import { toast } from "sonner"

export default function AdminOrderNotifier() {
  const lastSeenRef = useRef<number | null>(null)

  useEffect(() => {
    // Inicializa a partir do localStorage
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem('lastSeenPedidoId') : null
    if (saved) lastSeenRef.current = Number(saved)

    let mounted = true

    const checkLatest = async () => {
      try {
        const res = await fetch('/api/pedidos?limite=1')
        if (!res.ok) return
        const data = await res.json()
        if (!Array.isArray(data) || data.length === 0) return
        const latest = data[0]
        const latestId = Number(latest.id)

        if (lastSeenRef.current == null) {
          lastSeenRef.current = latestId
          window.localStorage.setItem('lastSeenPedidoId', String(latestId))
          return
        }

        if (latestId > (lastSeenRef.current ?? 0)) {
          // novo pedido
          lastSeenRef.current = latestId
          window.localStorage.setItem('lastSeenPedidoId', String(latestId))

          // Notificação visual (toast)
          toast.success(`Novo pedido #${latestId} — ${latest.nomeCliente ?? ''}`)

          // Notificação do navegador (se permitido) com ação de abrir detalhes
          try {
            if (typeof Notification !== 'undefined') {
              if (Notification.permission === 'granted') {
                const n = new Notification('Novo pedido', {
                  body: `Pedido #${latestId} — ${latest.nomeCliente ?? ''}`,
                })
                n.onclick = () => {
                  window.focus()
                  window.location.href = `/admin/pedidos/${latestId}`
                }
              } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then((perm) => {
                  if (perm === 'granted') {
                    const n = new Notification('Novo pedido', {
                      body: `Pedido #${latestId} — ${latest.nomeCliente ?? ''}`,
                    })
                    n.onclick = () => {
                      window.focus()
                      window.location.href = `/admin/pedidos/${latestId}`
                    }
                  }
                })
              }
            }
          } catch {
            // ignore
          }
        }
      } catch (err) {
        // silenciar
        console.error('Erro ao checar pedidos:', err)
      }
    }

    // Checa imediatamente e depois a cada 8s
    checkLatest()
    const id = setInterval(() => {
      if (!mounted) return
      checkLatest()
    }, 8000)

    return () => {
      mounted = false
      clearInterval(id)
    }
  }, [])

  return null
}
