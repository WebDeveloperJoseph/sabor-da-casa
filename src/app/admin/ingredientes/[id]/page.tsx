import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import FormularioIngrediente from '@/components/admin/FormularioIngrediente'

export const dynamic = 'force-dynamic'

export default async function EditarIngredientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params
  const id = Number(idParam)
  const ingrediente = await prisma.ingrediente.findUnique({ where: { id } })
  if (!ingrediente) return notFound()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Editar ingrediente</h1>
      <FormularioIngrediente ingrediente={ingrediente} />
    </div>
  )
}
