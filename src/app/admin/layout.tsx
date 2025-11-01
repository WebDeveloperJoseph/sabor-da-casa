export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

import Link from "next/link"
import Image from "next/image"
import { 
  LayoutDashboard, 
  Pizza, 
  FolderOpen, 
  Utensils, 
  Settings,
  ArrowLeft,
  User,
  ShoppingCart
} from "lucide-react"
import { BotaoSair } from "@/components/admin/BotaoSair"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const menuItems = [
    {
      href: "/admin",
      icon: LayoutDashboard,
      label: "Dashboard",
      description: "Visão geral"
    },
    {
      href: "/admin/pedidos",
      icon: ShoppingCart,
      label: "Pedidos",
      description: "Controle de vendas"
    },
    {
      href: "/admin/clientes",
      icon: User,
      label: "Clientes",
      description: "Cadastro e histórico"
    },
    {
      href: "/admin/pizzas",
      icon: Pizza,
      label: "Pizzas",
      description: "Gerenciar cardápio"
    },
    {
      href: "/admin/categorias",
      icon: FolderOpen,
      label: "Categorias",
      description: "Organizar seções"
    },
    {
      href: "/admin/ingredientes",
      icon: Utensils,
      label: "Ingredientes",
      description: "Componentes das pizzas"
    },
    {
      href: "/admin/configuracoes",
      icon: Settings,
      label: "Configurações",
      description: "Ajustes gerais"
    }
  ]

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-gray-50 to-red-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-72 bg-linear-to-br from-white to-orange-50/30 shadow-xl border-r border-orange-100 z-30 backdrop-blur-sm">
        {/* Header da Sidebar */}
        <div className="flex items-center justify-center h-28 px-6 border-b border-orange-200 bg-linear-to-br from-orange-500 to-red-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-white p-2 flex items-center justify-center shadow-2xl ring-4 ring-white/50 overflow-hidden transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
              <Image
                src="/img/logoSaborDaCasa.jpg"
                alt="Sabor da Casa"
                width={88}
                height={88}
                className="object-contain rounded-full"
                priority
              />
            </div>
          </div>
        </div>

        {/* Navegação */}
        <nav className="mt-6 px-3 pb-24 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center px-4 py-3.5 text-sm font-medium rounded-xl text-gray-700 hover:bg-linear-to-r hover:from-orange-500 hover:to-red-500 hover:text-white hover:shadow-lg transition-all duration-200 group"
                >
                  <Icon className="w-5 h-5 mr-3 text-gray-500 group-hover:text-white transition-colors" />
                  <div className="flex-1">
                    <div className="font-semibold">{item.label}</div>
                    <div className="text-xs text-gray-500 group-hover:text-orange-100">
                      {item.description}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Voltar para site */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-white to-transparent border-t border-orange-100">
          <Link
            href="/"
            className="flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg bg-white text-orange-600 hover:bg-orange-50 border border-orange-200 hover:border-orange-300 transition-all shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Ver Site Público
          </Link>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="ml-72">
        {/* Header Principal */}
        <header className="bg-white/80 backdrop-blur-md shadow-md border-b border-orange-100 h-16 sticky top-0 z-20">
          <div className="flex items-center justify-between h-full px-6">
            <div>
              <h2 className="text-xl font-bold bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Painel Administrativo
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-orange-50 rounded-full border border-orange-200">
                <User className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-700">Administrador</span>
              </div>
              <BotaoSair />
            </div>
          </div>
        </header>

        {/* Área de Conteúdo */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}