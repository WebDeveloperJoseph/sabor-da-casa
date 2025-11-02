import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@/generated/prisma'
// import { requireUser } from '@/lib/supabaseServer' // TODO: Reativar em produção
import { z } from 'zod'

const configuracaoSchema = z.object({
  nomePizzaria: z.string().min(2),
  telefone: z.string().optional().nullable(),
  endereco: z.string().optional().nullable(),
  cnpj: z.string().optional().nullable(),
  // Relaxado para evitar 400 quando o usuário digita sem @; tratamos como string opcional
  email: z.string().optional().nullable(),
  taxaEntrega: z.number().min(0),
  pedidoMinimo: z.number().min(0),
  tempoPreparoMinutos: z.number().int().min(0),
  raioEntregaKm: z.number().int().min(0),
  aceitarPedidos: z.boolean(),
  mensagemBoasVindas: z.string().optional().nullable(),
  // Cartão fidelidade (opcionais para compatibilidade)
  fidelidadeAtivo: z.boolean().optional(),
  fidelidadeMeta: z.number().int().min(1).optional(),
  fidelidadeDescricao: z.string().optional().nullable(),
  fidelidadeCategoriaNome: z.string().optional().nullable(),
  fidelidadePorPedido: z.boolean().optional(),
  // Aceita 0 (ou null) para representar "sem expiração"
  fidelidadeExpiraDias: z.number().int().min(0).optional().nullable(),
})

function toNumber(value: unknown, def = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : def
}

function toNullIfEmpty(value: unknown) {
  if (value == null) return null
  if (typeof value === 'string') {
    const t = value.trim()
    return t === '' ? null : t
  }
  return value as string | null
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
      nomePizzaria: String(body.nomePizzaria ?? '').trim(),
      telefone: toNullIfEmpty(body.telefone),
      endereco: toNullIfEmpty(body.endereco),
      cnpj: toNullIfEmpty(body.cnpj),
      email: toNullIfEmpty(body.email), // '' -> null para passar no z.email().nullable()
      taxaEntrega: toNumber(body.taxaEntrega, 0),
      pedidoMinimo: toNumber(body.pedidoMinimo, 0),
      tempoPreparoMinutos: toNumber(body.tempoPreparoMinutos, 30),
      raioEntregaKm: toNumber(body.raioEntregaKm, 5),
      aceitarPedidos: Boolean(body.aceitarPedidos),
      mensagemBoasVindas: toNullIfEmpty(body.mensagemBoasVindas),
      // fidelidade (com defaults seguros)
      fidelidadeAtivo: Boolean(body.fidelidadeAtivo ?? false),
      fidelidadeMeta: toNumber(body.fidelidadeMeta, 10),
      fidelidadeDescricao: toNullIfEmpty(body.fidelidadeDescricao),
      fidelidadeCategoriaNome: toNullIfEmpty(body.fidelidadeCategoriaNome),
      fidelidadePorPedido: Boolean(body.fidelidadePorPedido ?? true),
      fidelidadeExpiraDias: body.fidelidadeExpiraDias == null || body.fidelidadeExpiraDias === ''
        ? null
        : toNumber(body.fidelidadeExpiraDias, 0),
    }
    
    console.log('[API Configuracoes PUT] Dados após conversão:', JSON.stringify(dataToValidate, null, 2))

    const parsed = configuracaoSchema.safeParse(dataToValidate)

    if (!parsed.success) {
      console.error('[API Configuracoes PUT] Validação falhou:', parsed.error.flatten())
      return NextResponse.json({ erro: 'Dados inválidos', detalhes: parsed.error.flatten() }, { status: 400 })
    }

    const exists = await prisma.configuracao.findFirst()
    console.log('[API Configuracoes PUT] Registro existente:', exists?.id)

    // Separa dados base e (opcionais) de fidelidade para suportar ambientes sem migração aplicada
    const baseData = {
      nomePizzaria: parsed.data.nomePizzaria,
      telefone: parsed.data.telefone ?? null,
      endereco: parsed.data.endereco ?? null,
      cnpj: parsed.data.cnpj ?? null,
      email: parsed.data.email ?? null,
      taxaEntrega: parsed.data.taxaEntrega,
      pedidoMinimo: parsed.data.pedidoMinimo,
      tempoPreparoMinutos: parsed.data.tempoPreparoMinutos,
      raioEntregaKm: parsed.data.raioEntregaKm,
      aceitarPedidos: parsed.data.aceitarPedidos,
      mensagemBoasVindas: parsed.data.mensagemBoasVindas ?? null,
    } satisfies Omit<Prisma.ConfiguracaoCreateInput, 'createdAt' | 'updatedAt'>

    type FidelidadePartial = Partial<{
      fidelidadeAtivo: boolean
      fidelidadeMeta: number
      fidelidadeDescricao: string | null
      fidelidadeCategoriaNome: string | null
      fidelidadePorPedido: boolean
      fidelidadeExpiraDias: number | null
    }>
    const fidSource = parsed.data as unknown as FidelidadePartial
    const fidData: FidelidadePartial = {
      fidelidadeAtivo: fidSource.fidelidadeAtivo,
      fidelidadeMeta: fidSource.fidelidadeMeta,
      fidelidadeDescricao: fidSource.fidelidadeDescricao,
      fidelidadeCategoriaNome: fidSource.fidelidadeCategoriaNome,
      fidelidadePorPedido: fidSource.fidelidadePorPedido,
      fidelidadeExpiraDias: fidSource.fidelidadeExpiraDias,
    }

    let updated
    try {
      // Tenta salvar com os campos de fidelidade (se o client suportar)
      if (exists) {
        updated = await prisma.configuracao.update({
          where: { id: exists.id },
          data: { ...baseData, ...fidData } as unknown as Prisma.ConfiguracaoUpdateInput,
        })
      } else {
        updated = await prisma.configuracao.create({
          data: { ...baseData, ...fidData } as unknown as Prisma.ConfiguracaoCreateInput,
        })
      }
    } catch (e) {
      console.warn('[API Configuracoes PUT] Falha com campos de fidelidade (provável client/migração desatualizada). Salvando somente base.', e)
      // Fallback: salva apenas os campos base (funciona mesmo sem migração de fidelidade)
      if (exists) {
        updated = await prisma.configuracao.update({
          where: { id: exists.id },
          data: baseData as unknown as Prisma.ConfiguracaoUpdateInput,
        })
      } else {
        updated = await prisma.configuracao.create({
          data: baseData as unknown as Prisma.ConfiguracaoCreateInput,
        })
      }
    }

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
