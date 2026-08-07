"use client";

import { useState } from "react";
import { AlertCircle, Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function FinanceLoginForm() {
  const [password, setPassword] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function entrar(event: React.FormEvent) {
    event.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const resposta = await fetch("/api/auth/financeiro/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const corpo = await resposta.json();
      if (!resposta.ok) throw new Error(corpo.erro ?? "Não foi possível entrar");
      // A navegação completa garante que a primeira requisição ao
      // dashboard já inclua o cookie HttpOnly recém-definido na resposta.
      window.location.replace("/admin/financeiro");
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Falha na autenticação");
      setPassword("");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <form onSubmit={entrar} className="mt-8 space-y-5">
      <label className="block">
        <span className="mb-2 block text-sm font-bold text-slate-700">Senha financeira</span>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input
            type={mostrarSenha ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            autoFocus
            required
            disabled={carregando}
            placeholder="Digite a senha de acesso"
            className="h-12 border-slate-300 pl-11 pr-11"
          />
          <button
            type="button"
            onClick={() => setMostrarSenha((valor) => !valor)}
            className="absolute inset-y-0 right-0 grid w-11 place-items-center text-slate-400 hover:text-slate-700"
            aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
          >
            {mostrarSenha ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </label>

      {erro && (
        <div role="alert" className="flex gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {erro}
        </div>
      )}

      <Button type="submit" disabled={carregando} className="h-12 w-full bg-slate-950 font-bold hover:bg-slate-800">
        {carregando ? <><Loader2 className="animate-spin" /> Verificando acesso</> : "Acessar financeiro"}
      </Button>
    </form>
  );
}
