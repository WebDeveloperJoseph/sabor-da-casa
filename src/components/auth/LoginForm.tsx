"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, Eye, EyeOff, Lock } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.erro ?? "Não foi possível entrar");

      toast.success("Bem-vindo de volta!");
      const requested = redirectTo || searchParams.get("redirectTo");
      const destination = requested?.startsWith("/admin") ? requested : "/admin";
      window.location.assign(destination);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha no login";
      setError(message);
      setPassword("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full space-y-6">
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-800">
          Senha de Administrador
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Digite a senha de admin"
            autoComplete="current-password"
            className="border-2 border-gray-300 pl-10 pr-10 focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
            disabled={loading}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
          </button>
        </div>
        {error && (
          <div role="alert" className="mt-2 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-linear-to-r from-orange-500 to-red-500 py-3 font-bold text-white shadow-lg hover:from-orange-600 hover:to-red-600"
      >
        {loading ? "Entrando..." : "Entrar no Painel"}
      </Button>
    </form>
  );
}
