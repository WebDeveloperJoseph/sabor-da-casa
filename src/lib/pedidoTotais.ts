type ValorNumerico = number | string | { toString(): string };

type ItemComSubtotal = { subtotal: ValorNumerico };

export function calcularSubtotalItens(itens: ItemComSubtotal[]) {
  return itens.reduce((total, item) => total + Number(item.subtotal), 0);
}

export function calcularTaxaEntrega(
  valorTotal: ValorNumerico,
  subtotalItens: number,
) {
  return Math.max(0, Number(valorTotal) - subtotalItens);
}

export function calcularValorTotal(subtotalItens: number, taxaEntrega: number) {
  return subtotalItens + taxaEntrega;
}
