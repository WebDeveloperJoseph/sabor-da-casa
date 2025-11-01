import FormularioPrato from '@/components/admin/FormularioPrato'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function EditarPratoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params
  const id = Number(idStr)
  const prato = await prisma.prato.findUnique({
    where: { id },
    include: { ingredientes: true }
  })

  if (!prato) return notFound()

  const [categorias, ingredientes] = await Promise.all([
    prisma.categoria.findMany({ orderBy: { nome: 'asc' } }),
    prisma.ingrediente.findMany({ orderBy: { nome: 'asc' } })
  ])

  const initial = {
    id: prato.id,
    nome: prato.nome,
    descricao: prato.descricao,
    preco: Number(prato.preco),
    imagem: prato.imagem,
    categoriaId: prato.categoriaId,
    destaque: prato.destaque,
    ativo: prato.ativo,
    ingredientesIds: prato.ingredientes.map((pi) => pi.ingredienteId)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Editar prato</h1>
      <FormularioPrato modo="edit" categorias={categorias} ingredientes={ingredientes} initial={initial} />
    </div>
  )
}
