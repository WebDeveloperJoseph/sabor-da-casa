"use client"

import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@supabase/supabase-js'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

type Props = {
  initial: {
    nomePizzaria: string
    telefone?: string | null
    endereco?: string | null
    cnpj?: string | null
    email?: string | null
    taxaEntrega: number
    pedidoMinimo: number
    tempoPreparoMinutos: number
    raioEntregaKm: number
    aceitarPedidos: boolean
    mensagemBoasVindas?: string | null
  }
}

export function ConfiguracoesForm({ initial }: Props) {
  const [form, setForm] = useState({
    nomePizzaria: initial.nomePizzaria ?? '',
    telefone: initial.telefone ?? '',
    endereco: initial.endereco ?? '',
    cnpj: initial.cnpj ?? '',
    email: initial.email ?? '',
    taxaEntrega: String(initial.taxaEntrega ?? 0),
    pedidoMinimo: String(initial.pedidoMinimo ?? 0),
    tempoPreparoMinutos: String(initial.tempoPreparoMinutos ?? 30),
    raioEntregaKm: String(initial.raioEntregaKm ?? 5),
    aceitarPedidos: initial.aceitarPedidos ?? true,
    mensagemBoasVindas: initial.mensagemBoasVindas ?? '',
  })
  const [loading, setLoading] = useState(false)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      console.debug('ConfiguracoesForm: enviando PUT /api/configuracoes', { form, hasSession: !!session })
      const res = await fetch('/api/configuracoes', {
        method: 'PUT',
        // garantir que cookies de sessão sejam enviados (caso o servidor dependa deles)
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({
          ...form,
          taxaEntrega: Number(form.taxaEntrega),
          pedidoMinimo: Number(form.pedidoMinimo),
          tempoPreparoMinutos: Number(form.tempoPreparoMinutos),
          raioEntregaKm: Number(form.raioEntregaKm),
        })
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        console.error('ConfiguracoesForm: resposta de erro', res.status, body)
        throw new Error(body?.erro || `Erro ao salvar configurações (status ${res.status})`)
      }

      const updated = await res.json().catch(() => null)
      console.debug('ConfiguracoesForm: resposta OK', updated)
      toast.success('Configurações salvas com sucesso')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar configurações'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* Informações Básicas */}
      <div className="bg-linear-to-br from-orange-50 to-red-50 rounded-xl border-2 border-orange-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <span className="w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center mr-3 text-sm">1</span>
          Informações Básicas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Nome da Pizzaria *</label>
            <Input 
              value={form.nomePizzaria} 
              onChange={(e) => setForm({ ...form, nomePizzaria: e.target.value })} 
              required 
              className="border-2 border-orange-200 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Telefone</label>
            <Input 
              value={form.telefone} 
              onChange={(e) => setForm({ ...form, telefone: e.target.value })} 
              className="border-2 border-orange-200 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-800 mb-2">Endereço</label>
            <Input 
              value={form.endereco} 
              onChange={(e) => setForm({ ...form, endereco: e.target.value })} 
              className="border-2 border-orange-200 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">CNPJ</label>
            <Input 
              value={form.cnpj} 
              onChange={(e) => setForm({ ...form, cnpj: e.target.value })} 
              className="border-2 border-orange-200 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Email</label>
            <Input 
              type="email" 
              value={form.email} 
              onChange={(e) => setForm({ ...form, email: e.target.value })} 
              className="border-2 border-orange-200 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Configurações de Pedidos */}
      <div className="bg-linear-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <span className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center mr-3 text-sm">2</span>
          Configurações de Pedidos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Taxa de Entrega (R$)</label>
            <Input 
              type="number" 
              step="0.01" 
              value={form.taxaEntrega} 
              onChange={(e) => setForm({ ...form, taxaEntrega: e.target.value })} 
              className="border-2 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Pedido Mínimo (R$)</label>
            <Input 
              type="number" 
              step="0.01" 
              value={form.pedidoMinimo} 
              onChange={(e) => setForm({ ...form, pedidoMinimo: e.target.value })} 
              className="border-2 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Tempo Preparo (min)</label>
            <Input 
              type="number" 
              value={form.tempoPreparoMinutos} 
              onChange={(e) => setForm({ ...form, tempoPreparoMinutos: e.target.value })} 
              className="border-2 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Raio Entrega (km)</label>
            <Input 
              type="number" 
              value={form.raioEntregaKm} 
              onChange={(e) => setForm({ ...form, raioEntregaKm: e.target.value })} 
              className="border-2 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Mensagem de Boas-Vindas */}
      <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <span className="w-8 h-8 bg-green-500 text-white rounded-lg flex items-center justify-center mr-3 text-sm">3</span>
          Mensagem de Boas-Vindas
        </h3>
        <Textarea 
          value={form.mensagemBoasVindas} 
          onChange={(e) => setForm({ ...form, mensagemBoasVindas: e.target.value })} 
          className="border-2 border-green-200 focus:border-green-500 focus:ring-green-500 min-h-[100px]"
          placeholder="Digite uma mensagem de boas-vindas para os clientes..."
        />
      </div>

      {/* Ações */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <label className="inline-flex items-center space-x-3 cursor-pointer group">
            <input
              type="checkbox"
              className="h-5 w-5 text-orange-600 border-2 border-gray-300 rounded focus:ring-orange-500 focus:ring-offset-2"
              checked={form.aceitarPedidos}
              onChange={(e) => setForm({ ...form, aceitarPedidos: e.target.checked })}
            />
            <span className="text-base font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">Aceitar novos pedidos</span>
          </label>

          <Button 
            type="submit" 
            disabled={loading}
            className="px-8 py-3 bg-linear-to-r from-orange-500 to-red-500 text-white font-bold rounded-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </div>
    </form>
  )
}
