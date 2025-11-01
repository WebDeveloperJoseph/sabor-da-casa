/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
// Tipagem avançada pode usar o client gerado em src/generated/prisma, mas para simplificar e evitar acoplamento,
// mantemos o objeto where com mutação controlada e validamos via Zod/Prisma em runtime.

const clienteSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  telefone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('Email inválido').optional().nullable(),
  dataNascimento: z.string().optional().nullable(), // Será convertido para Date
  cpf: z.string().optional().nullable(),
  endereco: z.string().optional().nullable(),
  complemento: z.string().optional().nullable(),
  bairro: z.string().optional().nullable(),
  cidade: z.string().optional().nullable(),
  uf: z.string().max(2).optional().nullable(),
  cep: z.string().optional().nullable(),
  aceitaWhatsApp: z.boolean().default(true),
  aceitaEmail: z.boolean().default(false),
  aceitaPromocoes: z.boolean().default(true),
})

// GET /api/clientes - Lista todos os clientes (admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const aniversariantes = searchParams.get('aniversariantes') === 'true'
    const busca = searchParams.get('busca')
    
    const where: any = { ativo: true }
    
    // Filtro de aniversariantes do mês
    if (aniversariantes) {
  const hoje = new Date()
  const mes = hoje.getUTCMonth() + 1
      
      // Buscar clientes cujo mês de nascimento = mês atual
      const clientes = await prisma.cliente.findMany({
        where: {
          ativo: true,
          dataNascimento: { not: null }
        },
        include: {
          _count: {
            select: { pedidos: true }
          }
        },
        orderBy: { dataNascimento: 'asc' }
      })
      
      const aniversariantesMes = clientes.filter(c => {
        if (!c.dataNascimento) return false
        // Evita problema de fuso: compara usando campos UTC
        return c.dataNascimento.getUTCMonth() + 1 === mes
      })
      
      return NextResponse.json(aniversariantesMes)
    }
    
    // Busca por nome ou telefone
    if (busca) {
      where.OR = [
        { nome: { contains: busca, mode: 'insensitive' } },
        { telefone: { contains: busca } },
        { email: { contains: busca, mode: 'insensitive' } }
      ]
    }
    
    const clientes = await prisma.cliente.findMany({
      where,
      include: {
        _count: {
          select: { pedidos: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    })
    
    return NextResponse.json(clientes)
  } catch (error) {
    console.error('[API Clientes GET] Erro:', error)
    return NextResponse.json({ erro: 'Erro ao buscar clientes' }, { status: 500 })
  }
}

// POST /api/clientes - Criar novo cliente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('[API Clientes POST] Body recebido:', JSON.stringify(body, null, 2))
    
    const parsed = clienteSchema.safeParse(body)
    
    if (!parsed.success) {
      console.error('[API Clientes POST] Validação falhou:', parsed.error.flatten())
      return NextResponse.json({ 
        erro: 'Dados inválidos', 
        detalhes: parsed.error.flatten() 
      }, { status: 400 })
    }
    
    const data = parsed.data
    
    // Verificar se telefone já existe
    const existente = await prisma.cliente.findUnique({
      where: { telefone: data.telefone }
    })
    
    if (existente) {
      return NextResponse.json({ 
        erro: 'Telefone já cadastrado',
        clienteId: existente.id
      }, { status: 409 })
    }
    
    // Converter dataNascimento se fornecido
    // Importante: ao criar Date de uma string YYYY-MM-DD, o JS assume UTC 00:00,
    // o que pode gerar "dia anterior" em fusos negativos ao exibir.
    // Para evitar drift, usamos 12:00:00Z (meio-dia UTC) e o banco salva apenas a parte DATE.
    const dataNascimento = data.dataNascimento
      ? new Date(`${data.dataNascimento}T12:00:00.000Z`)
      : null
    
    // Criar cliente
    const cliente = await prisma.cliente.create({
      data: {
        nome: data.nome,
        telefone: data.telefone,
        email: data.email ?? null,
        dataNascimento,
        cpf: data.cpf ?? null, // TODO: Criptografar se fornecido
        endereco: data.endereco ?? null,
        complemento: data.complemento ?? null,
        bairro: data.bairro ?? null,
        cidade: data.cidade ?? null,
        uf: data.uf ?? null,
        cep: data.cep ?? null,
        aceitaWhatsApp: data.aceitaWhatsApp,
        aceitaEmail: data.aceitaEmail,
        aceitaPromocoes: data.aceitaPromocoes,
      }
    })
    
    console.log('[API Clientes POST] Cliente criado:', cliente.id)
    return NextResponse.json(cliente, { status: 201 })
  } catch (error) {
    console.error('[API Clientes POST] Erro:', error)
    return NextResponse.json({ 
      erro: 'Erro ao criar cliente',
      detalhes: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
