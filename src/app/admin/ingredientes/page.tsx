import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function IngredientesPage() {
  const ingredientes = await prisma.ingrediente.findMany({ orderBy: { nome: 'asc' } })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Ingredientes</h1>
        <Link href="/admin/ingredientes/novo">
          <Button>Novo ingrediente</Button>
        </Link>
      </div>

      <div className="overflow-x-auto border rounded-md">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3">Nome</th>
              <th className="text-left p-3">Alérgeno</th>
              <th className="text-right p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {ingredientes.map((ing) => (
              <tr key={ing.id} className="border-t">
                <td className="p-3">{ing.nome}</td>
                <td className="p-3">{ing.alergenico ? 'Sim' : 'Não'}</td>
                <td className="p-3">
                  <div className="flex gap-2 justify-end">
                    <Link href={`/admin/ingredientes/${ing.id}`}>
                      <Button variant="secondary" size="sm">Editar</Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {ingredientes.length === 0 && (
              <tr>
                <td colSpan={3} className="p-4 text-center text-muted-foreground">Nenhum ingrediente cadastrado</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
