import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  FINANCE_SESSION_COOKIE,
  criarSessaoFinanceiro,
  financeCookieOptions,
  requireAuth,
  validarSenhaFinanceiro,
} from "@/lib/auth";
import { identificadorCliente, limparLimite, verificarLimite } from "@/lib/rate-limit";

const loginSchema = z.object({ password: z.string().min(1).max(200) });

export async function POST(request: NextRequest) {
  const { authenticated: adminAuthenticated } = await requireAuth();
  if (!adminAuthenticated) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  const ip = identificadorCliente(request);
  const chave = `finance-login:${ip}`;
  const limite = verificarLimite(chave, 5, 15 * 60 * 1000);
  if (!limite.permitido) {
    return NextResponse.json(
      { erro: "Muitas tentativas. Aguarde antes de tentar novamente." },
      { status: 429, headers: { "Retry-After": String(limite.retryAfter) } },
    );
  }

  try {
    const parsed = loginSchema.safeParse(await request.json());
    if (!parsed.success || !validarSenhaFinanceiro(parsed.data.password)) {
      await new Promise((resolve) => setTimeout(resolve, 350));
      return NextResponse.json({ erro: "Credenciais inválidas" }, { status: 401 });
    }

    limparLimite(chave);
    const response = NextResponse.json({ sucesso: true });
    response.cookies.set(
      FINANCE_SESSION_COOKIE,
      criarSessaoFinanceiro(),
      financeCookieOptions,
    );
    return response;
  } catch (error) {
    console.error(
      "Erro no login financeiro:",
      error instanceof Error ? error.message : "erro",
    );
    return NextResponse.json({ erro: "Login indisponível" }, { status: 500 });
  }
}
