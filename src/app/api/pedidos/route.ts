/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/supabaseServer'
import { z } from 'zod'

// Schema de validação para criar pedido
const itemPedidoSchema = z.object({
  pratoId: z.number(),
  quantidade: z.number().min(1),
  observacoes: z.string().optional(),
  tamanho: z.string().optional(), // P, M, G
  bordaId: z.number().optional(), // ID da borda recheada
  nomeBorda: z.string().optional(), // Nome da borda (snapshot)
  precoBorda: z.number().optional() // Preço adicional da borda (snapshot)
})

const criarPedidoSchema = z.object({
  nomeCliente: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  observacoes: z.string().optional(),
  itens: z.array(itemPedidoSchema).min(1, 'Pedido deve ter ao menos 1 item'),
  clienteId: z.number().int().optional()
})

// POST /api/pedidos - Criar novo pedido (PÚBLICO - não precisa autenticação)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validacao = criarPedidoSchema.safeParse(body)

    if (!validacao.success) {
      return NextResponse.json(
        { erro: 'Dados inválidos', detalhes: validacao.error.flatten() },
        { status: 400 }
      )
    }

  const { nomeCliente, telefone, endereco, observacoes, itens, clienteId } = validacao.data

    // Buscar pratos e calcular total
    const pratoIds = itens.map(item => item.pratoId)
    const pratos = await prisma.prato.findMany({
      where: { id: { in: pratoIds }, ativo: true },
      include: {
        tamanhos: { where: { ativo: true } }
      }
    })

    if (pratos.length !== pratoIds.length) {
      return NextResponse.json(
        { erro: 'Alguns pratos não foram encontrados ou estão inativos' },
        { status: 400 }
      )
    }

    // Calcular valor total considerando tamanhos e bordas
    let valorTotal = 0
    const itensParaCriar = itens.map(item => {
      const prato = pratos.find(p => p.id === item.pratoId)
      if (!prato) throw new Error('Prato não encontrado')

      // Se tem tamanho especificado, buscar preço correspondente
      let precoUnit = Number(prato.preco)
      if (item.tamanho && prato.tamanhos.length > 0) {
        const tamanhoEncontrado = prato.tamanhos.find(t => t.tamanho === item.tamanho)
        if (tamanhoEncontrado) {
          precoUnit = Number(tamanhoEncontrado.preco)
        }
      }

      // Adicionar preço da borda (se houver)
      const precoBorda = item.precoBorda ? Number(item.precoBorda) : 0
      const precoTotalItem = precoUnit + precoBorda

      const subtotal = precoTotalItem * item.quantidade
      valorTotal += subtotal

      return {
        pratoId: item.pratoId,
        nomePrato: prato.nome,
        quantidade: item.quantidade,
        precoUnit: precoUnit,
        subtotal: subtotal,
        observacoes: item.observacoes,
        tamanho: item.tamanho,
        bordaId: item.bordaId,
        nomeBorda: item.nomeBorda,
        precoBorda: precoBorda
      }
    })

    // Criar pedido com itens e atribuir dailyNumber de forma atômica
    // Usamos o timezone 'America/Recife' para calcular a chave do dia (YYYY-MM-DD)
    const dateKey = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Recife' }) // formato 2025-10-31

    let pedido
    try {
      pedido = await prisma.$transaction(async (tx) => {
        // Incrementa o contador diário de forma atômica (INSERT ON CONFLICT DO UPDATE)
        const counterRows = await tx.$queryRaw`
          INSERT INTO "daily_order_counters"("date", "last") VALUES (${dateKey}, 1)
          ON CONFLICT ("date") DO UPDATE SET "last" = "daily_order_counters"."last" + 1
          RETURNING last
        `

    // counterRows pode variar de formato; extrair o last
    const counter = (counterRows as unknown as Array<{ last?: number }>)?.[0]
    const last = counter?.last ?? 1

        // Construir objeto de criação (tipagem será ajustada após gerar Prisma Client)
        const data: any = {
          nomeCliente,
          telefone,
          endereco,
          observacoes,
          valorTotal,
          status: 'pendente',
          dailyNumber: Number(last),
          itens: {
            create: itensParaCriar
          }
        }

        if (typeof clienteId === 'number') {
          data.clienteId = clienteId
        }

        const created = await tx.pedido.create({
          data,
          include: {
            itens: {
              include: {
                prato: true
              }
            }
          }
        })

        return created
      })
    } catch (e) {
      // Se a tabela de contadores diários não existir (migration ainda não aplicada),
      // fazemos um fallback e criamos o pedido sem `dailyNumber` para não bloquear vendas.
      console.error('Erro ao gerar dailyNumber, fallback sem dailyNumber:', e)

      // Criar pedido simples sem dailyNumber
      const fallbackData: any = {
          nomeCliente,
          telefone,
          endereco,
          observacoes,
          valorTotal,
          status: 'pendente',
          itens: {
            create: itensParaCriar
          }
        }
      if (typeof clienteId === 'number') {
        fallbackData.clienteId = clienteId
      }

      pedido = await prisma.pedido.create({
        data: fallbackData,
        include: {
          itens: {
            include: {
              prato: true
            }
          }
        }
      })
    }

    // Retornar apenas os campos necessários ao cliente para evitar
    // problemas de serialização de tipos (Decimal, etc.) em alguns ambientes.
    const responseBody = { id: pedido.id, dailyNumber: (pedido as unknown as { dailyNumber?: number }).dailyNumber ?? null }
    // Logar para depuração: confirmar que o pedido foi criado e qual id foi gerado
    // Log simples para depuração (remova em produção)
    console.log('Pedido criado com sucesso:', responseBody)

    return NextResponse.json(responseBody, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar pedido:', error)
    return NextResponse.json(
      { erro: 'Erro ao criar pedido' },
      { status: 500 }
    )
  }
}

// GET /api/pedidos - Listar pedidos (ADMIN ou por telefone público)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limite = Number(searchParams.get('limite')) || 50
    const telefone = searchParams.get('telefone')

    // Se tiver telefone, é busca pública (cliente buscando seus pedidos)
    if (telefone) {
      const pedidos = await prisma.pedido.findMany({
        where: { telefone },
        include: {
          itens: true,
          avaliacao: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 20 // limitar a 20 pedidos mais recentes
      })

      return NextResponse.json(pedidos)
    }

    // Caso contrário, requer autenticação (admin)
    await requireUser()

    const pedidos = await prisma.pedido.findMany({
      where: status ? { status } : undefined,
      include: {
        itens: {
          include: {
            prato: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limite
    })

    return NextResponse.json(pedidos)
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error)
    
    if (error instanceof Error && error.message === 'Não autorizado') {
      return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
    }

    return NextResponse.json(
      { erro: 'Erro ao buscar pedidos' },
      { status: 500 }
    )
  }
}
