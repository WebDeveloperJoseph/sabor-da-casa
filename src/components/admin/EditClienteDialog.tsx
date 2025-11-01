"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Pencil, X, Check } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type Cliente = {
  id: number
  nome: string
  telefone: string
  email: string | null
  dataNascimento: Date | null
  endereco: string | null
  aceitaPromocoes: boolean
}

type Props = {
  cliente: Cliente
}

export default function EditClienteDialog({ cliente }: Props) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    nome: cliente.nome,
    telefone: cliente.telefone,
    email: cliente.email || "",
    dataNascimento: cliente.dataNascimento 
      ? cliente.dataNascimento.toISOString().split('T')[0] 
      : "",
    endereco: cliente.endereco || "",
    aceitaPromocoes: cliente.aceitaPromocoes,
  })
  const router = useRouter()

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/clientes/${cliente.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          email: formData.email || null,
          dataNascimento: formData.dataNascimento || null,
          endereco: formData.endereco || null,
        }),
      })

      if (!res.ok) {
        throw new Error("Erro ao atualizar cliente")
      }

      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Erro:", error)
      alert("Erro ao atualizar cliente. Tente novamente.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-orange-600 hover:text-orange-800 transition-colors p-1"
        title="Editar cliente"
      >
        <Pencil className="w-4 h-4" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Nome *</label>
              <Input
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Nome completo"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Telefone *</label>
              <Input
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                placeholder="(83) 99999-9999"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Data de Nascimento</label>
              <Input
                type="date"
                value={formData.dataNascimento}
                onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Endereço</label>
              <Input
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                placeholder="Rua, número, bairro"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.aceitaPromocoes}
                onChange={(e) => setFormData({ ...formData, aceitaPromocoes: e.target.checked })}
                className="rounded"
              />
              <label className="text-sm text-gray-700">Aceita receber promoções</label>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={saving}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !formData.nome || !formData.telefone}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Check className="w-4 h-4 mr-2" />
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
