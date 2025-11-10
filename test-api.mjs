// Teste da API de pedidos usando http nativo do Node.js
import http from 'http'

const testOrder = {
  nomeCliente: "João Silva",
  telefone: "11987654321",
  endereco: "Rua das Flores, 123 - Centro",
  observacoes: "Pagamento: DINHEIRO | Troco para R$ 50,00",
  itens: [
    {
      pratoId: 1,
      quantidade: 1,
      tamanho: "P"
    }
  ]
}

function testAPI() {
  console.log('🧪 Testando API de pedidos...')
  console.log('📦 Dados do pedido:', JSON.stringify(testOrder, null, 2))
  
  const postData = JSON.stringify(testOrder)
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/pedidos',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  }
  
  const req = http.request(options, (res) => {
    console.log(`📊 Status: ${res.statusCode}`)
    
    let data = ''
    res.on('data', (chunk) => {
      data += chunk
    })
    
    res.on('end', () => {
      try {
        const result = JSON.parse(data)
        console.log('📋 Resposta:', JSON.stringify(result, null, 2))
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ Pedido criado com sucesso!')
        } else {
          console.log('❌ Erro ao criar pedido')
        }
      } catch (err) {
        console.log('📋 Resposta (texto):', data)
        console.error('❌ Erro ao parsear resposta:', err.message)
      }
    })
  })
  
  req.on('error', (error) => {
    console.error('❌ Erro na requisição:', error.message)
  })
  
  req.write(postData)
  req.end()
}

testAPI()