"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"

type Props = {
  id: number
  nome: string
}

export default function DeleteClienteButton({ id, nome }: Props) {
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(`Tem certeza que deseja excluir o cliente "${nome}"? Esta ação não pode ser desfeita.`)) {
      return
    }

    setDeleting(true)
    try {
      const res = await fetch(`/api/clientes/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        throw new Error("Erro ao excluir cliente")
      }

      router.refresh()
    } catch (error) {
      console.error("Erro:", error)
      alert("Erro ao excluir cliente. Tente novamente.")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="text-red-600 hover:text-red-800 disabled:opacity-50 transition-colors p-1"
      title="Excluir cliente"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
