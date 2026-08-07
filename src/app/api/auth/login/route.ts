import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  ADMIN_SESSION_COOKIE,
  adminCookieOptions,
  criarSessaoAdmin,
  validarSenhaAdmin,
} from "@/lib/auth";
import { identificadorCliente, limparLimite, verificarLimite } from "@/lib/rate-limit";

const loginSchema = z.object({ password: z.string().min(1).max(200) });

export async function POST(request: NextRequest) {
  const ip = identificadorCliente(request);
  const chave = `admin-login:${ip}`;
  const limite = verificarLimite(chave, 5, 15 * 60 * 1000);
  if (!limite.permitido) {
    return NextResponse.json(
      { erro: "Muitas tentativas. Aguarde antes de tentar novamente." },
      { status: 429, headers: { "Retry-After": String(limite.retryAfter) } },
    );
  }

  try {
    const parsed = loginSchema.safeParse(await request.json());
    if (!parsed.success || !validarSenhaAdmin(parsed.data.password)) {
      await new Promise((resolve) => setTimeout(resolve, 350));
      return NextResponse.json({ erro: "Credenciais inválidas" }, { status: 401 });
    }

    limparLimite(chave);
    const response = NextResponse.json({ sucesso: true });
    response.cookies.set(ADMIN_SESSION_COOKIE, criarSessaoAdmin(), adminCookieOptions);
    return response;
  } catch (error) {
    console.error("Erro no login administrativo:", error instanceof Error ? error.message : "erro");
    return NextResponse.json({ erro: "Login indisponível" }, { status: 500 });
  }
}
