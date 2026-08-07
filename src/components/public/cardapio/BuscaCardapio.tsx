import { Search, X } from "lucide-react";

type BuscaCardapioProps = {
  busca: string;
  pesquisando?: boolean;
  onBuscaChange: (busca: string) => void;
};

export function BuscaCardapio({
  busca,
  pesquisando = false,
  onBuscaChange,
}: BuscaCardapioProps) {
  return (
    <div className="anim-fade-up anim-d-90 relative mx-auto max-w-3xl">
      <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#5f5250]" />
      <input
        type="search"
        value={busca}
        onChange={(event) => onBuscaChange(event.target.value)}
        placeholder="Buscar pizzas, sabores e mais..."
        aria-label="Buscar no cardápio"
        aria-describedby="busca-cardapio-ajuda"
        autoComplete="off"
        className="h-14 w-full rounded-full border border-[#eadfd3] bg-white pl-14 pr-12 text-base text-[#231313] shadow-[0_8px_22px_rgba(57,31,22,0.08)] outline-none transition focus:border-[#c90010] focus:ring-2 focus:ring-[#ffd15a]/50"
      />
      <span id="busca-cardapio-ajuda" className="sr-only">
        A busca aceita nomes incompletos e pequenos erros de digitação.
      </span>
      <span className="sr-only" role="status" aria-live="polite">
        {pesquisando ? "Atualizando resultados" : "Resultados atualizados"}
      </span>
      {busca && (
        <button
          type="button"
          onClick={() => onBuscaChange("")}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-2 text-[#7b706c] hover:bg-[#fff0f0] hover:text-[#c90010]"
          aria-label="Limpar busca"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
