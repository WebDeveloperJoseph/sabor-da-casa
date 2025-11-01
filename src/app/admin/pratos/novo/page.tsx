import FormularioPrato from '@/components/admin/FormularioPrato'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function NovoPratoPage() {
  const [categorias, ingredientes] = await Promise.all([
    prisma.categoria.findMany({ orderBy: { nome: 'asc' } }),
    prisma.ingrediente.findMany({ orderBy: { nome: 'asc' } })
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Novo prato</h1>
      <FormularioPrato modo="create" categorias={categorias} ingredientes={ingredientes} />
    </div>
  )
}
