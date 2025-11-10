import { PrismaClient } from './src/generated/prisma/index.js'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🔍 Verificando prato ID 999...')
    
    const prato999 = await prisma.prato.findUnique({
      where: { id: 999 },
      include: { tamanhos: true }
    })
    
    if (prato999) {
      console.log('✅ Prato 999 encontrado:')
      console.log(`- Nome: ${prato999.nome}`)
      console.log(`- Ativo: ${prato999.ativo}`)
      console.log(`- Tamanhos: ${prato999.tamanhos.length}`)
    } else {
      console.log('❌ Prato 999 NÃO encontrado!')
    }
    
    // Verificar se há pratos inativos
    const pratosInativos = await prisma.prato.count({ where: { ativo: false } })
    console.log(`📦 Pratos inativos: ${pratosInativos}`)
    
    // Verificar bordas
    console.log('\n🍕 Verificando bordas recheadas...')
    const bordas = await prisma.prato.findMany({
      where: { 
        categoria: { nome: { contains: 'Bordas' } }
      },
      include: { categoria: true }
    })
    
    console.log(`🔸 Bordas encontradas: ${bordas.length}`)
    bordas.forEach(borda => {
      console.log(`- ${borda.nome} (ID: ${borda.id}) - Ativo: ${borda.ativo}`)
    })
    
  } catch (error) {
    console.error('❌ Erro:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()