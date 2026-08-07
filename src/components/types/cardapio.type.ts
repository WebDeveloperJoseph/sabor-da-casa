export type Ingrediente = {
  id: number;
  nome: string;
  alergenico: boolean;
};

export type IngredienteTag = {
  ingrediente: Ingrediente;
};

export type TamanhoPrato = {
  tamanho: string;
  preco: number;
};

export type AvaliacaoPrato = {
  avg: number;
  count: number;
};

export type PratoCardapio = {
  id: number;
  nome: string;
  descricao: string | null;
  preco: number | string;
  imagem: string | null;
  ativo: boolean;
  destaque: boolean;
  ingredientes: IngredienteTag[];
  tamanhos?: TamanhoPrato[];
  rating?: AvaliacaoPrato;
};

export type BordaExtraOption = {
  id: number;
  nome: string;
  preco: number;
};

export type CategoriaCardapio = {
  id: number;
  nome: string;
  descricao: string | null;
  pratos: PratoCardapio[];
};

export type TipoFiltroCardapio =
  | "todos"
  | "favoritos"
  | "pizzas"
  | "bebidas"
  | "sobremesas"
  | "outros";

export type CardapioFiltrosProps = {
  categorias: CategoriaCardapio[];
  bordasExtras: BordaExtraOption[];
};
