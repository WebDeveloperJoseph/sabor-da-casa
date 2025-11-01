import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Card } from "@/components/ui/card"

export default async function ClienteDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const clienteId = parseInt(id)

  const cliente = await prisma.cliente.findUnique({
    where: { id: clienteId },
    include: {
      _count: { select: { pedidos: true } },
      pedidos: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          itens: { include: { prato: true } },
        },
      },
    },
  })

  if (!cliente) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Cliente não encontrado</h1>
        <Link href="/admin/clientes" className="text-orange-600 hover:underline">Voltar</Link>
      </div>
    )
  }

  const totalGasto = cliente.pedidos.reduce((sum, p) => sum + Number(p.valorTotal), 0)
  const ticketMedio = cliente.pedidos.length > 0 ? totalGasto / cliente.pedidos.length : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            {cliente.nome}
          </h1>
          <p className="text-gray-600">{cliente.telefone} • {cliente.email ?? "sem email"}</p>
        </div>
        <Link href="/admin/clientes" className="text-sm text-gray-600 hover:text-orange-600">Voltar</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-2 border-orange-100">
          <div className="text-sm text-gray-500">Pedidos</div>
          <div className="text-2xl font-bold">{cliente._count.pedidos}</div>
        </Card>
        <Card className="p-4 border-2 border-orange-100">
          <div className="text-sm text-gray-500">Total gasto</div>
          <div className="text-2xl font-bold">R$ {totalGasto.toFixed(2).replace('.', ',')}</div>
        </Card>
        <Card className="p-4 border-2 border-orange-100">
          <div className="text-sm text-gray-500">Ticket médio</div>
          <div className="text-2xl font-bold">R$ {ticketMedio.toFixed(2).replace('.', ',')}</div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden border-2 border-orange-100">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-orange-50/80">
              <tr className="text-left">
                <th className="px-4 py-3 font-semibold text-gray-700">Data</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Pedido</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Itens</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Total</th>
              </tr>
            </thead>
            <tbody>
              {cliente.pedidos.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-4 py-3">{new Date(p.createdAt).toLocaleString("pt-BR")}</td>
                  <td className="px-4 py-3">#{p.id}</td>
                  <td className="px-4 py-3">{p.itens.map(i => i.nomePrato).join(", ")}</td>
                  <td className="px-4 py-3 font-medium">R$ {Number(p.valorTotal).toFixed(2).replace('.', ',')}</td>
                </tr>
              ))}

              {cliente.pedidos.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">Nenhum pedido ainda.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
