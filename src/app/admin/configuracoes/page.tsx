import { prisma } from '@/lib/prisma'
import { ConfiguracoesForm } from '@/components/admin/ConfiguracoesForm'
import { Settings } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ConfiguracoesPage() {
  // Garante que existe um registro
  let cfg = await prisma.configuracao.findFirst()
  if (!cfg) {
    cfg = await prisma.configuracao.create({
      data: {
        nomePizzaria: 'Sabor da Casa',
        aceitarPedidos: true,
        taxaEntrega: 0,
        pedidoMinimo: 0,
        tempoPreparoMinutos: 30,
        raioEntregaKm: 5,
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-orange-100 p-6 shadow-sm">
        <h1 className="text-4xl font-bold bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent flex items-center">
          <Settings className="w-10 h-10 mr-4 text-orange-600" />
          Configurações
        </h1>
        <p className="text-gray-600 mt-2">Ajustes gerais do sistema (apenas para o dono).</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border-2 border-orange-100 p-8">
        <ConfiguracoesForm initial={{
          nomePizzaria: cfg.nomePizzaria,
          telefone: cfg.telefone,
          endereco: cfg.endereco,
          cnpj: cfg.cnpj,
          email: cfg.email,
          taxaEntrega: Number(cfg.taxaEntrega),
          pedidoMinimo: Number(cfg.pedidoMinimo),
          tempoPreparoMinutos: cfg.tempoPreparoMinutos,
          raioEntregaKm: cfg.raioEntregaKm,
          aceitarPedidos: cfg.aceitarPedidos,
          mensagemBoasVindas: cfg.mensagemBoasVindas ?? ''
        }} />
      </div>
    </div>
  )
}
