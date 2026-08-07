import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "admin_session";
export const FINANCE_SESSION_COOKIE = "finance_session";
const SESSION_DURATION_SECONDS = 8 * 60 * 60;
const FINANCE_SESSION_DURATION_SECONDS = 2 * 60 * 60;
type SessionScope = "admin" | "finance";

function getAdminPassword() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < 8) {
    throw new Error("ADMIN_PASSWORD deve ter pelo menos 8 caracteres");
  }
  return password.replace(/^['"]|['"]$/g, "");
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? getAdminPassword();
}

function getFinancePassword() {
  const password = process.env.FINANCE_PASSWORD;
  if (!password || password.length < 8) {
    throw new Error("FINANCE_PASSWORD deve ter pelo menos 8 caracteres");
  }
  return password.replace(/^['"]|['"]$/g, "");
}

function assinar(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

export function validarSenhaAdmin(password: string) {
  const expected = Buffer.from(getAdminPassword());
  const received = Buffer.from(password);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

function criarSessao(scope: SessionScope, duration: number) {
  const payload = Buffer.from(
    JSON.stringify({ scope, exp: Math.floor(Date.now() / 1000) + duration }),
  ).toString("base64url");
  return `${payload}.${assinar(payload)}`;
}

function verificarSessao(token: string | null | undefined, scope: SessionScope) {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = Buffer.from(assinar(payload));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return false;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      exp?: number;
      scope?: string;
    };
    return data.scope === scope && typeof data.exp === "number" && data.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function criarSessaoAdmin() {
  return criarSessao("admin", SESSION_DURATION_SECONDS);
}

export function verificarSessaoAdmin(token?: string | null) {
  return verificarSessao(token, "admin");
}

export function validarSenhaFinanceiro(password: string) {
  const expected = Buffer.from(getFinancePassword());
  const received = Buffer.from(password);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export function criarSessaoFinanceiro() {
  return criarSessao("finance", FINANCE_SESSION_DURATION_SECONDS);
}

export function verificarSessaoFinanceiro(token?: string | null) {
  return verificarSessao(token, "finance");
}

export async function requireAuth() {
  const cookieStore = await cookies();
  return { authenticated: verificarSessaoAdmin(cookieStore.get(ADMIN_SESSION_COOKIE)?.value) };
}

export async function requireFinanceAuth() {
  const cookieStore = await cookies();
  const adminAuthenticated = verificarSessaoAdmin(
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value,
  );
  const financeAuthenticated = verificarSessaoFinanceiro(
    cookieStore.get(FINANCE_SESSION_COOKIE)?.value,
  );
  return { authenticated: adminAuthenticated && financeAuthenticated };
}

export const adminCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: SESSION_DURATION_SECONDS,
};

export const financeCookieOptions = {
  ...adminCookieOptions,
  maxAge: FINANCE_SESSION_DURATION_SECONDS,
};
