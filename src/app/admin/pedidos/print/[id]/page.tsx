import { prisma } from '@/lib/prisma'
import PrintActionsClient from '@/components/admin/PrintActionsClient'

type Props = {
  params: { id: string }
  searchParams?: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata({ params, searchParams }: Props) {
  const rawId = params?.id ?? (Array.isArray(searchParams?.id) ? searchParams!.id[0] : searchParams?.id)
  const id = rawId ? Number(rawId) : NaN

  if (!rawId || Number.isNaN(id)) {
    return { title: 'Comprovante - Pedido', robots: { index: false } }
  }

  const pedido = await prisma.pedido.findUnique({ where: { id } })
  if (!pedido) return { title: 'Comprovante - Pedido', robots: { index: false } }

  return { title: `Comprovante - Pedido #${pedido.id}`, robots: { index: false } }
}

export default async function PrintPedidoPage({ params, searchParams }: Props) {
  // Em Next.js 16 params e searchParams podem ser Promises dependendo do runtime.
  // Para ser robusto, aguardamos ambos antes de acessar as propriedades.
  const resolvedParams = (await params) as { id?: string } | undefined
  const resolvedSearch = (await searchParams) as { [key: string]: string | string[] | undefined } | undefined

  const rawId = resolvedParams?.id ?? (Array.isArray(resolvedSearch?.id) ? resolvedSearch!.id[0] : resolvedSearch?.id)
  const id = rawId ? Number(rawId) : NaN

  if (!rawId || Number.isNaN(id)) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">ID de pedido inválido</h1>
        <p className="mt-2 text-sm text-gray-600">O ID do pedido não foi informado ou é inválido.</p>
      </div>
    )
  }

  const pedido = await prisma.pedido.findUnique({
    where: { id },
    include: {
      itens: true
    }
  })

  if (!pedido) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Pedido não encontrado</h1>
        <p className="mt-2 text-sm text-gray-600">Verifique o ID do pedido e tente novamente.</p>
      </div>
    )
  }

  const dailyNumber = (pedido as unknown as { dailyNumber?: number }).dailyNumber

  const printAuto = String(resolvedSearch?.print || '') === '1'

  return (
    <div className="p-6">
      <div className="max-w-xl mx-auto printable">
          <header className="flex items-center justify-between mb-6">
            <div>
              <div className="logo text-2xl">Sabor da Casa</div>
              <div className="text-sm text-gray-600">Comprovante do pedido</div>
            </div>
            <div className="text-right text-sm text-gray-600">
              <div>Data: {new Date(pedido.createdAt).toLocaleString('pt-BR')}</div>
              <div>{dailyNumber ? `Hoje: #${dailyNumber}` : ''}</div>
            </div>
          </header>

          <section className="mb-4">
            <p><strong>Cliente:</strong> {pedido.nomeCliente}</p>
            {pedido.telefone && <p><strong>Telefone:</strong> {pedido.telefone}</p>}
            {pedido.endereco && <p><strong>Endereço:</strong> {pedido.endereco}</p>}
          </section>

          <div className="w-full items text-sm">
            {pedido.itens.map((it) => (
              <div key={it.id} className="item-row flex justify-between items-start py-1 border-b border-dashed">
                <div className="flex-1 pr-2">
                  <div className="font-medium">{it.quantidade}x {it.nomePrato}</div>
                  {it.observacoes && <div className="text-xs text-gray-600 mt-0.5">{it.observacoes}</div>}
                </div>
                <div className="ml-2 text-right min-w-12">R$ {Number(it.subtotal).toFixed(2).replace('.', ',')}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-right text-base font-semibold">Total: R$ {Number(pedido.valorTotal).toFixed(2).replace('.', ',')}</div>

          {pedido.observacoes && (
            <div className="mt-4 p-3 bg-gray-50 border rounded">
              <strong>Observações:</strong>
              <div className="text-sm text-gray-700 mt-1">{pedido.observacoes}</div>
            </div>
          )}

          {/* ações de impressão: componente cliente para permitir event handlers */}
          <PrintActionsClient printAuto={printAuto} />
        </div>

      <style>{`
        /* Print helpers: narrow receipt for 55mm thermal paper */
        @page { size: 55mm 210mm; margin: 2mm }

        @media print {
          * { visibility: hidden !important; }
          .printable, .printable * { visibility: visible !important; }
          .printable { position: absolute; left: 0; top: 0; width: 55mm; max-width: 55mm; }
          .no-print { display: none !important; }
          .item-row { padding-top: 2px; padding-bottom: 2px; }
        }

        /* Screen preview styling - center a narrow receipt box */
        .printable { width: 320px; max-width: 90vw; margin: 0 auto; }
        .printable { font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color: #111827 }
        .printable .logo { font-weight: 700; color: #f97316; font-size: 14px }
        .item-row { border-color: rgba(0,0,0,0.08) }
      `}</style>
    </div>
  )
}
