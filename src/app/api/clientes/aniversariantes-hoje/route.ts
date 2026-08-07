/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/clientes/aniversariantes-hoje - Busca aniversariantes do dia (admin)
export async function GET() {
  try {
    const { authenticated } = await requireAuth()
    if (!authenticated) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

  const hoje = new Date()
  const dia = hoje.getUTCDate()
  const mes = hoje.getUTCMonth() + 1

    // Buscar todos os clientes ativos com data de nascimento
    let clientes: any[] = []
    try {
      clientes = await (prisma as any).cliente?.findMany({
        where: { 
          ativo: true, 
          dataNascimento: { not: null },
          aceitaWhatsApp: true // Apenas quem aceitou receber mensagens
        },
        select: {
          id: true,
          nome: true,
          telefone: true,
          dataNascimento: true,
          aceitaPromocoes: true
        }
      }) || []
    } catch {
      return NextResponse.json({ 
        erro: 'Modelo Cliente não disponível. Execute: npx prisma generate' 
      }, { status: 503 })
    }

    // Filtrar aniversariantes do dia
    const aniversariantesHoje = clientes.filter((c: any) => {
      if (!c.dataNascimento) return false
      const nascimento = new Date(c.dataNascimento)
      return nascimento.getUTCDate() === dia && (nascimento.getUTCMonth() + 1) === mes
    })

    return NextResponse.json({ 
      total: aniversariantesHoje.length,
      aniversariantes: aniversariantesHoje 
    })
  } catch (error) {
    console.error('[API Aniversariantes Hoje] Erro:', error)
    
    if (error instanceof Error && error.message === 'Não autorizado') {
      return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
    }

    return NextResponse.json({ erro: 'Erro ao buscar aniversariantes' }, { status: 500 })
  }
}

// POST /api/clientes/aniversariantes-hoje - Envia mensagens de parabéns (admin)
export async function POST(request: NextRequest) {
  try {
    const { authenticated } = await requireAuth()
    if (!authenticated) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

    const body = await request.json()
    const { mensagemTemplate, cupom } = body

  const hoje = new Date()
  const dia = hoje.getUTCDate()
  const mes = hoje.getUTCMonth() + 1

    // Buscar aniversariantes
    let clientes: any[] = []
    try {
      clientes = await (prisma as any).cliente?.findMany({
        where: { 
          ativo: true, 
          dataNascimento: { not: null },
          aceitaWhatsApp: true,
          aceitaPromocoes: true // Apenas quem aceitou promoções
        },
        select: {
          id: true,
          nome: true,
          telefone: true,
          dataNascimento: true
        }
      }) || []
    } catch {
      return NextResponse.json({ 
        erro: 'Modelo Cliente não disponível. Execute: npx prisma generate' 
      }, { status: 503 })
    }

    const aniversariantesHoje = clientes.filter((c: any) => {
      if (!c.dataNascimento) return false
      const nascimento = new Date(c.dataNascimento)
      return nascimento.getUTCDate() === dia && (nascimento.getUTCMonth() + 1) === mes
    })

    // Preparar links do WhatsApp para cada aniversariante
    const mensagensGeradas = aniversariantesHoje.map((cliente: any) => {
      const primeiroNome = cliente.nome.split(' ')[0]
      const mensagem = mensagemTemplate
        ?.replace('{nome}', primeiroNome)
        .replace('{cupom}', cupom || '')
        || `Olá ${primeiroNome}! 🎉 Feliz aniversário! A equipe do Sabor da Casa deseja um dia maravilhoso! ${cupom ? `Use o cupom ${cupom} para ganhar desconto especial!` : ''}`
      
      const telefoneFormatado = cliente.telefone.replace(/\D/g, '')
      const link = `https://wa.me/55${telefoneFormatado}?text=${encodeURIComponent(mensagem)}`
      
      return {
        clienteId: cliente.id,
        nome: cliente.nome,
        telefone: cliente.telefone,
        mensagem,
        linkWhatsApp: link
      }
    })

    return NextResponse.json({ 
      total: mensagensGeradas.length,
      mensagens: mensagensGeradas 
    })
  } catch (error) {
    console.error('[API Enviar Aniversariantes] Erro:', error)
    
    if (error instanceof Error && error.message === 'Não autorizado') {
      return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
    }

    return NextResponse.json({ erro: 'Erro ao processar aniversariantes' }, { status: 500 })
  }
}
