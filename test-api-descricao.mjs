// Teste da API de criação de pratos com descrição

const testPrato = {
  nome: "Pizza Teste Descrição",
  descricao: "Uma deliciosa pizza com mussarela, molho de tomate especial e oregano fresco. Massa artesanal crocante por fora e macia por dentro.",
  preco: 0, // Será 0 porque usaremos tamanhos
  imagem: null,
  categoriaId: 1, // Assumindo que categoria 1 existe
  ingredientes: [1, 2, 3], // IDs de ingredientes
  destaque: false,
  ativo: true,
  tamanhos: [
    { tamanho: 'P', preco: 25.90 },
    { tamanho: 'M', preco: 35.90 },
    { tamanho: 'G', preco: 45.90 }
  ]
}

async function testarAPI() {
  try {
    console.log('🧪 Testando criação de prato via API...')
    console.log('Dados do prato:', JSON.stringify(testPrato, null, 2))
    
    const response = await fetch('http://localhost:3000/api/pratos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Você pode precisar adicionar token de auth aqui se necessário
      },
      body: JSON.stringify(testPrato)
    })
    
    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ Prato criado com sucesso!')
      console.log('ID:', result.id)
      console.log('Nome:', result.nome)
      console.log('Descrição:', result.descricao)
      
      // Testar a edição da descrição
      const updateData = {
        ...testPrato,
        descricao: "Descrição atualizada: Pizza com ingredientes frescos e massa artesanal, preparada com muito carinho e técnicas tradicionais."
      }
      
      console.log('\n🔄 Testando edição da descrição...')
      
      const updateResponse = await fetch(`http://localhost:3000/api/pratos/${result.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      })
      
      const updateResult = await updateResponse.json()
      
      if (updateResponse.ok) {
        console.log('✅ Descrição atualizada com sucesso!')
        console.log('Nova descrição:', updateResult.descricao)
      } else {
        console.log('❌ Erro ao atualizar:', updateResult)
      }
      
      // Limpar o prato de teste
      const deleteResponse = await fetch(`http://localhost:3000/api/pratos/${result.id}`, {
        method: 'DELETE'
      })
      
      if (deleteResponse.ok) {
        console.log('🗑️ Prato teste removido')
      }
      
    } else {
      console.log('❌ Erro ao criar prato:', result)
    }
    
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message)
  }
}

testarAPI()