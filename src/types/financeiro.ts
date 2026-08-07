export type TipoLancamento = "entrada" | "despesa";
export type OrigemLancamento = "pedido" | "manual";

export type LancamentoFinanceiroDTO = {
  id: number;
  tipo: TipoLancamento;
  origem: OrigemLancamento;
  descricao: string;
  categoria: string;
  valor: number;
  dataCompetencia: string;
  observacoes: string | null;
  pedidoId: number | null;
};

export type ResumoFinanceiro = {
  entradas: number;
  despesas: number;
  saldo: number;
  pedidos: number;
  ticketMedio: number;
  lancamentos: number;
};

export type PontoEvolucaoFinanceira = {
  data: string;
  entradas: number;
  despesas: number;
  saldo: number;
};

export type TotalPorCategoria = {
  categoria: string;
  valor: number;
};

export type FinanceiroResponse = {
  resumo: ResumoFinanceiro;
  lancamentos: LancamentoFinanceiroDTO[];
  evolucao: PontoEvolucaoFinanceira[];
  despesasPorCategoria: TotalPorCategoria[];
  categorias: string[];
  periodo: { inicio: string; fim: string };
};
