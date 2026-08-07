import "server-only";

type Tentativas = { count: number; resetAt: number };

const globalRateLimit = globalThis as typeof globalThis & {
  securityRateLimits?: Map<string, Tentativas>;
};

const registros = globalRateLimit.securityRateLimits ?? new Map<string, Tentativas>();
globalRateLimit.securityRateLimits = registros;

export function identificadorCliente(request: Request) {
  return (
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

export function verificarLimite(chave: string, limite: number, janelaMs: number) {
  const agora = Date.now();
  const atual = registros.get(chave);
  if (!atual || atual.resetAt <= agora) {
    registros.set(chave, { count: 1, resetAt: agora + janelaMs });
    return { permitido: true, retryAfter: 0 };
  }

  atual.count += 1;
  if (atual.count > limite) {
    return { permitido: false, retryAfter: Math.ceil((atual.resetAt - agora) / 1000) };
  }
  return { permitido: true, retryAfter: 0 };
}

export function limparLimite(chave: string) {
  registros.delete(chave);
}
