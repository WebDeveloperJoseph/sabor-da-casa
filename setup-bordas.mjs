import { PrismaClient } from './src/generated/prisma/index.js'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🍕 Criando sistema de bordas recheadas...')
    
    // 1. Criar categoria "Bordas Recheadas" se não existir
    let categoriaBordas = await prisma.categoria.findFirst({
      where: { nome: { contains: 'Bordas' } }
    })
    
    if (!categoriaBordas) {
      categoriaBordas = await prisma.categoria.create({
        data: {
          nome: 'Bordas Recheadas',
          descricao: 'Bordas especiais para suas pizzas',
          ativo: true,
          ordem: 99
        }
      })
      console.log('✅ Categoria "Bordas Recheadas" criada')
    } else {
      console.log('ℹ️ Categoria de bordas já existe')
    }
    
    // 2. Criar algumas bordas de exemplo
    const bordas = [
      {
        nome: 'Borda Recheada com Catupiry',
        preco: 8.00,
        descricao: 'Deliciosa borda recheada com catupiry cremoso'
      },
      {
        nome: 'Borda Recheada com Cream Cheese',
        preco: 10.00,
        descricao: 'Borda especial recheada com cream cheese'
      },
      {
        nome: 'Borda Recheada com Cheddar',
        preco: 9.00,
        descricao: 'Borda saborosa recheada com queijo cheddar'
      },
      {
        nome: 'Borda Doce com Chocolate',
        preco: 12.00,
        descricao: 'Borda doce recheada com chocolate ao leite'
      }
    ]
    
    for (const borda of bordas) {
      const existe = await prisma.prato.findFirst({
        where: { nome: borda.nome }
      })
      
      if (!existe) {
        await prisma.prato.create({
          data: {
            nome: borda.nome,
            descricao: borda.descricao,
            preco: borda.preco,
            categoriaId: categoriaBordas.id,
            ativo: true,
            destaque: false
          }
        })
        console.log(`✅ Borda "${borda.nome}" criada`)
      } else {
        console.log(`ℹ️ Borda "${borda.nome}" já existe`)
      }
    }
    
    console.log('🎉 Sistema de bordas configurado com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()