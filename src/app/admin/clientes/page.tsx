import Link from "next/link"
import { prisma } from "@/lib/prisma"
import type { Cliente } from "@/generated/prisma"
type ClienteWithCount = Cliente & { _count: { pedidos: number } }
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import EditClienteDialog from "@/components/admin/EditClienteDialog"
import DeleteClienteButton from "@/components/admin/DeleteClienteButton"

// Força renderização dinâmica
export const dynamic = 'force-dynamic'

export default async function ClientesPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const busca = (searchParams?.busca as string) || ""
  const aniversariantes = (searchParams?.aniversariantes as string) === "true"

  // Base query
  let clientes: ClienteWithCount[] = []
  let erroPrisma: string | null = null
  try {
    clientes = await prisma.cliente.findMany({
      where: { ativo: true },
      include: {
        _count: { select: { pedidos: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    })
  } catch {
    erroPrisma = "Cliente model não encontrado no Prisma Client. Regere o client com: npx prisma generate"
  }

  if (busca) {
    const b = busca.trim()
    clientes = clientes.filter((c) => {
      const alvo = `${c.nome} ${c.telefone} ${c.email ?? ""}`.toLowerCase()
      return alvo.includes(b.toLowerCase())
    })
  }

  if (aniversariantes) {
    const hoje = new Date()
    const mes = hoje.getUTCMonth() + 1
    clientes = clientes.filter((c) => c.dataNascimento && c.dataNascimento.getUTCMonth() + 1 === mes)
  }

  return (
    <div className="space-y-6">
      {erroPrisma && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-800 p-3">
          {erroPrisma}
        </div>
      )}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Clientes</h1>
        <div className="flex items-center gap-3">
          <Link 
            href="/admin/clientes/aniversariantes" 
            className="text-sm px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors"
          >
            🎂 Aniversariantes Hoje
          </Link>
          <Link href="/admin/pedidos" className="text-sm text-gray-600 hover:text-orange-600">
            Ver pedidos
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <Card className="p-4 border-2 border-orange-100">
        <form className="flex flex-col md:flex-row gap-3 items-start md:items-center">
          <div className="flex-1 w-full">
            <Input name="busca" defaultValue={busca} placeholder="Buscar por nome, telefone ou email" />
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" name="aniversariantes" defaultChecked={aniversariantes} className="rounded" />
            Aniversariantes do mês
          </label>
          <Button type="submit" className="bg-linear-to-r from-orange-500 to-red-500 text-white">Filtrar</Button>
        </form>
      </Card>

      {/* Lista */}
      <Card className="p-0 overflow-hidden border-2 border-orange-100">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-orange-50/80">
              <tr className="text-left">
                <th className="px-4 py-3 font-semibold text-gray-700">Nome</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Telefone</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Email</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Nascimento</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Pedidos</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.id} className="border-t hover:bg-orange-50/40">
                  <td className="px-4 py-3 font-medium">{c.nome}</td>
                  <td className="px-4 py-3">{c.telefone}</td>
                  <td className="px-4 py-3">{c.email ?? "-"}</td>
                  <td className="px-4 py-3">{
                    c.dataNascimento
                      ? (() => {
                          // Formata a data ignorando fuso: usa a porção YYYY-MM-DD do ISO
                          const [yyyy, mm, dd] = c.dataNascimento.toISOString().split('T')[0].split('-')
                          return `${dd}/${mm}/${yyyy}`
                        })()
                      : "-"
                  }</td>
                  <td className="px-4 py-3">{c._count.pedidos}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Link href={`/admin/clientes/${c.id}`} className="text-blue-600 hover:text-blue-800 transition-colors text-sm">
                        Ver
                      </Link>
                      <EditClienteDialog cliente={c} />
                      <DeleteClienteButton id={c.id} nome={c.nome} />
                    </div>
                  </td>
                </tr>
              ))}

              {clientes.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
