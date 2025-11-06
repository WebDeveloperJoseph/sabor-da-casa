'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Edit2, Trash2 } from 'lucide-react'

type Borda = {
  id: number
  nome: string
  precoAdicional: number
  ativo: boolean
}

export default function BordasPage() {
  const [bordas, setBordas] = useState<Borda[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState<Borda | null>(null)
  const [nome, setNome] = useState('')
  const [precoAdicional, setPrecoAdicional] = useState('')
  const [ativo, setAtivo] = useState(true)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    carregarBordas()
  }, [])

  async function carregarBordas() {
    try {
      const res = await fetch('/api/bordas')
      if (res.ok) {
        const data = await res.json()
        setBordas(data)
      }
    } catch (error) {
      console.error('Erro ao carregar bordas:', error)
    } finally {
      setLoading(false)
    }
  }

  function abrirForm(borda?: Borda) {
    if (borda) {
      setEditando(borda)
      setNome(borda.nome)
      setPrecoAdicional(String(borda.precoAdicional))
      setAtivo(borda.ativo)
    } else {
      setEditando(null)
      setNome('')
      setPrecoAdicional('')
      setAtivo(true)
    }
    setShowForm(true)
  }

  function fecharForm() {
    setShowForm(false)
    setEditando(null)
    setNome('')
    setPrecoAdicional('')
    setAtivo(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim() || !precoAdicional || Number(precoAdicional) < 0) {
      toast.error('Preencha todos os campos corretamente')
      return
    }

    try {
      setSalvando(true)
      const url = editando ? `/api/bordas/${editando.id}` : '/api/bordas'
      const method = editando ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nome.trim(),
          precoAdicional: Number(precoAdicional),
          ativo
        })
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Erro ao salvar')
      }

      toast.success(editando ? 'Borda atualizada!' : 'Borda criada!')
      fecharForm()
      carregarBordas()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao salvar'
      toast.error(message)
    } finally {
      setSalvando(false)
    }
  }

  async function handleDelete(id: number, nome: string) {
    if (!confirm(`Tem certeza que deseja excluir "${nome}"?`)) return

    try {
      const res = await fetch(`/api/bordas/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Erro ao excluir')
      }
      toast.success('Borda excluída!')
      carregarBordas()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao excluir'
      toast.error(message)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Bordas Recheadas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie as bordas recheadas disponíveis para as pizzas
          </p>
        </div>
        <Button onClick={() => abrirForm()}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Borda
        </Button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h2 className="text-lg font-semibold mb-4">
            {editando ? 'Editar Borda' : 'Nova Borda'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome</label>
                <Input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex.: Catupiry"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Preço Adicional (R$)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={precoAdicional}
                  onChange={(e) => setPrecoAdicional(e.target.value)}
                  placeholder="Ex.: 5.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <div className="flex items-center h-10">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="accent-primary"
                      checked={ativo}
                      onChange={(e) => setAtivo(e.target.checked)}
                    />
                    Ativa
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={salvando}>
                {salvando ? 'Salvando...' : editando ? 'Salvar' : 'Criar'}
              </Button>
              <Button type="button" variant="secondary" onClick={fecharForm}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Preço Adicional
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bordas.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  Nenhuma borda cadastrada. Clique em &quot;Nova Borda&quot; para começar.
                </td>
              </tr>
            ) : (
              bordas.map((borda) => (
                <tr key={borda.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{borda.nome}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      R$ {borda.precoAdicional.toString().replace('.', ',')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        borda.ativo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {borda.ativo ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => abrirForm(borda)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(borda.id, borda.nome)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
