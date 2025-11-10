import { PrismaClient } from './src/generated/prisma/index.js'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🔍 Verificando configurações no banco de dados...')
    
    const config = await prisma.configuracao.findFirst()
    
    if (config) {
      console.log('✅ Configurações encontradas:')
      console.log(`- Aceitar Pedidos: ${config.aceitarPedidos}`)
      console.log(`- Pedido Mínimo: R$ ${config.pedidoMinimo}`)
      console.log(`- Taxa Entrega: R$ ${config.taxaEntrega}`)
      
      if (!config.aceitarPedidos) {
        console.log('⚠️  ATENÇÃO: Os pedidos estão PAUSADOS no sistema!')
      }
    } else {
      console.log('❌ Nenhuma configuração encontrada no banco!')
    }
    
    // Verificar se há produtos ativos
    const pratos = await prisma.prato.count({ where: { ativo: true } })
    console.log(`📦 Produtos ativos: ${pratos}`)
    
  } catch (error) {
    console.error('❌ Erro ao verificar configurações:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()