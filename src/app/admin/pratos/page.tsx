import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { BotaoExcluirPrato } from "@/components/admin/BotaoExcluirPrato";

export const dynamic = "force-dynamic";

type StatusFiltro = "ativas" | "desativas" | "todas";

export default async function PagePratos({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const busca = typeof params?.busca === "string" ? params.busca.trim() : "";
  const statusRaw =
    typeof params?.status === "string" ? params.status : "ativas";
  const status: StatusFiltro =
    statusRaw === "desativas" || statusRaw === "todas" ? statusRaw : "ativas";

  const where: Prisma.PratoWhereInput = {
    ...(status === "ativas" ? { ativo: true } : {}),
    ...(status === "desativas" ? { ativo: false } : {}),
    ...(busca
      ? {
          nome: {
            contains: busca,
            mode: "insensitive",
          },
        }
      : {}),
  };

  const pratos = await prisma.prato.findMany({
    where,
    include: {
      categoria: true,
      tamanhos: { where: { ativo: true }, orderBy: { tamanho: "asc" } },
    },
    orderBy: [{ destaque: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Pratos</h1>
        <Link href="/admin/pratos/novo">
          <Button>Novo prato</Button>
        </Link>
      </div>

      <form className="border rounded-md p-4 bg-white/60">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_auto_auto] gap-3 items-end">
          <div className="space-y-2">
            <label htmlFor="busca" className="text-sm font-medium">
              Buscar por nome
            </label>
            <input
              id="busca"
              name="busca"
              defaultValue={busca}
              placeholder="Ex.: calabresa"
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={status}
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="ativas">Ativas</option>
              <option value="desativas">Desativas</option>
              <option value="todas">Todas</option>
            </select>
          </div>

          <Button type="submit">Filtrar</Button>

          <Link href="/admin/pratos">
            <Button type="button" variant="secondary">
              Limpar
            </Button>
          </Link>
        </div>
      </form>

      <div className="overflow-x-auto border rounded-md">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3">Nome</th>
              <th className="text-left p-3">Categoria</th>
              <th className="text-left p-3">Preço</th>
              <th className="text-left p-3">Destaque</th>
              <th className="text-left p-3">Ativo</th>
              <th className="text-right p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {pratos.map((p) => {
              const temTamanhos = p.tamanhos && p.tamanhos.length > 0;
              const precoDisplay = temTamanhos
                ? p.tamanhos
                    .map(
                      (t) => `${t.tamanho}: R$ ${Number(t.preco).toFixed(2)}`,
                    )
                    .join(" | ")
                : `R$ ${Number(p.preco).toFixed(2)}`;

              return (
                <tr key={p.id} className="border-t">
                  <td className="p-3">{p.nome}</td>
                  <td className="p-3">{p.categoria?.nome ?? "-"}</td>
                  <td className="p-3 text-xs">{precoDisplay}</td>
                  <td className="p-3">{p.destaque ? "Sim" : "Não"}</td>
                  <td className="p-3">{p.ativo ? "Sim" : "Não"}</td>
                  <td className="p-3">
                    <div className="flex gap-2 justify-end">
                      <Link href={`/admin/pratos/${p.id}`}>
                        <Button variant="secondary" size="sm">
                          Editar
                        </Button>
                      </Link>
                      <BotaoExcluirPrato id={p.id} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {pratos.length === 0 && (
              <tr>
                <td
                  className="p-4 text-center text-muted-foreground"
                  colSpan={6}
                >
                  Nenhum prato cadastrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
