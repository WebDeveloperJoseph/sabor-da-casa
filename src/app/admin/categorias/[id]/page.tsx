import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import FormularioCategoria from "../../../../components/admin/FormularioCategoria"

interface EditarCategoriaPageProps {
  params: Promise<{ id: string }>
}

export default async function EditarCategoriaPage({ params }: EditarCategoriaPageProps) {
  const { id } = await params
  const categoria = await prisma.categoria.findUnique({
    where: { id: parseInt(id) }
  })

  if (!categoria) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Editar Categoria</h1>
        <p className="text-gray-600 mt-2">
          Modifique as informações da categoria &quot;{categoria.nome}&quot;
        </p>
      </div>

      {/* Formulário */}
      <FormularioCategoria categoria={categoria} />
    </div>
  )
}