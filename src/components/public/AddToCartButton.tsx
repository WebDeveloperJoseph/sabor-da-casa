"use client"

import { Button } from "@/components/ui/button"
import { useCart } from "./CartProvider"
import { ShoppingCart } from "lucide-react"

export function AddToCartButton({
  pratoId,
  nome,
  preco
}: {
  pratoId: number
  nome: string
  preco: number
}) {
  const { add, settings } = useCart()
  const disabled = !settings.aceitarPedidos

  return (
    <Button
      onClick={() => add({ pratoId, nome, preco }, 1)}
      className="bg-orange-500 hover:bg-orange-600"
      disabled={disabled}
    >
      <ShoppingCart />
      {disabled ? 'Pedidos pausados' : 'Adicionar'}
    </Button>
  )
}
