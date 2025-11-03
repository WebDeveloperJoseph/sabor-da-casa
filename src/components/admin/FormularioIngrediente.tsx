"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

type Ingrediente = {
  id: number
  nome: string
  alergenico: boolean
}

export default function FormularioIngrediente({ ingrediente }: { ingrediente?: Ingrediente }) {
  const router = useRouter()
  const [nome, setNome] = useState(ingrediente?.nome ?? '')
  const [alergenico, setAlergenico] = useState<boolean>(ingrediente?.alergenico ?? false)
  const [salvando, setSalvando] = useState(false)

  const isEditing = Boolean(ingrediente)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim()) {
      toast.error('Nome é obrigatório')
      return
    }
    try {
      setSalvando(true)
      
      const payload = { nome: nome.trim(), alergenico }
      const url = isEditing ? `/api/ingredientes/${ingrediente!.id}` : '/api/ingredientes'
      const method = isEditing ? 'PUT' : 'POST'
      const res = await fetch(url, { 
        method, 
        headers: { 
          'Content-Type': 'application/json'
        }, 
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.message || 'Falha ao salvar')
      }
      toast.success(isEditing ? 'Ingrediente atualizado!' : 'Ingrediente criado!')
      router.push('/admin/ingredientes')
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar'
      toast.error(message)
      console.error(err)
    } finally {
      setSalvando(false)
    }
  }

  async function onDelete() {
    if (!ingrediente) return
    if (!confirm('Tem certeza que deseja excluir este ingrediente?')) return
    try {
      const res = await fetch(`/api/ingredientes/${ingrediente.id}`, { 
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.message || 'Falha ao excluir')
      }
      toast.success('Ingrediente excluído')
      router.push('/admin/ingredientes')
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao excluir'
      toast.error(message)
      console.error(err)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Nome</label>
          <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Muçarela" />
        </div>
        <div className="flex items-end gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="accent-primary" checked={alergenico} onChange={(e) => setAlergenico(e.target.checked)} />
            Alérgeno
          </label>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={salvando}>
          {salvando ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Criar ingrediente'}
        </Button>
        {isEditing && (
          <Button type="button" variant="destructive" onClick={onDelete}>
            Excluir
          </Button>
        )}
      </div>
    </form>
  )
}
