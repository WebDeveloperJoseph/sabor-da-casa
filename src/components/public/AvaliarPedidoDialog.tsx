"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Star } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface AvaliarPedidoDialogProps {
  pedidoId: number
  pedidoNumero?: number
}

export function AvaliarPedidoDialog({ pedidoId, pedidoNumero }: AvaliarPedidoDialogProps) {
  const [open, setOpen] = useState(false)
  const [estrelas, setEstrelas] = useState(0)
  const [hoverEstrelas, setHoverEstrelas] = useState(0)
  const [comentario, setComentario] = useState("")
  const [salvando, setSalvando] = useState(false)
  const router = useRouter()

  const handleSalvar = async () => {
    if (estrelas === 0) {
      toast.error("Selecione uma avaliação de 1 a 5 estrelas")
      return
    }

    setSalvando(true)
    try {
      const response = await fetch("/api/avaliacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pedidoId,
          estrelas,
          comentario: comentario.trim() || null
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erro ao salvar avaliação")
      }

      toast.success("Avaliação enviada com sucesso!")
      setOpen(false)
      setEstrelas(0)
      setComentario("")
      router.refresh()
    } catch (error) {
      console.error("Erro ao salvar avaliação:", error)
      const message = error instanceof Error ? error.message : "Erro ao salvar avaliação"
      toast.error(message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Star className="h-4 w-4" />
          Avaliar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Avaliar Pedido {pedidoNumero ? `#${pedidoNumero}` : ""}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Rating Stars */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-gray-600">Como foi sua experiência?</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setEstrelas(star)}
                  onMouseEnter={() => setHoverEstrelas(star)}
                  onMouseLeave={() => setHoverEstrelas(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoverEstrelas || estrelas)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {estrelas > 0 && (
              <p className="text-sm font-medium text-gray-700">
                {estrelas === 1 && "Muito ruim"}
                {estrelas === 2 && "Ruim"}
                {estrelas === 3 && "Regular"}
                {estrelas === 4 && "Bom"}
                {estrelas === 5 && "Excelente"}
              </p>
            )}
          </div>

          {/* Comentário opcional */}
          <div className="space-y-2">
            <label htmlFor="comentario" className="text-sm font-medium text-gray-700">
              Comentário (opcional)
            </label>
            <Textarea
              id="comentario"
              placeholder="Conte-nos como foi sua experiência..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              maxLength={500}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-gray-500 text-right">
              {comentario.length}/500
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={salvando}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSalvar}
              disabled={salvando || estrelas === 0}
              className="gap-2"
            >
              {salvando ? (
                <>Enviando...</>
              ) : (
                <>
                  <Star className="h-4 w-4" />
                  Enviar Avaliação
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
