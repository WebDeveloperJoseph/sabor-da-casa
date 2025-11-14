// Otimizado para cache inteligente
export const revalidate = 300 // 5 minutos

import { prisma } from "@/lib/prisma"
import Image from "next/image"
import { CartProvider } from "@/components/public/CartProvider"
import { PratoCard } from "@/components/public/PratoCard"
import { LazyCartDialog } from "@/components/public/LazyCartDialog"
import { HeroSection } from "@/components/public/HeroSection"
import { MonteSuaPizzaButton } from "@/components/public/MonteSuaPizzaButton"
// Tipos auxiliares para evitar uso de `any` e padronizar o shape usado aqui
type IngredienteTag = { ingrediente: { id: number; nome: string; alergenico: boolean } }
type PrecoLike = number | string
type TamanhoType = { tamanho: string; preco: number }
type PratoWithIngred = {
  id: number
  nome: string
  descricao: string | null
  preco: PrecoLike
  imagem: string | null
  ativo: boolean
  destaque: boolean
  ingredientes: IngredienteTag[]
  tamanhos?: TamanhoType[]
  rating?: { avg: number; count: number }
}
type CategoriaWithPratos = {
  id: number
  nome: string
  descricao: string | null
  pratos: PratoWithIngred[]
}

export default async function Home() {
  // Esta função roda no SERVIDOR! 🚀
  // Evita falha de build em ambientes sem DB acessível (ex: Vercel com env incorreto)
  let categorias: CategoriaWithPratos[] = []
  let settings = {
    aceitarPedidos: true,
    pedidoMinimo: 0,
    taxaEntrega: 0,
  }

  try {
    const categoriasRaw = await prisma.categoria.findMany({
      where: { ativo: true },
      include: {
        pratos: {
          where: { ativo: true },
          include: {
            ingredientes: {
              include: {
                ingrediente: true
              }
            },
            tamanhos: {
              where: { ativo: true },
              orderBy: { tamanho: 'asc' }
            }
          }
        }
      },
      orderBy: { ordem: 'asc' }
    })
    
    // Converter Decimal para number nos tamanhos e montar estrutura tipada
    categorias = categoriasRaw.map(cat => ({
      id: cat.id,
      nome: cat.nome,
      descricao: cat.descricao,
      pratos: cat.pratos.map(p => ({
        id: p.id,
        nome: p.nome,
        descricao: p.descricao,
        preco: Number(p.preco),
        imagem: p.imagem,
        ativo: p.ativo,
        destaque: p.destaque,
        ingredientes: p.ingredientes,
        tamanhos: p.tamanhos.map(t => ({ tamanho: t.tamanho, preco: Number(t.preco) }))
      }))
    }))

    const cfg = await prisma.configuracao.findFirst()
    settings = {
      aceitarPedidos: cfg?.aceitarPedidos ?? true,
      pedidoMinimo: Number(cfg?.pedidoMinimo ?? 0),
      taxaEntrega: Number(cfg?.taxaEntrega ?? 0),
    }

    // Agregar avaliações por prato: média de estrelas e contagem
    // Considera as avaliações por pedido e relaciona pelos itens do pedido
    // Retorna { pratoId, avg, count }
    const agregados: Array<{ pratoId: number; avg: number; count: number }> = await prisma.$queryRaw`
      SELECT ip.prato_id as "pratoId",
             AVG(a.estrelas)::float as "avg",
             COUNT(a.id)::int as "count"
      FROM avaliacoes a
      JOIN pedidos p ON p.id = a.pedido_id
      JOIN itens_pedido ip ON ip.pedido_id = p.id
      GROUP BY ip.prato_id
    `
    // Monta um mapa para lookup rápido no render
    const byPrato: Record<number, { avg: number; count: number }> = {}
    agregados.forEach(r => { byPrato[r.pratoId] = { avg: r.avg, count: r.count } })
    // Anexa no objeto categoria->prato para facilitar o uso na UI
    categorias = categorias.map(cat => ({
      ...cat,
      pratos: cat.pratos.map((p: PratoWithIngred) => ({ ...p, rating: byPrato[p.id] || { avg: 0, count: 0 } }))
    }))
  } catch (err) {
    console.error('[Home] Falha ao carregar dados do banco. Verifique DATABASE_URL/DIRECT_URL.', err)
  }

  // Horário de funcionamento (São Paulo) com faixas por dia
  const now = new Date()
  const parts = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now)
  const weekdayShort = (parts.find(p => p.type === 'weekday')?.value || '').toLowerCase()
  const hourStr = parts.find(p => p.type === 'hour')?.value || '00'
  const minuteStr = parts.find(p => p.type === 'minute')?.value || '00'
  const minutesNow = parseInt(hourStr) * 60 + parseInt(minuteStr)

  const isSegQuaQuiSex = ['seg', 'qua', 'qui', 'sex'].some(k => weekdayShort.includes(k))
  const isSabDom = ['sáb', 'sab', 'dom'].some(k => weekdayShort.includes(k))

  // Terça ("ter") não está na lista nova => consideramos fechado
  let openStart = -1
  let openEnd = -1
  if (isSegQuaQuiSex) {
    openStart = 18 * 60 // 18:00
    openEnd = 22 * 60 + 30 // 22:30
  } else if (isSabDom) {
    openStart = 17 * 60 // 17:00
    openEnd = 23 * 60 // 23:00
  }
  const isOpenNow = openStart >= 0 && minutesNow >= openStart && minutesNow <= openEnd

  return (
    <CartProvider settings={settings}>
      <div className="min-h-screen bg-white">
        {/* Hero Section Modernizada */}
        <HeroSection isOpenNow={isOpenNow} />

        <div className="container mx-auto px-4 py-8">

        {/* Aviso pedidos pausados */}
        {!settings.aceitarPedidos && (
          <div className="mb-8 rounded-2xl border-2 border-orange-300 bg-linear-to-r from-orange-50 to-red-50 p-6 text-center shadow-lg">
            <p className="text-lg font-bold text-orange-900">
            Estamos temporariamente pausando novos pedidos. Volte em breve! 🕒
            </p>
          </div>
        )}

        {/* Botão Monte sua Pizza */}
        {categorias.some(c => c.nome.toLowerCase().includes('tradiciona')) && (
          <div className="mb-12 flex justify-center">
            <MonteSuaPizzaButton 
              pizzas={
                categorias
                  .find(c => c.nome.toLowerCase().includes('tradiciona'))
                  ?.pratos
                  .filter(p => p.tamanhos && p.tamanhos.length > 0)
                  .map(p => ({
                    id: p.id,
                    nome: p.nome,
                    preco: Number(p.preco),
                    descricao: p.descricao,
                    imagem: p.imagem,
                    tamanhos: p.tamanhos!.map(t => ({
                      id: 0, // Não precisamos do ID real aqui
                      pratoId: p.id,
                      tamanho: t.tamanho,
                      preco: t.preco
                    }))
                  })) || []
              }
            />
          </div>
        )}

        {/* Cardápio por categorias */}
  <div id="cardapio" className="space-y-16 scroll-mt-24">
          {categorias.map((categoria) => (
            <section key={categoria.id} className="relative bg-linear-to-br from-white to-orange-50/30 rounded-3xl shadow-xl p-8 md:p-10 border-2 border-orange-100 overflow-hidden">
              {/* Elemento decorativo de fundo */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-orange-200/20 to-red-200/20 rounded-full blur-3xl z-0"></div>
              
              <h2 className="relative text-4xl font-bold bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-3 text-center md:text-left">
                {categoria.nome}
              </h2>
              <p className="relative text-gray-700 text-lg mb-8 text-center md:text-left">{categoria.descricao}</p>
              
              <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categoria.pratos.map((prato: PratoWithIngred) => (
                  <PratoCard 
                    key={prato.id}
                    prato={prato}
                    categoria={categoria}
                  />
                ))}
              </div>
              
              {categoria.pratos.length === 0 && (
                <p className="text-gray-500 text-center py-12 text-lg">
                  Nenhum item nesta categoria ainda.
                </p>
              )}
            </section>
          ))}
          {categorias.length === 0 && (
            <div className="text-center py-12 rounded-2xl border-2 border-orange-200 bg-orange-50">
              <p className="text-orange-800 font-semibold">
                Cardápio indisponível no momento. Tente novamente em instantes.
              </p>
              <p className="text-orange-700 text-sm mt-2">
                Dica: verifique as variáveis de ambiente de banco em produção (DATABASE_URL com host pooler.supabase.com:6543).
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="relative mt-24 py-12 bg-linear-to-br from-orange-50 to-red-50 rounded-3xl border-2 border-orange-100">
          <div className="text-center space-y-6">
            {/* Redes Sociais com ícones */}
            <div className="flex justify-center gap-6">
              <a 
                href="https://wa.me/5583996444542" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group flex items-center gap-2 px-6 py-3 bg-white rounded-full border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all duration-300 transform hover:scale-110"
              >
                <svg className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-green-700 transition-colors duration-300">WhatsApp</span>
              </a>
              
              <a 
                href="https://instagram.com/pizzaria.sabordacasa_" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group flex items-center gap-2 px-6 py-3 bg-white rounded-full border-2 border-pink-200 hover:border-pink-400 hover:shadow-lg transition-all duration-300 transform hover:scale-110"
              >
                <svg className="w-5 h-5 text-pink-600 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-pink-700 transition-colors duration-300">Instagram</span>
              </a>
            </div>
            
            <p className="text-gray-700 font-medium">Sistema de Cardápio Digital</p>
            <p className="text-gray-500 text-sm">Desenvolvido com ❤️ e muito sabor</p>
            <a 
              href="https://instagram.com/Web_Developer_Ze" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-all duration-300 group"
            >
              <Image 
                src="/img/logoDev/logo1.png" 
                alt="Web Developer Ze" 
                width={32}
                height={32}
                className="rounded-full border-2 border-gray-300 group-hover:border-orange-500 transition-all duration-300 group-hover:scale-110"
              />
              <span className="text-sm font-medium">@Web_Developer_Ze</span>
            </a>
          </div>
        </footer>
      </div>
      <LazyCartDialog />
    </div>
    </CartProvider>
  )
}
