"use client"

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import UploadImagem from '@/components/admin/UploadImagem'
import { supabase } from '@/lib/supabaseClient'

type Categoria = { id: number; nome: string }
type Ingrediente = { id: number; nome: string }

type Props = {
  modo: 'create' | 'edit'
  categorias: Categoria[]
  ingredientes: Ingrediente[]
  initial?: {
    id?: number
    nome: string
    descricao: string | null
    preco: number
    imagem: string | null
    categoriaId: number
    destaque: boolean
    ativo: boolean
    ingredientesIds: number[]
  }
}

export default function FormularioPrato({ modo, categorias, ingredientes, initial }: Props) {
  const router = useRouter()
  const [nome, setNome] = useState(initial?.nome ?? '')
  const [descricao, setDescricao] = useState(initial?.descricao ?? '')
  const [preco, setPreco] = useState<string>(initial ? String(initial.preco) : '')
  const [imagem, setImagem] = useState(initial?.imagem ?? '')
  const [categoriaId, setCategoriaId] = useState<string>(initial ? String(initial.categoriaId) : '')
  const [destaque, setDestaque] = useState<boolean>(initial?.destaque ?? false)
  const [ativo, setAtivo] = useState<boolean>(initial?.ativo ?? true)
  const [ingredientesSelecionados, setIngredientesSelecionados] = useState<number[]>(initial?.ingredientesIds ?? [])
  const [salvando, setSalvando] = useState(false)

  const isValid = useMemo(() => nome.trim().length > 0 && categoriaId !== '' && Number(preco) > 0, [nome, categoriaId, preco])

  function toggleIngrediente(id: number) {
    setIngredientesSelecionados((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) {
      toast.error('Preencha nome, preço e categoria')
      return
    }
    try {
      setSalvando(true)
      
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
      
      const payload = {
        nome: nome.trim(),
        descricao: descricao.trim() || null,
        preco: Number(preco),
        imagem: imagem.trim() || null,
        categoriaId: Number(categoriaId),
        ingredientes: ingredientesSelecionados,
        destaque,
        ativo
      }
      const url = modo === 'create' ? '/api/pratos' : `/api/pratos/${initial?.id}`
      const method = modo === 'create' ? 'POST' : 'PUT'
      const res = await fetch(url, { 
        method, 
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }, 
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.message || 'Falha ao salvar prato')
      }
      toast.success(modo === 'create' ? 'Prato criado!' : 'Prato atualizado!')
      router.push('/admin/pratos')
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar'
      console.error(err)
      toast.error(message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Nome</label>
          <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Calabresa" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Preço (R$)</label>
          <Input type="number" min="0" step="0.01" value={preco} onChange={(e) => setPreco(e.target.value)} placeholder="Ex.: 49.90" />
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-medium">Descrição</label>
          <Textarea value={descricao ?? ''} onChange={(e) => setDescricao(e.target.value)} placeholder="Detalhes do prato" rows={3} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Categoria</label>
          <Select value={categoriaId} onValueChange={setCategoriaId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categorias.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Imagem</label>
          <div className="flex flex-col gap-2">
            <Input value={imagem ?? ''} onChange={(e) => setImagem(e.target.value)} placeholder="Cole uma URL de imagem (opcional)" />
            <div className="text-xs text-muted-foreground">ou envie um arquivo para o Storage</div>
            <UploadImagem onUploaded={(url) => setImagem(url)} />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Ingredientes</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-56 overflow-auto p-2 border rounded-md">
          {ingredientes.map((ing) => (
            <label key={ing.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="accent-primary"
                checked={ingredientesSelecionados.includes(ing.id)}
                onChange={() => toggleIngrediente(ing.id)}
              />
              {ing.nome}
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="accent-primary" checked={destaque} onChange={(e) => setDestaque(e.target.checked)} />
          Destaque
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="accent-primary" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} />
          Ativo
        </label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={!isValid || salvando}>
          {salvando ? 'Salvando...' : modo === 'create' ? 'Criar prato' : 'Salvar alterações'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
