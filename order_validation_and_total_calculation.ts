
// Função utilitária para calcular o total do pedido
export function calcularTotalPedido(body: { itens: Array<{ preco: number, quantidade: number, borda?: { preco?: number } }> }) {
  if (!body.itens || body.itens.length === 0) {
    throw new Error("O pedido deve conter pelo menos um item");
  }
  return body.itens.reduce((acc: number, item: any) => {
    const precoItem = Number(item.preco);
    const precoBorda = item.borda?.preco ? Number(item.borda.preco) : 0;
    return acc + ((precoItem + precoBorda) * item.quantidade);
  }, 0);
}
