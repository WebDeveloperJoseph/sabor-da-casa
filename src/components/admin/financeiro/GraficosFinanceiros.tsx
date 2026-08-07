import type {
  PontoEvolucaoFinanceira,
  TotalPorCategoria,
} from "@/types/financeiro";

const moedaCompacta = new Intl.NumberFormat("pt-BR", {
  notation: "compact",
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 1,
});

export function GraficoEvolucao({
  dados,
}: {
  dados: PontoEvolucaoFinanceira[];
}) {
  if (dados.length === 0) return <GraficoVazio />;

  const largura = 760;
  const altura = 260;
  const margem = { top: 22, right: 18, bottom: 38, left: 64 };
  const areaLargura = largura - margem.left - margem.right;
  const areaAltura = altura - margem.top - margem.bottom;
  const maiorValor = Math.max(
    ...dados.flatMap((item) => [item.entradas, item.despesas]),
    1,
  );
  const x = (index: number) =>
    margem.left +
    (dados.length === 1 ? areaLargura / 2 : (index / (dados.length - 1)) * areaLargura);
  const y = (valor: number) => margem.top + areaAltura - (valor / maiorValor) * areaAltura;
  const pontos = (chave: "entradas" | "despesas") =>
    dados.map((item, index) => `${x(index)},${y(item[chave])}`).join(" ");
  const indicesRotulo = [...new Set([0, Math.floor((dados.length - 1) / 2), dados.length - 1])];

  return (
    <div className="h-[280px] w-full" role="img" aria-label="Evolução de entradas e despesas no período">
      <svg viewBox={`0 0 ${largura} ${altura}`} className="h-full w-full overflow-visible">
        {[0, 0.25, 0.5, 0.75, 1].map((percentual) => {
          const valor = maiorValor * percentual;
          const posicaoY = y(valor);
          return (
            <g key={percentual}>
              <line
                x1={margem.left}
                x2={largura - margem.right}
                y1={posicaoY}
                y2={posicaoY}
                stroke="#e2e8f0"
                strokeDasharray="4 5"
              />
              <text x={margem.left - 10} y={posicaoY + 4} textAnchor="end" className="fill-slate-400 text-[10px]">
                {moedaCompacta.format(valor)}
              </text>
            </g>
          );
        })}
        <polyline fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" points={pontos("entradas")} />
        <polyline fill="none" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" points={pontos("despesas")} />
        {dados.map((item, index) => (
          <g key={item.data}>
            <circle cx={x(index)} cy={y(item.entradas)} r="4" fill="#10b981" stroke="white" strokeWidth="2" />
            <circle cx={x(index)} cy={y(item.despesas)} r="4" fill="#f43f5e" stroke="white" strokeWidth="2" />
          </g>
        ))}
        {indicesRotulo.map((index) => (
          <text key={dados[index].data} x={x(index)} y={altura - 10} textAnchor="middle" className="fill-slate-500 text-[11px]">
            {new Date(`${dados[index].data}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
          </text>
        ))}
      </svg>
    </div>
  );
}

export function GraficoCategorias({ dados }: { dados: TotalPorCategoria[] }) {
  if (dados.length === 0) return <GraficoVazio />;
  const maiorValor = Math.max(...dados.map((item) => item.valor), 1);

  return (
    <div className="space-y-5 py-3">
      {dados.slice(0, 6).map((item, index) => (
        <div key={item.categoria}>
          <div className="mb-2 flex items-center justify-between gap-3 text-sm">
            <span className="truncate font-semibold text-slate-700">
              {index + 1}. {item.categoria}
            </span>
            <span className="shrink-0 font-bold text-slate-900">
              {item.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-linear-to-r from-rose-500 to-orange-400"
              style={{ width: `${Math.max(4, (item.valor / maiorValor) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function GraficoVazio() {
  return (
    <div className="flex h-[260px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 text-sm text-slate-500">
      Não há dados suficientes neste período.
    </div>
  );
}
