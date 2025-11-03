"use client"

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import UploadImagem from '@/components/admin/UploadImagem'

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
    tamanhos?: Array<{ tamanho: string; preco: number }>
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
  
  // Estados para tamanhos (P, M, G)
  const [usarTamanhos, setUsarTamanhos] = useState<boolean>(!!(initial?.tamanhos && initial.tamanhos.length > 0))
  const [precoP, setPrecoP] = useState<string>(initial?.tamanhos?.find(t => t.tamanho === 'P')?.preco.toString() ?? '')
  const [precoM, setPrecoM] = useState<string>(initial?.tamanhos?.find(t => t.tamanho === 'M')?.preco.toString() ?? '')
  const [precoG, setPrecoG] = useState<string>(initial?.tamanhos?.find(t => t.tamanho === 'G')?.preco.toString() ?? '')

  const isValid = useMemo(() => {
    if (nome.trim().length === 0 || categoriaId === '') return false
    if (usarTamanhos) {
      // Se usar tamanhos, ao menos um tamanho deve ter preço válido
      return Number(precoP) > 0 || Number(precoM) > 0 || Number(precoG) > 0
    }
    // Se não usar tamanhos, preco principal deve ser válido
    return Number(preco) > 0
  }, [nome, categoriaId, preco, usarTamanhos, precoP, precoM, precoG])

  function toggleIngrediente(id: number) {
    setIngredientesSelecionados((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) {
      toast.error('Preencha nome, categoria e preço(s)')
      return
    }
    try {
      setSalvando(true)
      
      // Montar array de tamanhos se ativado
      const tamanhos = usarTamanhos 
        ? [
            Number(precoP) > 0 ? { tamanho: 'P', preco: Number(precoP) } : null,
            Number(precoM) > 0 ? { tamanho: 'M', preco: Number(precoM) } : null,
            Number(precoG) > 0 ? { tamanho: 'G', preco: Number(precoG) } : null,
          ].filter(Boolean) as Array<{ tamanho: string; preco: number }>
        : []
      
      const payload = {
        nome: nome.trim(),
        descricao: descricao.trim() || null,
        preco: usarTamanhos ? 0 : Number(preco), // preco principal 0 se usar tamanhos
        imagem: imagem.trim() || null,
        categoriaId: Number(categoriaId),
        ingredientes: ingredientesSelecionados,
        destaque,
        ativo,
        tamanhos
      }
      const url = modo === 'create' ? '/api/pratos' : `/api/pratos/${initial?.id}`
      const method = modo === 'create' ? 'POST' : 'PUT'
      const res = await fetch(url, { 
        method, 
        headers: { 'Content-Type': 'application/json' }, 
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
        
        {/* Opção de usar tamanhos */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input 
              type="checkbox" 
              className="accent-primary" 
              checked={usarTamanhos} 
              onChange={(e) => setUsarTamanhos(e.target.checked)} 
            />
            Usar tamanhos P/M/G (pizzas)
          </label>
          <p className="text-xs text-muted-foreground">Marque para cadastrar preços por tamanho</p>
        </div>

        {/* Preço único OU tamanhos */}
        {!usarTamanhos ? (
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Preço (R$)</label>
            <Input type="number" min="0" step="0.01" value={preco} onChange={(e) => setPreco(e.target.value)} placeholder="Ex.: 49.90" />
          </div>
        ) : (
          <div className="md:col-span-2 grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Preço P (R$)</label>
              <Input type="number" min="0" step="0.01" value={precoP} onChange={(e) => setPrecoP(e.target.value)} placeholder="Ex.: 35.90" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Preço M (R$)</label>
              <Input type="number" min="0" step="0.01" value={precoM} onChange={(e) => setPrecoM(e.target.value)} placeholder="Ex.: 49.90" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Preço G (R$)</label>
              <Input type="number" min="0" step="0.01" value={precoG} onChange={(e) => setPrecoG(e.target.value)} placeholder="Ex.: 65.90" />
            </div>
          </div>
        )}
        
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
