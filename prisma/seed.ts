import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🍕 Populando banco com dados de pizzaria...')

  // 1. Criar Categorias
  await prisma.$transaction([
    prisma.categoria.upsert({
      where: { nome: 'Pizzas Tradicionais' },
      update: {},
      create: {
        nome: 'Pizzas Tradicionais',
        descricao: 'As clássicas que todo mundo ama',
        ordem: 1,
      },
    }),
    prisma.categoria.upsert({
      where: { nome: 'Pizzas Especiais' },
      update: {},
      create: {
        nome: 'Pizzas Especiais',
        descricao: 'Criações exclusivas da casa',
        ordem: 2,
      },
    }),
    prisma.categoria.upsert({
      where: { nome: 'Pizzas Doces' },
      update: {},
      create: {
        nome: 'Pizzas Doces',
        descricao: 'Para finalizar com açúcar',
        ordem: 3,
      },
    }),
    prisma.categoria.upsert({
      where: { nome: 'Bebidas' },
      update: {},
      create: {
        nome: 'Bebidas',
        descricao: 'Para acompanhar sua pizza',
        ordem: 4,
      },
    }),
    prisma.categoria.upsert({
      where: { nome: 'Entradas' },
      update: {},
      create: {
        nome: 'Entradas',
        descricao: 'Aperitivos deliciosos',
        ordem: 5,
      },
    }),
  ])

  console.log('✅ Categorias criadas!')

  // 2. Criar Ingredientes
  await prisma.$transaction([
    prisma.ingrediente.upsert({
      where: { nome: 'Mussarela' },
      update: {},
      create: { nome: 'Mussarela', alergenico: true },
    }),
    prisma.ingrediente.upsert({
      where: { nome: 'Tomate' },
      update: {},
      create: { nome: 'Tomate', alergenico: false },
    }),
    prisma.ingrediente.upsert({
      where: { nome: 'Manjericão' },
      update: {},
      create: { nome: 'Manjericão', alergenico: false },
    }),
    prisma.ingrediente.upsert({
      where: { nome: 'Calabresa' },
      update: {},
      create: { nome: 'Calabresa', alergenico: false },
    }),
    prisma.ingrediente.upsert({
      where: { nome: 'Cebola' },
      update: {},
      create: { nome: 'Cebola', alergenico: false },
    }),
    prisma.ingrediente.upsert({
      where: { nome: 'Azeitona' },
      update: {},
      create: { nome: 'Azeitona', alergenico: false },
    }),
    prisma.ingrediente.upsert({
      where: { nome: 'Catupiry' },
      update: {},
      create: { nome: 'Catupiry', alergenico: true },
    }),
    prisma.ingrediente.upsert({
      where: { nome: 'Presunto' },
      update: {},
      create: { nome: 'Presunto', alergenico: false },
    }),
    prisma.ingrediente.upsert({
      where: { nome: 'Chocolate' },
      update: {},
      create: { nome: 'Chocolate', alergenico: true },
    }),
  ])

  console.log('✅ Ingredientes criados!')

  // 3. Buscar categorias para usar nos pratos
  const pizzasTradicionais = await prisma.categoria.findUnique({
    where: { nome: 'Pizzas Tradicionais' }
  })
  const pizzasEspeciais = await prisma.categoria.findUnique({
    where: { nome: 'Pizzas Especiais' }
  })
  const bebidas = await prisma.categoria.findUnique({
    where: { nome: 'Bebidas' }
  })

  // 4. Criar Pizzas
  await prisma.$transaction([
    // Pizza especial para pizzas mistas/personalizadas
    prisma.prato.upsert({
      where: { id: 999 },
      update: {},
      create: {
        id: 999,
        nome: 'Pizza Personalizada',
        descricao: 'Pizza com sabores combinados à sua escolha',
        preco: 0, // Preço será calculado dinamicamente
        categoriaId: pizzasTradicionais!.id,
        destaque: false,
        ativo: false, // Não aparece no cardápio normal
      },
    }),
    prisma.prato.upsert({
      where: { id: 1 },
      update: {},
      create: {
        nome: 'Pizza Margherita',
        descricao: 'A clássica italiana com molho de tomate, mussarela e manjericão fresco',
        preco: 35.90,
        categoriaId: pizzasTradicionais!.id,
        destaque: true,
      },
    }),
    prisma.prato.upsert({
      where: { id: 2 },
      update: {},
      create: {
        nome: 'Pizza Calabresa',
        descricao: 'Molho de tomate, mussarela, calabresa fatiada e cebola',
        preco: 39.90,
        categoriaId: pizzasTradicionais!.id,
        destaque: false,
      },
    }),
    prisma.prato.upsert({
      where: { id: 3 },
      update: {},
      create: {
        nome: 'Pizza da Casa',
        descricao: 'Nossa criação especial com ingredientes selecionados',
        preco: 49.90,
        categoriaId: pizzasEspeciais!.id,
        destaque: true,
      },
    }),
    prisma.prato.upsert({
      where: { id: 4 },
      update: {},
      create: {
        nome: 'Coca-Cola 350ml',
        descricao: 'Refrigerante gelado',
        preco: 5.90,
        categoriaId: bebidas!.id,
        destaque: false,
      },
    }),
  ])

  console.log('✅ Pratos/Pizzas criados!')

  // 5. Buscar ingredientes para relacionar
  const mussarela = await prisma.ingrediente.findUnique({ where: { nome: 'Mussarela' } })
  const tomate = await prisma.ingrediente.findUnique({ where: { nome: 'Tomate' } })
  const manjericao = await prisma.ingrediente.findUnique({ where: { nome: 'Manjericão' } })
  const calabresa = await prisma.ingrediente.findUnique({ where: { nome: 'Calabresa' } })
  const cebola = await prisma.ingrediente.findUnique({ where: { nome: 'Cebola' } })
  const catupiry = await prisma.ingrediente.findUnique({ where: { nome: 'Catupiry' } })
  const presunto = await prisma.ingrediente.findUnique({ where: { nome: 'Presunto' } })

  // 6. Conectar ingredientes às pizzas
  await prisma.$transaction([
    // Pizza Margherita: Mussarela + Tomate + Manjericão
    prisma.pratoIngrediente.upsert({
      where: { pratoId_ingredienteId: { pratoId: 1, ingredienteId: mussarela!.id } },
      update: {},
      create: { pratoId: 1, ingredienteId: mussarela!.id },
    }),
    prisma.pratoIngrediente.upsert({
      where: { pratoId_ingredienteId: { pratoId: 1, ingredienteId: tomate!.id } },
      update: {},
      create: { pratoId: 1, ingredienteId: tomate!.id },
    }),
    prisma.pratoIngrediente.upsert({
      where: { pratoId_ingredienteId: { pratoId: 1, ingredienteId: manjericao!.id } },
      update: {},
      create: { pratoId: 1, ingredienteId: manjericao!.id },
    }),

    // Pizza Calabresa: Mussarela + Tomate + Calabresa + Cebola
    prisma.pratoIngrediente.upsert({
      where: { pratoId_ingredienteId: { pratoId: 2, ingredienteId: mussarela!.id } },
      update: {},
      create: { pratoId: 2, ingredienteId: mussarela!.id },
    }),
    prisma.pratoIngrediente.upsert({
      where: { pratoId_ingredienteId: { pratoId: 2, ingredienteId: tomate!.id } },
      update: {},
      create: { pratoId: 2, ingredienteId: tomate!.id },
    }),
    prisma.pratoIngrediente.upsert({
      where: { pratoId_ingredienteId: { pratoId: 2, ingredienteId: calabresa!.id } },
      update: {},
      create: { pratoId: 2, ingredienteId: calabresa!.id },
    }),
    prisma.pratoIngrediente.upsert({
      where: { pratoId_ingredienteId: { pratoId: 2, ingredienteId: cebola!.id } },
      update: {},
      create: { pratoId: 2, ingredienteId: cebola!.id },
    }),

    // Pizza da Casa: Mussarela + Catupiry + Presunto
    prisma.pratoIngrediente.upsert({
      where: { pratoId_ingredienteId: { pratoId: 3, ingredienteId: mussarela!.id } },
      update: {},
      create: { pratoId: 3, ingredienteId: mussarela!.id },
    }),
    prisma.pratoIngrediente.upsert({
      where: { pratoId_ingredienteId: { pratoId: 3, ingredienteId: catupiry!.id } },
      update: {},
      create: { pratoId: 3, ingredienteId: catupiry!.id },
    }),
    prisma.pratoIngrediente.upsert({
      where: { pratoId_ingredienteId: { pratoId: 3, ingredienteId: presunto!.id } },
      update: {},
      create: { pratoId: 3, ingredienteId: presunto!.id },
    }),
  ])

  console.log('✅ Relacionamentos criados!')
  console.log('🎉 Banco populado com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro ao popular banco:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })