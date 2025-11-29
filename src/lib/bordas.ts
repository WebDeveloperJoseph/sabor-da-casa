// Serviço para buscar bordas disponíveis (mock inicial, depois integrar com backend)
export async function fetchBordasDisponiveis() {
  // Troque por chamada real ao backend quando disponível
  return [
    { id: 1, nome: 'Catupiry', preco: 5.0 },
    { id: 2, nome: 'Cheddar', preco: 4.5 },
    { id: 3, nome: 'Chocolate', preco: 6.0 }
  ]
}
