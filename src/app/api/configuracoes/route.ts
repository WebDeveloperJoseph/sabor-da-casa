import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
// import { requireUser } from '@/lib/supabaseServer' // TODO: Reativar em produção
import { z } from 'zod'

const configuracaoSchema = z.object({
  nomePizzaria: z.string().min(2),
  telefone: z.string().optional().nullable(),
  endereco: z.string().optional().nullable(),
  cnpj: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  taxaEntrega: z.number().min(0),
  pedidoMinimo: z.number().min(0),
  tempoPreparoMinutos: z.number().int().min(0),
  raioEntregaKm: z.number().int().min(0),
  aceitarPedidos: z.boolean(),
  mensagemBoasVindas: z.string().optional().nullable(),
})

function toNumber(value: unknown, def = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : def
}

// GET /api/configuracoes - retorna a configuração (cria padrão se não existir)
export async function GET() {
  try {
    // TODO: Reativar autenticação em produção
    // await requireUser()

    let cfg = await prisma.configuracao.findFirst()
    if (!cfg) {
      console.log('[API Configuracoes GET] Criando configuração padrão...')
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

    console.log('[API Configuracoes GET] Retornando configuração:', cfg.id)
    return NextResponse.json(cfg)
  } catch (error) {
    console.error('[API Configuracoes GET] Erro ao buscar configurações:', error)
    if (error instanceof Error && error.message === 'Não autorizado') {
      return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
    }
    return NextResponse.json({ erro: 'Erro ao buscar configurações' }, { status: 500 })
  }
}

// PUT /api/configuracoes - atualiza a configuração
export async function PUT(request: NextRequest) {
  try {
    // TODO: Reativar autenticação em produção
    // await requireUser()
    
    const body = await request.json()
    console.log('[API Configuracoes PUT] Body recebido:', JSON.stringify(body, null, 2))

    // Converter possíveis strings em números/booleanos
    const dataToValidate = {
      nomePizzaria: body.nomePizzaria,
      telefone: body.telefone ?? null,
      endereco: body.endereco ?? null,
      cnpj: body.cnpj ?? null,
      email: body.email ?? null,
      taxaEntrega: toNumber(body.taxaEntrega, 0),
      pedidoMinimo: toNumber(body.pedidoMinimo, 0),
      tempoPreparoMinutos: toNumber(body.tempoPreparoMinutos, 30),
      raioEntregaKm: toNumber(body.raioEntregaKm, 5),
      aceitarPedidos: Boolean(body.aceitarPedidos),
      mensagemBoasVindas: body.mensagemBoasVindas ?? null,
    }
    
    console.log('[API Configuracoes PUT] Dados após conversão:', JSON.stringify(dataToValidate, null, 2))

    const parsed = configuracaoSchema.safeParse(dataToValidate)

    if (!parsed.success) {
      console.error('[API Configuracoes PUT] Validação falhou:', parsed.error.flatten())
      return NextResponse.json({ erro: 'Dados inválidos', detalhes: parsed.error.flatten() }, { status: 400 })
    }

    const exists = await prisma.configuracao.findFirst()
    console.log('[API Configuracoes PUT] Registro existente:', exists?.id)
    
    const updated = await prisma.configuracao.upsert({
      where: { id: exists?.id ?? 0 },
      update: parsed.data,
      create: parsed.data,
    })

    console.log('[API Configuracoes PUT] Configuração atualizada com sucesso:', updated.id)
    return NextResponse.json(updated)
  } catch (error) {
    console.error('[API Configuracoes PUT] Erro ao atualizar configurações:', error)
    if (error instanceof Error && error.message === 'Não autorizado') {
      return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
    }
    return NextResponse.json({ erro: 'Erro ao atualizar configurações', detalhes: error instanceof Error ? error.message : 'Erro desconhecido' }, { status: 500 })
  }
}
