"use client"

import { useState } from 'react'
import { Pizza } from 'lucide-react'
import { MonteSuaPizzaDialog } from './MonteSuaPizzaDialog'

type PratoTamanho = {
  id: number
  pratoId: number
  tamanho: string
  preco: number
}

type Prato = {
  id: number
  nome: string
  preco: number
  descricao?: string | null
  imagem?: string | null
  tamanhos: PratoTamanho[]
}

type Props = {
  pizzas: Prato[]
}

export function MonteSuaPizzaButton({ pizzas }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full md:w-auto px-8 py-4 bg-linear-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 border-2 border-white cursor-pointer"
      >
        <Pizza className="w-6 h-6" />
        <span className="text-lg">Monte sua Pizza</span>
      </button>

      <MonteSuaPizzaDialog 
        open={open}
        onOpenChange={setOpen}
        pizzas={pizzas}
      />
    </>
  )
}
