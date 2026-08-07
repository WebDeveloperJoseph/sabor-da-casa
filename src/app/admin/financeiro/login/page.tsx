import { BadgeDollarSign, LockKeyhole, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";

import { FinanceLoginForm } from "@/components/admin/financeiro/FinanceLoginForm";
import { requireFinanceAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function FinanceLoginPage() {
  const { authenticated } = await requireFinanceAuth();
  if (authenticated) redirect("/admin/financeiro");

  return (
    <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center py-8">
      <section className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl shadow-slate-900/10 sm:p-9">
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-950 text-white shadow-lg">
              <BadgeDollarSign className="h-7 w-7" />
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
              <ShieldCheck className="h-4 w-4" /> Área protegida
            </span>
          </div>

          <h1 className="mt-7 text-3xl font-black tracking-tight text-slate-950">Acesso financeiro</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Confirme a senha exclusiva para visualizar receitas, despesas e relatórios do caixa.
          </p>

          <FinanceLoginForm />

          <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
            <LockKeyhole className="h-3.5 w-3.5" /> Sessão protegida e temporária
          </p>
        </div>
      </section>
    </div>
  );
}
