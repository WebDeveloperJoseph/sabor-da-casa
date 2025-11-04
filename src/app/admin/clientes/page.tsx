import Link from "next/link"
import { prisma } from "@/lib/prisma"
import type { Cliente } from "@/generated/prisma"
type ClienteWithCount = Cliente & { _count: { pedidos: number } }
type FidelidadeCfg = {
  ativo: boolean
  meta: number
  descricao?: string | null
  categoriaNome?: string | null
  porPedido: boolean
  expiraDias?: number | null
}
type CfgPartial = {
  fidelidadeAtivo?: boolean
  fidelidadeMeta?: number
  fidelidadeDescricao?: string | null
  fidelidadeCategoriaNome?: string | null
  fidelidadePorPedido?: boolean
  fidelidadeExpiraDias?: number | null
} | null
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import EditClienteDialog from "@/components/admin/EditClienteDialog"
import DeleteClienteButton from "@/components/admin/DeleteClienteButton"

export default async function ClientesPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const busca = (params?.busca as string) || ""
  const aniversariantes = (params?.aniversariantes as string) === "true"

  // Base query
  let clientes: ClienteWithCount[] = []
  let erroPrisma: string | null = null
  let fidelidade: FidelidadeCfg = { ativo: false, meta: 10, porPedido: true }
  const countsByCliente: Record<number, number> = {}
  try {
    clientes = await prisma.cliente.findMany({
      where: { ativo: true },
      include: {
        _count: { select: { pedidos: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    })

    // Carrega configuração do cartão fidelidade (com defaults seguros)
    const cfg = await prisma.configuracao.findFirst() as CfgPartial
    fidelidade = {
      ativo: cfg?.fidelidadeAtivo ?? false,
      meta: cfg?.fidelidadeMeta ?? 10,
      descricao: cfg?.fidelidadeDescricao ?? null,
      categoriaNome: cfg?.fidelidadeCategoriaNome ?? 'Pizzas',
      porPedido: cfg?.fidelidadePorPedido ?? true,
      expiraDias: cfg?.fidelidadeExpiraDias ?? null,
    }

    // Agrega quantidade de compras qualificadas por cliente (somente se ativo)
    if (fidelidade.ativo && clientes.length > 0) {
      const ids = clientes.map(c => c.id)
      const threshold = fidelidade.expiraDias && Number.isFinite(fidelidade.expiraDias)
        ? new Date(Date.now() - (fidelidade.expiraDias as number) * 24 * 60 * 60 * 1000)
        : null

      if (fidelidade.porPedido) {
        // Conta pedidos distintos que tenham ao menos uma pizza na categoria configurada
        const rows: Array<{ clienteId: number; qtd: number }> = await prisma.$queryRaw`
          SELECT p.cliente_id as "clienteId",
                 COUNT(DISTINCT p.id)::int as qtd
          FROM pedidos p
          JOIN itens_pedido ip ON ip.pedido_id = p.id
          JOIN pratos pr ON pr.id = ip.prato_id
          JOIN categorias c ON c.id = pr.categoria_id
          WHERE p.cliente_id = ANY(${ids})
            AND p.status = 'entregue'
            AND (${fidelidade.categoriaNome} IS NULL OR c.nome = ${fidelidade.categoriaNome})
            AND (${threshold} IS NULL OR p.created_at >= ${threshold})
          GROUP BY p.cliente_id
        `
        rows.forEach(r => { countsByCliente[r.clienteId] = r.qtd })
      } else {
        // Conta itens (cada pizza conta 1)
        const rows: Array<{ clienteId: number; qtd: number }> = await prisma.$queryRaw`
          SELECT p.cliente_id as "clienteId",
                 COUNT(*)::int as qtd
          FROM pedidos p
          JOIN itens_pedido ip ON ip.pedido_id = p.id
          JOIN pratos pr ON pr.id = ip.prato_id
          JOIN categorias c ON c.id = pr.categoria_id
          WHERE p.cliente_id = ANY(${ids})
            AND p.status = 'entregue'
            AND (${fidelidade.categoriaNome} IS NULL OR c.nome = ${fidelidade.categoriaNome})
            AND (${threshold} IS NULL OR p.created_at >= ${threshold})
          GROUP BY p.cliente_id
        `
        rows.forEach(r => { countsByCliente[r.clienteId] = r.qtd })
      }
    }
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
    <div className="space-y-4 md:space-y-6">
      {erroPrisma && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-800 p-3 text-sm">
          {erroPrisma}
        </div>
      )}
      {/* Cabeçalho responsivo */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl sm:text-2xl font-bold bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          Clientes
        </h1>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <Link 
            href="/admin/clientes/aniversariantes" 
            className="text-xs sm:text-sm px-3 py-2 sm:px-4 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors text-center"
          >
            🎂 Aniversariantes Hoje
          </Link>
          <Link 
            href="/admin/pedidos" 
            className="text-xs sm:text-sm px-3 py-2 sm:px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-orange-600 rounded-lg font-medium transition-colors text-center"
          >
            Ver pedidos
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <Card className="p-3 sm:p-4 border-2 border-orange-100">
        <form className="flex flex-col gap-3 items-stretch">
          <div className="w-full">
            <Input 
              name="busca" 
              defaultValue={busca} 
              placeholder="Buscar cliente..." 
              className="text-sm"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <label className="inline-flex items-center gap-2 text-xs sm:text-sm text-gray-700">
              <input type="checkbox" name="aniversariantes" defaultChecked={aniversariantes} className="rounded" />
              Aniversariantes do mês
            </label>
            <Button type="submit" className="bg-linear-to-r from-orange-500 to-red-500 text-white text-sm py-2">
              Filtrar
            </Button>
          </div>
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
                <th className="px-4 py-3 font-semibold text-gray-700">Fidelidade</th>
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
                          // Formata a data usando getUTCDate/Month/FullYear para evitar bug de timezone
                          const d = c.dataNascimento
                          const dd = String(d.getUTCDate()).padStart(2, '0')
                          const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
                          const yyyy = d.getUTCFullYear()
                          return `${dd}/${mm}/${yyyy}`
                        })()
                      : "-"
                  }</td>
                  <td className="px-4 py-3">{c._count.pedidos}</td>
                  <td className="px-4 py-3">
                    {fidelidade.ativo ? (
                      (() => {
                        const qtd = countsByCliente[c.id] ?? 0
                        const meta = Math.max(1, fidelidade.meta || 10)
                        const atual = qtd % meta
                        const percent = Math.min(100, Math.round((atual / meta) * 100))
                        const ciclos = Math.floor(qtd / meta)
                        return (
                          <div className="min-w-[180px]">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                              <span>{fidelidade.categoriaNome ?? 'Pizzas'}</span>
                              <span>{atual}/{meta}{ciclos > 0 ? ` (+${ciclos})` : ''}</span>
                            </div>
                            <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                              <div className="h-full bg-linear-to-r from-orange-500 to-red-500" style={{ width: `${percent}%` }} />
                            </div>
                          </div>
                        )
                      })()
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </td>
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
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
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
