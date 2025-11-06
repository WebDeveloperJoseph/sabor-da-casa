'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Pizza, 
  FolderOpen, 
  Utensils, 
  User,
  ShoppingCart,
  Cookie
} from "lucide-react"

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
    href: "/admin/bordas",
    icon: Cookie,
    label: "Bordas",
    description: "Bordas recheadas"
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
  }
]

export function AdminNav() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin"
    }
    return pathname?.startsWith(href)
  }

  return (
    <nav className="mt-6 px-3 pb-24 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
      <div className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-center md:justify-start px-2 md:px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 group ${
                active 
                  ? 'bg-linear-to-r from-orange-500 to-red-500 text-white shadow-lg' 
                  : 'text-gray-700 hover:bg-linear-to-r hover:from-orange-500 hover:to-red-500 hover:text-white hover:shadow-lg'
              }`}
              title={item.label}
            >
              <Icon className={`w-5 h-5 md:mr-3 transition-colors shrink-0 ${
                active ? 'text-white' : 'text-gray-500 group-hover:text-white'
              }`} />
              <div className="hidden md:flex md:flex-1 md:flex-col">
                <div className="font-semibold">{item.label}</div>
                <div className={`text-xs transition-colors ${
                  active ? 'text-orange-100' : 'text-gray-500 group-hover:text-orange-100'
                }`}>
                  {item.description}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
