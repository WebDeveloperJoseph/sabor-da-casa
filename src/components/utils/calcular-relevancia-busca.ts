import type { PratoCardapio } from "../types/cardapio.type";

import { normalizeText } from "./normalize-text";

type CalcularRelevanciaParams = {
  prato: PratoCardapio;
  nomeCategoria: string;
  busca: string;
};

type CampoPesquisavel = {
  texto: string;
  peso: number;
};

/** Retorna zero quando o prato nao corresponde a todos os termos pesquisados. */
export function calcularRelevanciaBusca({
  prato,
  nomeCategoria,
  busca,
}: CalcularRelevanciaParams): number {
  const termos = separarTermos(busca);
  if (termos.length === 0) return 1;

  const campos: CampoPesquisavel[] = [
    { texto: normalizeText(prato.nome), peso: 5 },
    { texto: normalizeText(prato.descricao ?? ""), peso: 2 },
    ...prato.ingredientes.map(({ ingrediente }) => ({
      texto: normalizeText(ingrediente.nome),
      peso: 3,
    })),
    { texto: normalizeText(nomeCategoria), peso: 1 },
  ];

  let relevancia = 0;

  for (const termo of termos) {
    const melhorResultado = Math.max(
      ...campos.map(({ texto, peso }) => pontuarTermo(termo, texto) * peso),
    );

    if (melhorResultado === 0) return 0;
    relevancia += melhorResultado;
  }

  const buscaNormalizada = termos.join(" ");
  if (campos[0].texto.includes(buscaNormalizada)) relevancia += 50;

  return relevancia;
}

function separarTermos(texto: string): string[] {
  return [...new Set(normalizeText(texto).split(/\s+/).filter(Boolean))];
}

function pontuarTermo(termo: string, texto: string): number {
  if (!texto) return 0;
  if (texto === termo) return 20;
  if (texto.startsWith(termo)) return 16;
  if (termo.length >= 2 && texto.includes(termo)) return 12;

  const palavras = texto.split(/[^a-z0-9]+/).filter(Boolean);
  let menorDistancia = Number.POSITIVE_INFINITY;

  for (const palavra of palavras) {
    if (palavra.startsWith(termo)) return 14;

    const diferencaTamanho = Math.abs(palavra.length - termo.length);
    const limite = limiteDeErros(termo.length);
    if (diferencaTamanho > limite) continue;

    // Em termos curtos, a primeira letra reduz falsos positivos consideravelmente.
    if (termo.length <= 3 && palavra[0] !== termo[0]) continue;

    menorDistancia = Math.min(
      menorDistancia,
      distanciaLevenshteinLimitada(termo, palavra, limite),
    );
  }

  const limite = limiteDeErros(termo.length);
  return menorDistancia <= limite ? 8 - menorDistancia : 0;
}

function limiteDeErros(tamanho: number): number {
  if (tamanho < 3) return 0;
  if (tamanho < 7) return 1;
  return 2;
}

function distanciaLevenshteinLimitada(
  origem: string,
  destino: string,
  limite: number,
): number {
  let anterior = Array.from({ length: destino.length + 1 }, (_, index) => index);

  for (let i = 1; i <= origem.length; i += 1) {
    const atual = [i];
    let menorDaLinha = i;

    for (let j = 1; j <= destino.length; j += 1) {
      const custo = origem[i - 1] === destino[j - 1] ? 0 : 1;
      atual[j] = Math.min(
        (atual[j - 1] ?? 0) + 1,
        (anterior[j] ?? 0) + 1,
        (anterior[j - 1] ?? 0) + custo,
      );
      menorDaLinha = Math.min(menorDaLinha, atual[j]);
    }

    if (menorDaLinha > limite) return limite + 1;
    anterior = atual;
  }

  return anterior[destino.length] ?? limite + 1;
}
