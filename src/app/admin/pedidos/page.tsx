import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import Link from "next/link";
import DeletePedidoButton from "@/components/admin/DeletePedidoButton";
import AdminOrderRealtimeNotifier from "@/components/admin/AdminOrderRealtimeNotifier";
import PedidoStatusControls from "@/components/admin/PedidoStatusControls";
import LimparPedidosTesteButton from "@/components/admin/LimparPedidosTesteButton";
import ZerarPedidosButton from "@/components/admin/ZerarPedidosButton";
import { calcularSubtotalItens, calcularTaxaEntrega } from "@/lib/pedidoTotais";
import {
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Package,
  Eye,
  Star,
  Pencil,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type SearchParams = Promise<{
  pagina?: string;
  periodo?: string;
  data?: string;
}>;

const POR_PAGINA = 20;

function intervaloDoDia(data: string) {
  const inicio = new Date(`${data}T00:00:00-03:00`);
  const fim = new Date(inicio);
  fim.setDate(fim.getDate() + 1);
  return { gte: inicio, lt: fim };
}

function dataHoje() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
}

export default async function PedidosPage({ searchParams }: { searchParams: SearchParams }) {
  const query = await searchParams;
  const pagina = Math.max(1, Number(query.pagina) || 1);
  const periodo = query.periodo === "hoje" || query.periodo === "data" ? query.periodo : "todos";
  const dataSelecionada = /^\d{4}-\d{2}-\d{2}$/.test(query.data ?? "") ? query.data! : dataHoje();
  const where: Prisma.PedidoWhereInput =
    periodo === "todos"
      ? {}
      : { createdAt: intervaloDoDia(periodo === "hoje" ? dataHoje() : dataSelecionada) };

  const [pedidos, totalPedidos, statusAgrupados] = await prisma.$transaction([
    prisma.pedido.findMany({
    where,
    include: {
      itens: {
        include: {
          prato: true,
        },
      },
      avaliacao: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: (pagina - 1) * POR_PAGINA,
    take: POR_PAGINA,
  }),
    prisma.pedido.count({ where }),
    prisma.pedido.groupBy({
      by: ["status"],
      where,
      _count: { status: true },
      orderBy: { status: "asc" },
    }),
  ]);
  const totalPaginas = Math.max(1, Math.ceil(totalPedidos / POR_PAGINA));

  const urlPagina = (destino: number) => {
    const params = new URLSearchParams({ pagina: String(destino), periodo });
    if (periodo === "data") params.set("data", dataSelecionada);
    return `/admin/pedidos?${params}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pendente":
        return <Clock className="w-5 h-5" />;
      case "em_preparo":
        return <Package className="w-5 h-5" />;
      case "saiu_entrega":
        return <Truck className="w-5 h-5" />;
      case "entregue":
        return <CheckCircle className="w-5 h-5" />;
      case "cancelado":
        return <XCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "em_preparo":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "saiu_entrega":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "entregue":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelado":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pendente":
        return "Pendente";
      case "em_preparo":
        return "Em Preparo";
      case "saiu_entrega":
        return "Saiu para Entrega";
      case "entregue":
        return "Entregue";
      case "cancelado":
        return "Cancelado";
      default:
        return status;
    }
  };

  const quantidadeStatus = (status: string) => {
    const contagem = statusAgrupados.find((grupo) => grupo.status === status)?._count;
    return typeof contagem === "object" ? contagem.status ?? 0 : 0;
  };
  const pedidosPorStatus = {
    pendente: quantidadeStatus("pendente"),
    em_preparo: quantidadeStatus("em_preparo"),
    saiu_entrega: quantidadeStatus("saiu_entrega"),
    entregue: quantidadeStatus("entregue"),
    cancelado: quantidadeStatus("cancelado"),
  };

  return (
    <div className="space-y-6">
      {/* Notificador de novos pedidos (realtime) */}
      <AdminOrderRealtimeNotifier />
      {/* Cabeçalho */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-orange-100 p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl font-bold bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent flex items-center">
              <ShoppingCart className="w-10 h-10 mr-4 text-orange-600" />
              Pedidos
            </h1>
            <p className="text-gray-600 mt-2">
              Gerencie todos os pedidos recebidos
            </p>
          </div>
          <div className="flex items-center gap-2">
            <LimparPedidosTesteButton />
            <ZerarPedidosButton />
          </div>
        </div>
      </div>

      <form className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm" method="GET">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <label className="flex-1 text-sm font-bold text-gray-700">
            <span className="mb-1.5 flex items-center gap-2"><CalendarDays className="h-4 w-4 text-orange-500" /> Período</span>
            <select name="periodo" defaultValue={periodo} className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 font-medium">
              <option value="todos">Todos os pedidos</option>
              <option value="hoje">Somente hoje</option>
              <option value="data">Escolher uma data</option>
            </select>
          </label>
          <label className="flex-1 text-sm font-bold text-gray-700">
            <span className="mb-1.5 block">Data específica</span>
            <input type="date" name="data" defaultValue={dataSelecionada} className="h-10 w-full rounded-lg border border-gray-300 px-3" />
          </label>
          <button type="submit" className="h-10 rounded-lg bg-linear-to-r from-orange-500 to-red-500 px-6 font-bold text-white shadow-sm hover:shadow-md">
            Aplicar filtro
          </button>
        </div>
      </form>

      {/* Resumo por Status */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white border-2 border-yellow-300 rounded-2xl p-5 hover:shadow-xl hover:scale-105 transition-all duration-300">
          <Clock className="w-7 h-7 text-yellow-600 mb-3" />
          <p className="text-3xl font-extrabold text-yellow-900">
            {pedidosPorStatus.pendente}
          </p>
          <p className="text-sm font-semibold text-yellow-700 uppercase tracking-wide">
            Pendentes
          </p>
        </div>

        <div className="bg-white border-2 border-blue-300 rounded-2xl p-5 hover:shadow-xl hover:scale-105 transition-all duration-300">
          <Package className="w-7 h-7 text-blue-600 mb-3" />
          <p className="text-3xl font-extrabold text-blue-900">
            {pedidosPorStatus.em_preparo}
          </p>
          <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">
            Em Preparo
          </p>
        </div>

        <div className="bg-white border-2 border-purple-300 rounded-2xl p-5 hover:shadow-xl hover:scale-105 transition-all duration-300">
          <Truck className="w-7 h-7 text-purple-600 mb-3" />
          <p className="text-3xl font-extrabold text-purple-900">
            {pedidosPorStatus.saiu_entrega}
          </p>
          <p className="text-sm font-semibold text-purple-700 uppercase tracking-wide">
            Em Entrega
          </p>
        </div>

        <div className="bg-white border-2 border-green-300 rounded-2xl p-5 hover:shadow-xl hover:scale-105 transition-all duration-300">
          <CheckCircle className="w-7 h-7 text-green-600 mb-3" />
          <p className="text-3xl font-extrabold text-green-900">
            {pedidosPorStatus.entregue}
          </p>
          <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">
            Entregues
          </p>
        </div>

        <div className="bg-white border-2 border-red-300 rounded-2xl p-5 hover:shadow-xl hover:scale-105 transition-all duration-300">
          <XCircle className="w-7 h-7 text-red-600 mb-3" />
          <p className="text-3xl font-extrabold text-red-900">
            {pedidosPorStatus.cancelado}
          </p>
          <p className="text-sm font-semibold text-red-700 uppercase tracking-wide">
            Cancelados
          </p>
        </div>
      </div>

      {/* Lista de Pedidos */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-100 overflow-x-auto">
        <div className="p-6 border-b border-orange-100 bg-linear-to-r from-orange-50 to-red-50">
          <h2 className="text-xl font-bold text-gray-900">
            Pedidos encontrados ({totalPedidos})
          </h2>
        </div>

        <div className="divide-y divide-orange-100">
          {pedidos.length > 0 ? (
            pedidos.map((pedido) => (
              <div
                key={pedido.id}
                className="p-4 md:p-6 hover:bg-orange-50/50 transition-all duration-200"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4 space-y-4 lg:space-y-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-3">
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 wrap-break-word">
                        Pedido #{pedido.id}
                        {(pedido as unknown as { dailyNumber?: number })
                          .dailyNumber && (
                          <span className="ml-2 text-xs md:text-sm font-medium px-2 md:px-3 py-1 bg-orange-100 text-orange-700 rounded-full whitespace-nowrap">
                            hoje: #
                            {
                              (pedido as unknown as { dailyNumber?: number })
                                .dailyNumber
                            }
                          </span>
                        )}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-bold border-2 shadow-sm ${getStatusColor(pedido.status)}`}
                        >
                          <span className="mr-1 md:mr-2">
                            {getStatusIcon(pedido.status)}
                          </span>
                          <span className="hidden sm:inline">
                            {getStatusLabel(pedido.status)}
                          </span>
                        </span>
                        <PedidoStatusControls
                          id={pedido.id}
                          currentStatus={pedido.status}
                        />
                      </div>
                    </div>

                    <div className="text-xs md:text-sm text-gray-700 space-y-2 bg-gray-50 rounded-lg p-3 md:p-4 border border-gray-200">
                      <p className="wrap-break-word">
                        <strong className="text-gray-900">Cliente:</strong>{" "}
                        {pedido.nomeCliente}
                      </p>
                      {pedido.telefone && (
                        <p className="wrap-break-word">
                          <strong className="text-gray-900">Telefone:</strong>{" "}
                          {pedido.telefone}
                        </p>
                      )}
                      {pedido.endereco && (
                        <p className="wrap-break-word">
                          <strong className="text-gray-900">Endereço:</strong>{" "}
                          {pedido.endereco}
                        </p>
                      )}
                      <p className="wrap-break-word">
                        <strong className="text-gray-900">Data:</strong>{" "}
                        {new Date(pedido.createdAt).toLocaleString("pt-BR", {
                          timeZone: "America/Sao_Paulo",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="text-left lg:text-right lg:ml-6 shrink-0">
                    <p className="text-2xl md:text-3xl font-extrabold text-orange-600 mb-3">
                      R${" "}
                      {Number(pedido.valorTotal).toFixed(2).replace(".", ",")}
                    </p>
                    <div className="flex flex-col gap-2">
                      <Link
                        href={`/admin/pedidos/print/${pedido.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-4 py-2 bg-linear-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all text-sm md:text-base"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver / Imprimir
                      </Link>
                      <Link
                        href={`/admin/pedidos/${pedido.id}/editar`}
                        className="inline-flex items-center justify-center rounded-lg border-2 border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-700 transition hover:border-orange-300 hover:bg-orange-50 md:text-base"
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar pedido
                      </Link>
                      {/* Botão de excluir (componente cliente) */}
                      <DeletePedidoButton id={pedido.id} />
                    </div>
                  </div>
                </div>

                {/* Itens do Pedido */}
                <div className="bg-linear-to-br from-orange-50 to-red-50 rounded-xl p-5 mt-4 border-2 border-orange-200">
                  <p className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">
                    Itens do pedido:
                  </p>
                  <div className="space-y-2">
                    {pedido.itens.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between gap-3 text-sm bg-white rounded-lg p-3 shadow-sm"
                      >
                        <div className="text-gray-700 font-medium">
                          <span className="inline-block w-8 h-8 bg-orange-500 text-white rounded-full text-center leading-8 font-bold mr-2">
                            {item.quantidade}
                          </span>
                          {item.nomePrato}
                          {item.tamanho && (
                            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                              {item.tamanho}
                            </span>
                          )}
                          {(item as unknown as { bordaNome?: string })
                            .bordaNome && (
                            <p className="mt-1 text-xs text-[#8b5e00]">
                              Borda extra:{" "}
                              {
                                (item as unknown as { bordaNome?: string })
                                  .bordaNome
                              }
                              {(
                                item as unknown as {
                                  bordaPreco?: number | string;
                                }
                              ).bordaPreco
                                ? " (incluída no subtotal)"
                                : ""}
                            </p>
                          )}
                          {item.observacoes && (
                            <p className="mt-1 text-xs text-gray-500">
                              {item.observacoes}
                            </p>
                          )}
                        </div>
                        <span className="font-bold text-gray-900 whitespace-nowrap">
                          R${" "}
                          {Number(item.subtotal).toFixed(2).replace(".", ",")}
                        </span>
                      </div>
                    ))}
                    {(() => {
                      const subtotalItens = calcularSubtotalItens(pedido.itens);
                      const taxaEntrega = calcularTaxaEntrega(
                        pedido.valorTotal,
                        subtotalItens,
                      );
                      if (taxaEntrega <= 0) return null;
                      return (
                        <>
                          <div className="flex justify-between gap-3 rounded-lg border border-dashed border-orange-200 bg-white/80 px-3 py-2 text-sm text-gray-600">
                            <span>Subtotal dos itens</span>
                            <span className="font-semibold">
                              R$ {subtotalItens.toFixed(2).replace(".", ",")}
                            </span>
                          </div>
                          <div className="flex justify-between gap-3 rounded-lg border border-dashed border-orange-200 bg-white/80 px-3 py-2 text-sm text-gray-600">
                            <span>Taxa de entrega</span>
                            <span className="font-semibold">
                              R$ {taxaEntrega.toFixed(2).replace(".", ",")}
                            </span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {pedido.observacoes && (
                  <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-300 rounded-xl">
                    <p className="text-sm text-blue-900 font-medium">
                      <strong>Observações:</strong> {pedido.observacoes}
                    </p>
                  </div>
                )}

                {/* Avaliação do Pedido */}
                {pedido.avaliacao && (
                  <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= pedido.avaliacao!.estrelas
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-bold text-gray-700">
                        {pedido.avaliacao.estrelas}/5 estrelas
                      </span>
                    </div>
                    {pedido.avaliacao.comentario && (
                      <p className="text-sm text-gray-700 mt-2">
                        <strong>Comentário:</strong>{" "}
                        {pedido.avaliacao.comentario}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Avaliado em{" "}
                      {new Date(pedido.avaliacao.createdAt).toLocaleString(
                        "pt-BR",
                        { timeZone: "America/Sao_Paulo" },
                      )}
                    </p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-16 text-center">
              <ShoppingCart className="w-16 h-16 text-orange-300 mx-auto mb-4" />
              <p className="text-gray-500 text-xl font-medium">
                Nenhum pedido recebido ainda
              </p>
            </div>
          )}
        </div>
        {totalPedidos > 0 && (
          <div className="flex flex-col gap-3 border-t border-orange-100 bg-orange-50/40 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-600">
              Exibindo <strong>{(pagina - 1) * POR_PAGINA + 1}</strong> a <strong>{Math.min(pagina * POR_PAGINA, totalPedidos)}</strong> de <strong>{totalPedidos}</strong>
            </p>
            <div className="flex items-center gap-2">
              {pagina > 1 ? (
                <Link href={urlPagina(pagina - 1)} className="inline-flex h-9 items-center rounded-lg border bg-white px-3 text-sm font-bold text-gray-700 hover:bg-gray-50"><ChevronLeft className="mr-1 h-4 w-4" /> Anterior</Link>
              ) : <span className="inline-flex h-9 items-center rounded-lg border bg-gray-100 px-3 text-sm font-bold text-gray-400"><ChevronLeft className="mr-1 h-4 w-4" /> Anterior</span>}
              <span className="min-w-24 text-center text-sm font-bold text-gray-700">{pagina} de {totalPaginas}</span>
              {pagina < totalPaginas ? (
                <Link href={urlPagina(pagina + 1)} className="inline-flex h-9 items-center rounded-lg border bg-white px-3 text-sm font-bold text-gray-700 hover:bg-gray-50">Próxima <ChevronRight className="ml-1 h-4 w-4" /></Link>
              ) : <span className="inline-flex h-9 items-center rounded-lg border bg-gray-100 px-3 text-sm font-bold text-gray-400">Próxima <ChevronRight className="ml-1 h-4 w-4" /></span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
