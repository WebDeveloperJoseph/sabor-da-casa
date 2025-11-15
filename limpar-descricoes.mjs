import { PrismaClient } from './src/generated/prisma/index.js'

const prisma = new PrismaClient()

async function limparDescricoesInvalidas() {
  try {
    console.log('🔧 Limpando descrições inválidas...\n')
    
    // Buscar pratos com descrições que contêm informação de tamanhos (que não deveria estar lá)
    const pratosComDescricaoInvalida = await prisma.prato.findMany({
      where: {
        descricao: {
          contains: 'Tamanho P - 4 fatias'
        }
      },
      select: {
        id: true,
        nome: true,
        descricao: true
      }
    })
    
    console.log(`🔍 Encontrados ${pratosComDescricaoInvalida.length} pratos com descrição inválida:`)
    
    if (pratosComDescricaoInvalida.length > 0) {
      console.log('\nPratos que serão limpos:')
      pratosComDescricaoInvalida.forEach((prato, index) => {
        console.log(`${index + 1}. ${prato.nome} (ID: ${prato.id})`)
      })
      
      // Limpar as descrições inválidas
      const resultado = await prisma.prato.updateMany({
        where: {
          descricao: {
            contains: 'Tamanho P - 4 fatias'
          }
        },
        data: {
          descricao: null
        }
      })
      
      console.log(`\n✅ ${resultado.count} descrições limpas com sucesso!`)
    } else {
      console.log('\n✅ Nenhuma descrição inválida encontrada!')
    }
    
    // Verificar o resultado
    console.log('\n📋 Estado atual das descrições:')
    const pratos = await prisma.prato.findMany({
      where: { ativo: true },
      select: {
        id: true,
        nome: true,
        descricao: true
      },
      take: 10
    })
    
    const pratosComDescricao = pratos.filter(p => p.descricao && p.descricao.trim() !== '').length
    const pratosSemDescricao = pratos.length - pratosComDescricao
    
    console.log(`✅ Pratos com descrição: ${pratosComDescricao}/${pratos.length}`)
    console.log(`❌ Pratos sem descrição: ${pratosSemDescricao}/${pratos.length}`)
    
  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error)
  } finally {
    await prisma.$disconnect()
  }
}

limparDescricoesInvalidas()