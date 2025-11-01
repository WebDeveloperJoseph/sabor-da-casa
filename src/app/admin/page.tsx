import { prisma } from "@/lib/prisma"
import { 
  Pizza, 
  FolderOpen, 
  Utensils, 
  TrendingUp,
  Star,
  Clock,
  ShoppingCart,
  DollarSign,
  Package
} from "lucide-react"
import Link from "next/link"
import type { ElementType } from "react"

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function AdminDashboard() {
  // Buscar estatísticas do banco
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const [
    totalPizzas,
    totalCategorias,
    totalIngredientes,
    pizzasDestaque,
    pizzasRecentes,
    totalPedidos,
    pedidosHoje,
    vendasHoje,
    pedidosPendentes,
    avaliacoes
  ] = await Promise.all([
    prisma.prato.count({ where: { ativo: true } }),
    prisma.categoria.count({ where: { ativo: true } }),
    prisma.ingrediente.count(),
    prisma.prato.findMany({
      where: { destaque: true, ativo: true },
      include: { categoria: true },
      take: 3
    }),
    prisma.prato.findMany({
      where: { ativo: true },
      include: { categoria: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    }),
    prisma.pedido.count(),
    prisma.pedido.count({
      where: {
        createdAt: { gte: hoje }
      }
    }),
    prisma.pedido.aggregate({
      _sum: { valorTotal: true },
      where: {
        createdAt: { gte: hoje },
        status: { notIn: ['cancelado'] }
      }
    }),
    prisma.pedido.count({
      where: {
        status: 'pendente'
      }
    }),
    prisma.avaliacao.aggregate({
      _avg: { estrelas: true },
      _count: true
    })
  ])

  // Aniversariantes do mês atual - busca com try/catch para suportar client ainda não regenerado
  let aniversariantesMes = 0
  try {
    const clientesComData = await (prisma as any).cliente?.findMany({
      where: { ativo: true, dataNascimento: { not: null } },
      select: { dataNascimento: true }
    })
  const mesAtual = new Date().getUTCMonth() + 1
  aniversariantesMes = clientesComData?.filter((c: any) => c.dataNascimento && (c.dataNascimento.getUTCMonth() + 1) === mesAtual).length ?? 0
  } catch (e) {
    console.warn('Modelo Cliente ainda não disponível no Prisma Client. Execute: npx prisma generate', e)
  }

  const estatisticas: Array<{titulo:string; valor:number|string; icone: ElementType; cor:string; corFundo:string; corTexto:string; href?: string}> = [
    {
      titulo: "Total de Pizzas",
      valor: totalPizzas,
      icone: Pizza,
      cor: "bg-blue-500",
      corFundo: "bg-blue-50",
      corTexto: "text-blue-700"
    },
    {
      titulo: "Categorias",
      valor: totalCategorias,
      icone: FolderOpen,
      cor: "bg-green-500",
      corFundo: "bg-green-50",
      corTexto: "text-green-700"
    },
    {
      titulo: "Ingredientes",
      valor: totalIngredientes,
      icone: Utensils,
      cor: "bg-purple-500",
      corFundo: "bg-purple-50",
      corTexto: "text-purple-700"
    },
    {
      titulo: "Avaliação Média",
      valor: avaliacoes._count > 0 
        ? `${(avaliacoes._avg.estrelas || 0).toFixed(1)} ⭐ (${avaliacoes._count})` 
        : "Sem avaliações",
      icone: Star,
      cor: "bg-yellow-500",
      corFundo: "bg-yellow-50",
      corTexto: "text-yellow-700"
    },
    {
      titulo: "Aniversariantes (mês)",
      valor: aniversariantesMes,
      icone: Star,
      cor: "bg-pink-500",
      corFundo: "bg-pink-50",
      corTexto: "text-pink-700",
      href: "/admin/clientes?aniversariantes=true"
    },
    {
      titulo: "Em Destaque",
      valor: pizzasDestaque.length,
      icone: Star,
      cor: "bg-orange-500",
      corFundo: "bg-orange-50",
      corTexto: "text-orange-700"
    }
  ]

  const estatisticasVendas = [
    {
      titulo: "Total de Pedidos",
      valor: totalPedidos,
      icone: ShoppingCart,
      cor: "text-blue-600",
      corFundo: "bg-blue-50"
    },
    {
      titulo: "Pedidos Hoje",
      valor: pedidosHoje,
      icone: Clock,
      cor: "text-green-600",
      corFundo: "bg-green-50"
    },
    {
      titulo: "Vendas Hoje",
      valor: `R$ ${Number(vendasHoje._sum.valorTotal || 0).toFixed(2).replace('.', ',')}`,
      icone: DollarSign,
      cor: "text-emerald-600",
      corFundo: "bg-emerald-50"
    },
    {
      titulo: "Pendentes",
      valor: pedidosPendentes,
      icone: Package,
      cor: "text-orange-600",
      corFundo: "bg-orange-50",
      destaque: pedidosPendentes > 0
    }
  ]

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-orange-100 p-6 shadow-sm">
        <h1 className="text-4xl font-bold bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Visão geral do seu cardápio e estatísticas
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {estatisticas.map((stat, index) => {
          const Icon: ElementType = stat.icone
          const content = (
            <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-100 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 group cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{stat.titulo}</p>
                  <p className="text-4xl font-extrabold text-gray-900 mt-3">{stat.valor}</p>
                </div>
                <div className={`w-16 h-16 ${stat.corFundo} rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-8 h-8 ${stat.cor.replace('bg-', 'text-')}`} />
                </div>
              </div>
            </div>
          )
          return stat.href ? (
            <Link key={index} href={stat.href} className="block">
              {content}
            </Link>
          ) : (
            <div key={index}>{content}</div>
          )
        })}
      </div>

      {/* Cards de Vendas */}
      <div className="bg-linear-to-br from-orange-500 to-red-500 rounded-2xl border-2 border-orange-300 p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white flex items-center">
              <ShoppingCart className="w-7 h-7 mr-3" />
              Estatísticas de Vendas
            </h3>
            <Link
              href="/admin/pedidos"
              className="px-4 py-2 bg-white text-orange-600 font-semibold rounded-lg hover:bg-orange-50 hover:shadow-lg transition-all"
            >
              Ver todos os pedidos →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {estatisticasVendas.map((stat, index) => {
              const Icon = stat.icone
              return (
                <div 
                  key={index} 
                  className={`bg-white rounded-xl shadow-lg p-5 hover:shadow-2xl hover:scale-105 transition-all duration-300 ${
                    stat.destaque ? 'ring-4 ring-yellow-300 ring-offset-2' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-12 h-12 ${stat.corFundo} rounded-xl flex items-center justify-center shadow-md`}>
                      <Icon className={`w-6 h-6 ${stat.cor}`} />
                    </div>
                    {stat.destaque && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full border border-yellow-300">
                        Atenção
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{stat.titulo}</p>
                  <p className="text-3xl font-extrabold text-gray-900 mt-2">{stat.valor}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Grid de Conteúdo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pizzas em Destaque */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-100 p-6 hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Star className="w-6 h-6 text-orange-500 mr-2 fill-orange-500" />
              Pizzas em Destaque
            </h3>
            <TrendingUp className="w-5 h-5 text-orange-400" />
          </div>
          
          <div className="space-y-3">
            {pizzasDestaque.length > 0 ? (
              pizzasDestaque.map((pizza) => (
                <div key={pizza.id} className="flex items-center justify-between p-4 bg-linear-to-r from-orange-50 to-red-50 rounded-xl border-2 border-orange-200 hover:shadow-md transition-all">
                  <div>
                    <h4 className="font-bold text-gray-900">{pizza.nome}</h4>
                    <p className="text-sm text-gray-600">{pizza.categoria.nome}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl text-orange-600">
                      R$ {pizza.preco.toString().replace('.', ',')}
                    </p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-500 text-white shadow-sm">
                      Destaque
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">
                Nenhuma pizza em destaque
              </p>
            )}
          </div>
        </div>

        {/* Pizzas Recentes */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-100 p-6 hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Clock className="w-6 h-6 text-blue-500 mr-2" />
              Adicionadas Recentemente
            </h3>
          </div>
          
          <div className="space-y-3">
            {pizzasRecentes.map((pizza) => (
              <div key={pizza.id} className="flex items-center justify-between p-4 hover:bg-orange-50 rounded-xl transition-all border border-transparent hover:border-orange-200">
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">{pizza.nome}</h4>
                  <p className="text-sm text-gray-600">{pizza.categoria.nome}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-gray-900">
                    R$ {pizza.preco.toString().replace('.', ',')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(pizza.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/pizzas/nova"
            className="flex items-center p-5 border-2 border-dashed border-orange-300 rounded-xl hover:border-orange-500 hover:bg-linear-to-br hover:from-orange-50 hover:to-red-50 hover:shadow-lg transition-all duration-300 group"
          >
            <Pizza className="w-10 h-10 text-orange-400 group-hover:text-orange-600 mr-4 transition-colors" />
            <div>
              <p className="font-bold text-gray-900">Nova Pizza</p>
              <p className="text-sm text-gray-600">Adicionar ao cardápio</p>
            </div>
          </Link>
          
          <Link
            href="/admin/categorias"
            className="flex items-center p-5 border-2 border-dashed border-green-300 rounded-xl hover:border-green-500 hover:bg-green-50 hover:shadow-lg transition-all duration-300 group"
          >
            <FolderOpen className="w-10 h-10 text-green-400 group-hover:text-green-600 mr-4 transition-colors" />
            <div>
              <p className="font-bold text-gray-900">Gerenciar Categorias</p>
              <p className="text-sm text-gray-600">Organizar seções</p>
            </div>
          </Link>
          
          <Link
            href="/admin/ingredientes"
            className="flex items-center p-5 border-2 border-dashed border-purple-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 hover:shadow-lg transition-all duration-300 group"
          >
            <Utensils className="w-10 h-10 text-purple-400 group-hover:text-purple-600 mr-4 transition-colors" />
            <div>
              <p className="font-bold text-gray-900">Ingredientes</p>
              <p className="text-sm text-gray-600">Gerenciar componentes</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}