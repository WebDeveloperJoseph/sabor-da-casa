import type { FinanceiroResponse } from "@/types/financeiro";

const moeda = (valor: number) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export async function exportarFinanceiroPdf(dados: FinanceiroResponse) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const largura = doc.internal.pageSize.getWidth();
  const altura = doc.internal.pageSize.getHeight();
  const margem = 14;

  function cabecalho() {
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, largura, 38, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Sabor da Casa", margem, 16);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(203, 213, 225);
    doc.text("Relatorio financeiro gerencial", margem, 24);
    doc.text(`${formatarData(dados.periodo.inicio)} a ${formatarData(dados.periodo.fim)}`, margem, 31);
  }

  cabecalho();
  const cards = [
    ["Entradas", moeda(dados.resumo.entradas), [16, 185, 129]],
    ["Despesas", moeda(dados.resumo.despesas), [244, 63, 94]],
    ["Saldo", moeda(dados.resumo.saldo), dados.resumo.saldo >= 0 ? [37, 99, 235] : [244, 63, 94]],
  ] as const;
  cards.forEach(([titulo, valor, cor], index) => {
    const x = margem + index * 61;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, 46, 56, 25, 3, 3, "F");
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(titulo.toUpperCase(), x + 4, 54);
    doc.setTextColor(cor[0], cor[1], cor[2]);
    doc.setFontSize(12);
    doc.text(valor, x + 4, 64);
  });

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.text("Movimentacoes do periodo", margem, 84);

  let y = 91;
  const colunas = [margem, 37, 62, 126, 164];
  function cabecalhoTabela() {
    doc.setFillColor(241, 245, 249);
    doc.rect(margem, y - 5, largura - margem * 2, 8, "F");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    ["Data", "Tipo", "Descricao", "Categoria", "Valor"].forEach((texto, index) => doc.text(texto, colunas[index], y));
    y += 7;
  }
  cabecalhoTabela();

  for (const item of dados.lancamentos) {
    if (y > altura - 20) {
      doc.addPage();
      cabecalho();
      y = 49;
      cabecalhoTabela();
    }
    doc.setDrawColor(226, 232, 240);
    doc.line(margem, y + 3, largura - margem, y + 3);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(formatarData(item.dataCompetencia), colunas[0], y);
    doc.setTextColor(item.tipo === "entrada" ? 5 : 190, item.tipo === "entrada" ? 150 : 24, item.tipo === "entrada" ? 105 : 93);
    doc.text(item.tipo === "entrada" ? "Entrada" : "Despesa", colunas[1], y);
    doc.setTextColor(51, 65, 85);
    doc.text(doc.splitTextToSize(item.descricao, 58)[0], colunas[2], y);
    doc.text(doc.splitTextToSize(item.categoria, 34)[0], colunas[3], y);
    doc.setFont("helvetica", "bold");
    doc.text(moeda(item.valor), largura - margem, y, { align: "right" });
    y += 8;
  }

  const paginas = doc.getNumberOfPages();
  for (let pagina = 1; pagina <= paginas; pagina += 1) {
    doc.setPage(pagina);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`Gerado em ${new Date().toLocaleString("pt-BR")} | Pagina ${pagina} de ${paginas}`, largura / 2, altura - 7, { align: "center" });
  }

  doc.save(`financeiro-${dados.periodo.inicio}-${dados.periodo.fim}.pdf`);
}

export function exportarFinanceiroCsv(dados: FinanceiroResponse) {
  const escapar = (valor: string | number | null) => `"${String(valor ?? "").replaceAll('"', '""')}"`;
  const linhas = [
    ["Data", "Tipo", "Origem", "Descricao", "Categoria", "Valor", "Observacoes"],
    ...dados.lancamentos.map((item) => [
      item.dataCompetencia,
      item.tipo,
      item.origem,
      item.descricao,
      item.categoria,
      item.valor.toFixed(2).replace(".", ","),
      item.observacoes,
    ]),
  ];
  const csv = `\uFEFF${linhas.map((linha) => linha.map(escapar).join(";")).join("\r\n")}`;
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `financeiro-${dados.periodo.inicio}-${dados.periodo.fim}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function formatarData(data: string) {
  return new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR");
}
