"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "./CartProvider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ShoppingCart, Minus, Plus, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CartDialog() {
  const {
    items,
    updateQty,
    updateObs,
    remove,
    subtotal,
    total,
    clear,
    settings,
    lastAddTick,
  } = useCart();
  const [open, setOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [lastOrder, setLastOrder] = useState<null | {
    id: number | null;
    dailyNumber?: number | null;
    nome: string;
    telefone?: string;
    total: string;
    itens: string;
  }>(null);
  const [nomeCliente, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [observacoes, setObs] = useState("");
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState<"dinheiro" | "cartao" | "pix" | "">(
    "",
  );
  const [troco, setTroco] = useState("");

  // Cadastro rápido de cliente (opcional)
  const [salvarDados, setSalvarDados] = useState(false);
  const [email, setEmail] = useState("");
  const [nascimento, setNascimento] = useState(""); // formato YYYY-MM-DD
  const [checandoCliente, setChecandoCliente] = useState(false);
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [cartPulse, setCartPulse] = useState(false);

  const handleFormFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (
      !(
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.getAttribute("role") === "combobox"
      )
    ) {
      return;
    }

    window.setTimeout(() => {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);
  };

  useEffect(() => {
    if (!lastAddTick) return;
    setCartPulse(true);
    const timer = window.setTimeout(() => setCartPulse(false), 280);
    return () => window.clearTimeout(timer);
  }, [lastAddTick]);

  const minOk = subtotal >= Number(settings.pedidoMinimo || 0);
  const itemCount = items.reduce((acc, item) => acc + item.quantidade, 0);

  // link do WhatsApp com mensagem pré-preenchida (quando tivermos o último pedido)
  const waLink = lastOrder
    ? `https://wa.me/5583996444542?text=${encodeURIComponent(
        `Olá, acabei de fazer o pedido ${lastOrder.dailyNumber ? `(nº do dia) #${lastOrder.dailyNumber}` : `#${lastOrder.id}`} no Sabor da Casa.
Nome: ${lastOrder.nome}
Telefone: ${lastOrder.telefone || "-"}
Itens: ${lastOrder.itens}
Total: R$ ${lastOrder.total}
Obrigado!`,
      )}`
    : "https://wa.me/5583996444542";

  async function checkAndPrefillByPhone() {
    const fone = telefone.trim();
    if (!fone || fone.replace(/\D/g, "").length < 8) return;
    try {
      setChecandoCliente(true);
      const res = await fetch(
        `/api/clientes?busca=${encodeURIComponent(fone)}`,
      );
      if (!res.ok) return;
      const lista = await res.json();
      if (Array.isArray(lista) && lista.length > 0) {
        const typed = lista as Array<{
          id?: number;
          telefone?: string;
          nome?: string;
          email?: string;
          endereco?: string;
        }>;
        const exato = typed.find((c) => c.telefone === fone) || typed[0];
        if (exato) {
          if (exato.id) setClienteId(exato.id);
          if (exato.nome && !nomeCliente) setNome(exato.nome);
          if (exato.email && !email) setEmail(exato.email);
          if (exato.endereco && !endereco) setEndereco(exato.endereco);
        }
      }
    } catch (err) {
      console.warn("Falha ao buscar cliente por telefone", err);
    } finally {
      setChecandoCliente(false);
    }
  }

  async function finalizarPedido() {
    try {
      if (!settings.aceitarPedidos) {
        toast.error("Pedidos estão temporariamente pausados.");
        return;
      }
      if (items.length === 0) {
        toast.error("Seu carrinho está vazio.");
        return;
      }
      if (!minOk) {
        toast.error(
          `Pedido mínimo: R$ ${Number(settings.pedidoMinimo).toFixed(2).replace(".", ",")}`,
        );
        return;
      }
      const nomeTrim = nomeCliente.trim();
      if (!nomeTrim) {
        toast.error("Informe seu nome");
        return;
      }
      if (nomeTrim.length < 3) {
        // Back-end exige min(3) pelo schema Zod. Se usuário digitou "Ze" ou 2 letras o pedido falha.
        toast.error("Nome deve ter no mínimo 3 caracteres");
        return;
      }

      // Validar telefone (obrigatório e apenas números)
      const telefoneTrim = telefone.trim();
      if (!telefoneTrim) {
        toast.error("Informe seu telefone");
        return;
      }

      // Remover caracteres não numéricos para validação
      const apenasNumeros = telefoneTrim.replace(/\D/g, "");
      if (apenasNumeros.length < 8) {
        toast.error("Telefone deve ter pelo menos 8 dígitos");
        return;
      }
      if (apenasNumeros.length > 15) {
        toast.error("Telefone muito longo (máximo 15 dígitos)");
        return;
      }

      // Validar endereço (obrigatório)
      const enderecoTrim = endereco.trim();
      if (!enderecoTrim) {
        toast.error("Informe seu endereço");
        return;
      }
      if (enderecoTrim.length < 5) {
        toast.error("Endereço deve ter pelo menos 5 caracteres");
        return;
      }

      // Validar forma de pagamento (obrigatória)
      if (!payment) {
        toast.error("Selecione a forma de pagamento");
        return;
      }

      // Validar troco se pagamento for dinheiro
      if (payment === "dinheiro" && troco) {
        const valorTroco = Number(troco);
        if (isNaN(valorTroco) || valorTroco <= total) {
          toast.error("Valor do troco deve ser maior que o total do pedido");
          return;
        }
      }

      setLoading(true);

      // se usuário optou por salvar dados, cria/associa cliente
      let cid: number | null = clienteId;
      if (salvarDados && nomeCliente.trim() && telefone.trim()) {
        try {
          const resp = await fetch("/api/clientes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nome: nomeCliente.trim(),
              telefone: telefone.trim(),
              email: email.trim() || null,
              dataNascimento: nascimento || null,
              endereco: endereco.trim() || null,
              aceitaWhatsApp: true,
              aceitaEmail: !!email,
              aceitaPromocoes: true,
            }),
          });
          const d = await resp.json();
          if (resp.status === 201 && d?.id) {
            cid = d.id;
            setClienteId(d.id);
          } else if (resp.status === 409 && d?.clienteId) {
            cid = d.clienteId;
            setClienteId(d.clienteId);
          }
        } catch (err) {
          console.warn(
            "Não foi possível salvar o cliente agora, seguindo sem cadastro.",
            err,
          );
        }
      }

      // compor observações com forma de pagamento e troco (se houver)
      const obsComPagamento = [
        observacoes?.trim() || "",
        payment ? `Pagamento: ${payment.toUpperCase()}` : "",
        payment === "dinheiro" && troco
          ? `Troco para R$ ${Number(troco).toFixed(2).replace(".", ",")}`
          : "",
      ]
        .filter(Boolean)
        .join(" | ");

      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomeCliente: nomeTrim,
          telefone,
          endereco,
          observacoes: obsComPagamento,
          clienteId: cid ?? undefined,
          itens: items.map((i) => ({
            pratoId: i.pratoId,
            quantidade: i.quantidade,
            observacoes: i.observacoes,
            tamanho: i.tamanho,
            adicionais: i.adicionais,
            bordaId: i.bordaId,
            bordaNome: i.bordaNome,
            bordaPreco: i.bordaPreco,
            // Para pizzas mistas (pratoId = 999), incluir nome e preço
            ...(i.pratoId === 999 ? { nome: i.nome, preco: i.preco } : {}),
          })),
        }),
      });
      const body = await res.json();
      // debug: logar a resposta do servidor para diagnóstico
      try {
        console.log("Resposta /api/pedidos", res.status, body);
      } catch (err) {
        console.error(err);
      }
      if (!res.ok) {
        // Tentar extrair mensagens de validação detalhadas do Zod (se presentes)
        const detalhes: unknown = body?.detalhes;
        if (detalhes && typeof detalhes === "object" && detalhes !== null) {
          try {
            type ZodErrorShape = {
              fieldErrors?: Record<string, string[] | undefined>;
            };
            const fieldErrors = (detalhes as ZodErrorShape).fieldErrors;
            if (fieldErrors) {
              const mensagens = Object.values(fieldErrors)
                .flat()
                .filter(Boolean) as string[];
              if (mensagens.length > 0) {
                toast.error(mensagens[0]);
                throw new Error(mensagens[0]);
              }
            }
          } catch {
            // ignora se estrutura inesperada
          }
        }
        const msg = body?.erro || "Erro ao finalizar pedido";
        toast.error(msg);
        throw new Error(msg);
      }

      if (!body?.id) {
        // servidor não retornou id como esperado
        console.error("POST /api/pedidos não retornou id:", body);
        toast.error(
          "Erro: servidor não retornou id do pedido. Verifique o servidor.",
        );
        // ainda assim podemos continuar com fallback visual
      }

      // montar resumo dos itens para a mensagem do WhatsApp
      const itensResumo = items
        .map((i) => `${i.quantidade}x ${i.nome}`)
        .join(" | ");

      // salvar último pedido para preparar a mensagem no WhatsApp
      setLastOrder({
        id: body.id ?? null,
        dailyNumber: body.dailyNumber ?? null,
        nome: nomeCliente,
        telefone,
        total: total.toFixed(2),
        itens: itensResumo,
      });

      const exibicao = body.dailyNumber
        ? `${body.dailyNumber} (hoje)`
        : body.id;

      toast.success(`Pedido ${exibicao} recebido!`);
      // limpar carrinho e campos do formulário
      clear();
      setOpen(false);
      setShowConfirm(true);
      setNome("");
      setTelefone("");
      setEndereco("");
      setObs("");
      setPayment("");
      setTroco("");
      setSalvarDados(false);
      setEmail("");
      setNascimento("");
      setClienteId(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao finalizar pedido";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Botões fixos no canto inferior direito */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 hidden sm:flex flex-col gap-2 sm:gap-3 z-50">
        {/* Botão Meus Pedidos */}
        <Link href="/meus-pedidos">
          <Button className="w-full gap-1 bg-[#b50008] px-3 py-2 text-xs shadow-lg hover:bg-[#970006] sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
            <span className="hidden sm:inline">Meus Pedidos</span>
            <span className="sm:hidden">Pedidos</span>
          </Button>
        </Link>

        {/* Botão Carrinho */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              className={`gap-1 bg-[#d71920] px-3 py-2 text-xs shadow-lg hover:bg-[#b50008] sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm ${cartPulse ? "anim-soft-bounce" : ""}`}
            >
              <ShoppingCart
                className={`w-4 h-4 sm:w-5 sm:h-5 ${cartPulse ? "anim-soft-bounce" : ""}`}
              />
              <span className="hidden sm:inline">Carrinho ({itemCount})</span>
              <span className="sm:hidden">({itemCount})</span>
            </Button>
          </DialogTrigger>
          <DialogContent
            onFocusCapture={handleFormFocus}
            className="h-dvh w-screen overflow-y-auto overscroll-contain rounded-none border-0 bg-[#fff7ea] p-4 pb-[calc(env(safe-area-inset-bottom)+6.5rem)] shadow-2xl touch-pan-y sm:h-auto sm:max-h-[92vh] sm:w-[96vw] sm:rounded-[1.75rem] sm:p-6 md:max-w-3xl"
          >
            <DialogHeader className="mb-2">
              <div className="mx-auto text-center leading-none">
                <div className="text-2xl font-black text-[#9a0007]">
                  Sabor da Casa
                </div>
                <div className="text-xs font-black tracking-[0.35em] text-[#b6782b]">
                  PIZZARIA
                </div>
              </div>
              <DialogTitle className="mt-3 text-left text-3xl font-black text-[#4b0909] sm:text-4xl">
                Meu pedido
              </DialogTitle>
              <p className="text-left text-sm font-medium text-[#6f6461]">
                Confira seus itens e finalize com seguranca.
              </p>
            </DialogHeader>

            <div className="grid md:grid-cols-5 gap-4 sm:gap-6">
              {/* Itens */}
              <div className="space-y-2 sm:space-y-3 md:col-span-3">
                {items.length === 0 ? (
                  <p className="text-sm sm:text-base text-gray-500">
                    Seu carrinho está vazio.
                  </p>
                ) : (
                  items.map((item) => {
                    const chave = `${item.pratoId}-${item.tamanho || ""}-${item.observacoes || ""}`;
                    return (
                      <div
                        key={chave}
                        className="grid gap-3 overflow-hidden rounded-2xl border border-[#ead7bd] bg-white p-3 shadow-sm"
                      >
                        {/* Linha superior: nome, valor, controles de quantidade */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p
                              className="truncate text-base font-black text-[#241313]"
                              title={item.nome}
                            >
                              {item.nome}
                            </p>
                            {item.tamanho && (
                              <span className="mt-1 inline-block rounded-full bg-[#fff0f0] px-2 py-0.5 text-[10px] font-bold text-[#c90010] sm:text-xs">
                                {item.tamanho} -{" "}
                                {item.tamanho === "P"
                                  ? "4 fatias"
                                  : item.tamanho === "M"
                                    ? "6 fatias"
                                    : "8 fatias"}
                              </span>
                            )}
                            <p className="mt-1 text-sm font-bold text-[#6f6461]">
                              R$ {item.preco.toFixed(2).replace(".", ",")}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2 self-end sm:self-auto">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 rounded-xl border-[#ead7bd]"
                              onClick={() =>
                                updateQty(
                                  item.pratoId,
                                  item.quantidade - 1,
                                  item.tamanho,
                                  item.observacoes,
                                )
                              }
                            >
                              <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <span className="w-5 sm:w-6 text-center text-sm sm:text-base">
                              {item.quantidade}
                            </span>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 rounded-xl border-[#ead7bd]"
                              onClick={() =>
                                updateQty(
                                  item.pratoId,
                                  item.quantidade + 1,
                                  item.tamanho,
                                  item.observacoes,
                                )
                              }
                            >
                              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="destructive"
                              className="h-8 w-8 rounded-xl bg-[#fff0f0] text-[#d71920] hover:bg-[#ffd9d9]"
                              onClick={() =>
                                remove(
                                  item.pratoId,
                                  item.tamanho,
                                  item.observacoes,
                                )
                              }
                            >
                              <Trash className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                        </div>
                        {/* Observações do item em largura total do card */}
                        <div>
                          <Textarea
                            placeholder="Observações (ex: sem cebola)"
                            value={item.observacoes || ""}
                            onChange={(e) =>
                              updateObs(
                                item.pratoId,
                                e.target.value,
                                item.tamanho,
                                item.observacoes,
                              )
                            }
                            className="min-h-10 w-full max-h-24 resize-none overflow-y-auto rounded-xl border-[#ead7bd] text-xs field-sizing-fixed sm:min-h-12 sm:text-sm md:min-h-16"
                          />
                        </div>
                      </div>
                    );
                  })
                )}

                <div className="space-y-2 rounded-2xl border border-[#ead7bd] bg-white p-4 text-sm text-[#241313] shadow-sm">
                  <p className="flex justify-between">
                    Subtotal:{" "}
                    <strong>R$ {subtotal.toFixed(2).replace(".", ",")}</strong>
                  </p>
                  <p className="flex justify-between">
                    Taxa de entrega:{" "}
                    <strong>
                      R${" "}
                      {Number(settings.taxaEntrega || 0)
                        .toFixed(2)
                        .replace(".", ",")}
                    </strong>
                  </p>
                  <p className="flex justify-between border-t border-[#ead7bd] pt-3 text-lg font-black">
                    Total:{" "}
                    <strong className="text-[#c90010]">
                      R$ {total.toFixed(2).replace(".", ",")}
                    </strong>
                  </p>
                  {!minOk && (
                    <p className="text-xs sm:text-sm text-red-600">
                      Pedido mínimo: R${" "}
                      {Number(settings.pedidoMinimo)
                        .toFixed(2)
                        .replace(".", ",")}
                    </p>
                  )}
                </div>
              </div>

              {/* Dados do cliente e pagamento */}
              <div className="space-y-4 sm:space-y-6 md:col-span-2">
                {/* Aviso sobre dados obrigatórios */}
                <div className="bg-orange-50 border-l-4 border-orange-500 p-2 sm:p-4 rounded">
                  <div className="flex">
                    <div className="shrink-0">
                      <svg
                        className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-2 sm:ml-3">
                      <p className="text-[10px] sm:text-sm text-orange-700">
                        <strong>Atenção:</strong> Preencha seu nome para
                        finalizar. Telefone e endereço são recomendados.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-900">
                    Dados do cliente
                  </h4>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Seu nome <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={nomeCliente}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Nome completo"
                      required
                      className={`text-sm ${!nomeCliente.trim() ? "border-orange-300" : ""}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Telefone{" "}
                      <span className="text-gray-400 text-[10px] sm:text-xs">
                        (recomendado)
                      </span>
                    </label>
                    <Input
                      value={telefone}
                      onChange={(e) => {
                        // Permitir números, parênteses, espaços, hífens e mais (+)
                        const value = e.target.value.replace(
                          /[^0-9()\s\-+]/g,
                          "",
                        );
                        setTelefone(value);
                      }}
                      onBlur={checkAndPrefillByPhone}
                      placeholder="(DDD) 9 9999-9999"
                      disabled={loading || checandoCliente}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Endereço{" "}
                      <span className="text-gray-400 text-[10px] sm:text-xs">
                        (recomendado)
                      </span>
                    </label>
                    <Input
                      value={endereco}
                      onChange={(e) => setEndereco(e.target.value)}
                      placeholder="Rua, número, bairro"
                      className="text-sm"
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <label className="inline-flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-800">
                    <input
                      type="checkbox"
                      className="rounded h-3 w-3 sm:h-4 sm:w-4"
                      checked={salvarDados}
                      onChange={(e) => setSalvarDados(e.target.checked)}
                    />
                    Salvar dados para próximos pedidos
                  </label>
                  {salvarDados && (
                    <div className="mt-2 sm:mt-3 space-y-2 sm:space-y-3">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          Email (opcional)
                        </label>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="seuemail@exemplo.com"
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          Data de nascimento (opcional)
                        </label>
                        <Input
                          type="date"
                          value={nascimento}
                          onChange={(e) => setNascimento(e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <p className="text-[10px] sm:text-xs text-gray-500">
                        Ao salvar, você concorda em receber comunicações sobre
                        seu pedido e promoções.
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-900">
                    Pagamento
                  </h4>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Forma de pagamento
                    </label>
                    <Select
                      value={payment}
                      onValueChange={(v) => setPayment(v as typeof payment)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="cartao">Cartão</SelectItem>
                        <SelectItem value="pix">Pix</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {payment === "dinheiro" && (
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Troco para
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 100,00"
                        value={troco}
                        onChange={(e) => setTroco(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <Button
                    className="w-full bg-orange-600 hover:bg-orange-700 text-sm sm:text-base py-5 sm:py-6"
                    disabled={
                      loading ||
                      items.length === 0 ||
                      !minOk ||
                      !settings.aceitarPedidos
                    }
                    onClick={finalizarPedido}
                  >
                    {settings.aceitarPedidos
                      ? loading
                        ? "Enviando..."
                        : "Finalizar Pedido"
                      : "Pedidos pausados"}
                  </Button>
                </div>
              </div>

              {/* Observações gerais em largura total */}
              <div className="md:col-span-5">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Observações gerais
                </label>
                <Textarea
                  value={observacoes}
                  onChange={(e) => setObs(e.target.value)}
                  placeholder="Ex: entregar pelo portão lateral"
                  className="h-24 min-h-24 max-h-24 w-full resize-none overflow-y-auto text-xs field-sizing-fixed sm:text-sm"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Barra fixa mobile */}
      {itemCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[calc(env(safe-area-inset-bottom)+0.6rem)] pt-2 sm:hidden">
          <div className="mx-auto flex max-w-3xl items-center gap-3 rounded-[1.7rem] bg-[#b50008] p-3 text-white shadow-2xl">
            <button
              type="button"
              onClick={() =>
                itemCount > 0
                  ? setOpen(true)
                  : toast.info("Escolha uma pizza para comecar seu pedido")
              }
              className={`relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-[#b50008] hover:bg-[#fff5e6] ${cartPulse ? "anim-soft-bounce" : ""}`}
              aria-label="Carrinho"
            >
              <ShoppingCart className="h-7 w-7" />
              {itemCount > 0 && (
                <span
                  className={`absolute -right-1 -top-2 grid h-6 min-w-6 place-items-center rounded-full bg-[#ffd15a] px-1 text-xs font-black text-[#2b1212] ${cartPulse ? "anim-soft-bounce" : ""}`}
                >
                  {itemCount}
                </span>
              )}
            </button>
            <Link href="/meus-pedidos" className="hidden">
              <Button
                variant="outline"
                className="relative h-14 w-14 rounded-2xl border-0 bg-white p-0 text-[#b50008] hover:bg-[#fff5e6]"
                aria-label="Meus pedidos"
              >
                <ShoppingCart className="h-7 w-7" />
                {itemCount > 0 && (
                  <span className="absolute -right-1 -top-2 grid h-6 min-w-6 place-items-center rounded-full bg-[#ffd15a] px-1 text-xs font-black text-[#2b1212]">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>

            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-black">
                {itemCount} {itemCount === 1 ? "item" : "itens"} no carrinho
              </p>
              <p className="text-sm font-semibold text-white/85">
                R$ {total.toFixed(2).replace(".", ",")}
              </p>
            </div>

            <Button
              onClick={() =>
                itemCount > 0
                  ? setOpen(true)
                  : toast.info("Escolha uma pizza para comecar seu pedido")
              }
              className="h-14 shrink-0 rounded-2xl bg-[#ffd15a] px-5 text-base font-black text-[#241313] hover:bg-[#ffc329]"
            >
              {itemCount > 0 ? "Ver carrinho" : "Escolher"}
            </Button>
          </div>
        </div>
      )}

      {/* Modal de confirmação pós-pedido */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 max-w-lg w-full text-center flex flex-col items-center gap-3 sm:gap-4">
            <h2 className="text-lg sm:text-xl font-bold text-orange-700 mb-1 sm:mb-2">
              Pedido recebido!
            </h2>
            <p className="text-sm sm:text-base text-gray-700">
              Seu pedido foi recebido e está sendo processado.
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>Avisaremos quando o entregador
              sair!
            </p>

            {/* Aviso de segurança */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3 sm:p-4 mb-1 sm:mb-2">
              <div className="flex items-start gap-2">
                <span className="text-yellow-600 text-base sm:text-lg">⚠️</span>
                <div className="text-left">
                  <h3 className="text-sm sm:text-base font-bold text-yellow-800 mb-1">
                    Confirmação Necessária
                  </h3>
                  <p className="text-xs sm:text-sm text-yellow-700">
                    <strong>
                      Por segurança, confirme seu pedido no WhatsApp.
                    </strong>
                    <br className="hidden sm:block" />
                    <span className="hidden sm:inline">
                      Isso garante que seu pedido seja processado corretamente.
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 w-full">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-green-500 hover:bg-green-600 text-white font-bold shadow-lg text-xs sm:text-sm cursor-pointer animate-pulse w-full max-w-xs"
              >
                <span>📱</span>
                <span className="hidden sm:inline">
                  Confirmar Pedido no WhatsApp
                </span>
                <span className="sm:hidden">Confirmar no WhatsApp</span>
              </a>

              {lastOrder && lastOrder.id ? (
                <div className="text-xs sm:text-sm text-gray-500 px-2">
                  Comprovante disponível no painel.
                </div>
              ) : (
                <div className="text-xs sm:text-sm text-gray-500 px-2">
                  Comprovante disponível após confirmação.
                </div>
              )}

              {/* Link para acompanhar pedido */}
              <Link
                href="/meus-pedidos"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow text-xs sm:text-sm w-full max-w-xs"
              >
                Ver Meus Pedidos
              </Link>
            </div>
            <Button
              className="mt-2 bg-orange-600 hover:bg-orange-700 text-sm w-full max-w-xs"
              onClick={() => setShowConfirm(false)}
            >
              Fechar
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
