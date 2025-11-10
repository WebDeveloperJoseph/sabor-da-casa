import { PrismaClient } from './src/generated/prisma/index.js'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🔧 Ativando prato ID 999...')
    
    await prisma.prato.update({
      where: { id: 999 },
      data: { ativo: true }
    })
    
    console.log('✅ Prato 999 ativado com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()