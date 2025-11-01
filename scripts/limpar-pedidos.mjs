// Script Node.js para limpar pedidos de teste
// Execute com: node scripts/limpar-pedidos.mjs

import { PrismaClient } from '../src/generated/prisma/index.js'

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️  Limpando pedidos de teste...\n')

  // 1. Deletar itens de pedidos
  const deletedItens = await prisma.itemPedido.deleteMany({})
  console.log(`✅ ${deletedItens.count} itens de pedidos deletados`)

  // 2. Deletar pedidos
  const deletedPedidos = await prisma.pedido.deleteMany({})
  console.log(`✅ ${deletedPedidos.count} pedidos deletados`)

  // 3. Verificar
  const totalPedidos = await prisma.pedido.count()
  const totalItens = await prisma.itemPedido.count()

  console.log('\n📊 Resultado final:')
  console.log(`   Pedidos restantes: ${totalPedidos}`)
  console.log(`   Itens restantes: ${totalItens}`)

  if (totalPedidos === 0 && totalItens === 0) {
    console.log('\n✅ Banco limpo com sucesso! Próximo pedido será #1')
  }
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
