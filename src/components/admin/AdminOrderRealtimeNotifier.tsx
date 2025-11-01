"use client"

import { useEffect, useState, useRef } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabaseClient'
import AdminOrderNotifier from './AdminOrderNotifier'

export default function AdminOrderRealtimeNotifier() {
  const [usePolling, setUsePolling] = useState(() => !supabase)
  const eventReceivedRef = useRef(false)

  useEffect(() => {
    if (!supabase) {
      console.warn('Supabase não configurado — fallback para polling')
      return
    }

    console.debug('AdminOrderRealtimeNotifier: inicializando canal realtime')

    // Cria canal para escutar mudanças na tabela `pedidos`
    const channel = supabase.channel('public:pedidos')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pedidos' }, (payload) => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const novo = (payload as any).new
          const id = novo?.id
          const nome = novo?.nome_cliente || novo?.nomeCliente || ''
          console.debug('AdminOrderRealtimeNotifier: novo evento', { id, nome, payload })
          toast.success(`Novo pedido #${id} — ${nome}`)

          // marcar que recebemos um evento e cancelar fallback
          eventReceivedRef.current = true

          // Notificação do navegador
          try {
            if (typeof Notification !== 'undefined') {
              if (Notification.permission === 'granted') {
                const n = new Notification('Novo pedido', { body: `Pedido #${id} — ${nome}` })
                n.onclick = () => {
                  window.focus()
                  window.location.href = `/admin/pedidos/${id}`
                }
              } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then((perm) => {
                  if (perm === 'granted') {
                    const n = new Notification('Novo pedido', { body: `Pedido #${id} — ${nome}` })
                    n.onclick = () => {
                      window.focus()
                      window.location.href = `/admin/pedidos/${id}`
                    }
                  }
                })
              }
            }
          } catch (e) {
            console.error('Erro ao disparar Notification API', e)
          }
        } catch (err) {
          console.error('Erro ao processar evento realtime do pedido', err)
        }
      })

    try {
      channel.subscribe()
      console.debug('AdminOrderRealtimeNotifier: subscribe chamado')
    } catch (subErr) {
      console.error('Erro ao subscribir no canal realtime:', subErr)
    }

    // Se não receber eventos em X ms, ativamos polling como fallback
    const fallbackTimeout = setTimeout(() => {
      if (!eventReceivedRef.current) {
        console.warn('AdminOrderRealtimeNotifier: nenhum evento realtime recebido — ativando polling fallback')
        setUsePolling(true)
      }
    }, 20000)

    return () => {
      try { channel.unsubscribe() } catch (e) { console.warn('Erro ao unsubscribir canal', e) }
      clearTimeout(fallbackTimeout)
    }
  }, [])

  // Se decidirmos usar polling, renderizamos o AdminOrderNotifier (componente que já implementa polling)
  if (usePolling) return <AdminOrderNotifier />

  return null
}
