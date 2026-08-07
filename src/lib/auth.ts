import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "admin_session";
const SESSION_DURATION_SECONDS = 8 * 60 * 60;

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

function assinar(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

export function validarSenhaAdmin(password: string) {
  const expected = Buffer.from(getAdminPassword());
  const received = Buffer.from(password);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export function criarSessaoAdmin() {
  const payload = Buffer.from(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS }),
  ).toString("base64url");
  return `${payload}.${assinar(payload)}`;
}

export function verificarSessaoAdmin(token?: string | null) {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = Buffer.from(assinar(payload));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return false;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { exp?: number };
    return typeof data.exp === "number" && data.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export async function requireAuth() {
  const cookieStore = await cookies();
  return { authenticated: verificarSessaoAdmin(cookieStore.get(ADMIN_SESSION_COOKIE)?.value) };
}

export const adminCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: SESSION_DURATION_SECONDS,
};
