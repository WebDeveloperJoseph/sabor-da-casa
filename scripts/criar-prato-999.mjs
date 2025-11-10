import { PrismaClient } from '../src/generated/prisma/index.js'

const prisma = new PrismaClient()

async function createPizzaPersonalizada() {
  try {
    console.log('🍕 Criando prato "Pizza Personalizada" (ID 999)...')
    
    // Buscar categoria de pizzas tradicionais
    const categoria = await prisma.categoria.findFirst({
      where: { nome: { contains: 'Tradiciona', mode: 'insensitive' } }
    })
    
    if (!categoria) {
      console.error('❌ Categoria "Pizzas Tradicionais" não encontrada!')
      process.exit(1)
    }
    
    // Verificar se já existe
    const existe = await prisma.prato.findUnique({ where: { id: 999 } })
    
    if (existe) {
      console.log('✅ Prato ID 999 já existe:', existe.nome)
      return
    }
    
    // Criar prato
    const prato = await prisma.prato.create({
      data: {
        id: 999,
        nome: 'Pizza Personalizada',
        descricao: 'Pizza com sabores combinados à sua escolha (2-4 sabores)',
        preco: 0,
        ativo: false, // Não aparece no cardápio normal
        destaque: false,
        categoriaId: categoria.id
      }
    })
    
    console.log('✅ Prato criado com sucesso:', prato)
    
  } catch (error) {
    console.error('❌ Erro:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createPizzaPersonalizada()
