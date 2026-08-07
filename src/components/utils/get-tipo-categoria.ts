import type { TipoFiltroCardapio } from "../types/cardapio.type";
import { normalizeText } from "./normalize-text";

export function getTipoCategoria(nomeCategoria: string): TipoFiltroCardapio {
  const nome = normalizeText(nomeCategoria);

  if (
    nome.includes("bebida") ||
    nome.includes("refrigerante") ||
    nome.includes("suco")
  ) {
    return "bebidas";
  }

  if (nome.includes("sobremesa") || nome.includes("doce")) {
    return "sobremesas";
  }

  if (nome.includes("pizza") || nome.includes("tradicional")) {
    return "pizzas";
  }

  return "outros";
}
