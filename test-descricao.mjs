import { PrismaClient } from './src/generated/prisma/index.js'

const prisma = new PrismaClient()

async function testarDescricoes() {
  try {
    console.log('🔍 Verificando descrições dos pratos...\n')
    
    // Buscar alguns pratos para verificar as descrições
    const pratos = await prisma.prato.findMany({
      where: { ativo: true },
      select: {
        id: true,
        nome: true,
        descricao: true,
        categoria: {
          select: { nome: true }
        }
      },
      take: 10
    })
    
    if (pratos.length === 0) {
      console.log('❌ Nenhum prato encontrado no banco!')
      return
    }
    
    console.log('📋 Pratos encontrados:')
    pratos.forEach((prato, index) => {
      console.log(`\n${index + 1}. ${prato.nome} (ID: ${prato.id})`)
      console.log(`   Categoria: ${prato.categoria?.nome || 'Sem categoria'}`)
      console.log(`   Descrição: ${prato.descricao || '❌ SEM DESCRIÇÃO'}`)
    })
    
    // Verificar quantos pratos têm descrição
    const pratosSemDescricao = pratos.filter(p => !p.descricao || p.descricao.trim() === '').length
    const pratosComDescricao = pratos.length - pratosSemDescricao
    
    console.log('\n📊 Resumo:')
    console.log(`✅ Pratos com descrição: ${pratosComDescricao}/${pratos.length}`)
    console.log(`❌ Pratos sem descrição: ${pratosSemDescricao}/${pratos.length}`)
    
    // Testar criação de um prato com descrição
    console.log('\n🧪 Testando criação de prato com descrição...')
    
    // Buscar uma categoria para usar no teste
    const categoria = await prisma.categoria.findFirst({ where: { ativo: true } })
    if (!categoria) {
      console.log('❌ Nenhuma categoria ativa encontrada para teste!')
      return
    }
    
    const pratoTeste = await prisma.prato.create({
      data: {
        nome: `Pizza Teste ${Date.now()}`,
        descricao: 'Esta é uma pizza de teste com descrição para verificar se o campo está funcionando corretamente.',
        preco: 25.90,
        categoriaId: categoria.id,
        ativo: true,
        destaque: false
      }
    })
    
    console.log(`✅ Prato teste criado com ID: ${pratoTeste.id}`)
    console.log(`   Nome: ${pratoTeste.nome}`)
    console.log(`   Descrição: ${pratoTeste.descricao}`)
    
    // Verificar se foi salvo corretamente
    const pratoVerificacao = await prisma.prato.findUnique({
      where: { id: pratoTeste.id },
      select: { id: true, nome: true, descricao: true }
    })
    
    if (pratoVerificacao?.descricao === pratoTeste.descricao) {
      console.log('✅ Campo descrição está funcionando corretamente!')
    } else {
      console.log('❌ Problema detectado no campo descrição!')
    }
    
    // Limpar o prato teste
    await prisma.prato.delete({ where: { id: pratoTeste.id } })
    console.log('🗑️ Prato teste removido')
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testarDescricoes()