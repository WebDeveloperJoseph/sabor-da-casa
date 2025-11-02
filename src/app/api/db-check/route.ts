import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function summarizeDbUrl(raw?: string) {
  try {
    if (!raw) return { defined: false }
    const u = new URL(raw)
    // Nunca retornar usuário/senha
    return {
      defined: true,
      protocol: u.protocol,
      host: u.hostname,
      port: u.port,
      database: u.pathname,
      params: Object.fromEntries(u.searchParams.entries()),
    }
  } catch {
    return { defined: !!raw, parseError: true }
  }
}

export async function GET() {
  const dbUrlInfo = summarizeDbUrl(process.env.DATABASE_URL)
  try {
    // consulta mínima
    const result = await prisma.$queryRawUnsafe('SELECT 1 as ok') as Array<{ ok: number }>
    return NextResponse.json({
      ok: true,
      result,
      env: {
        DATABASE_URL: dbUrlInfo,
      },
    })
  } catch (error) {
    type DbError = { name?: string; message?: string; code?: string | number }
    const err: DbError = (error ?? {}) as DbError
    console.error('[api/db-check] DB error', {
      name: err.name,
      message: err.message,
      code: err.code,
    })
    return NextResponse.json({
      ok: false,
      error: {
        name: err.name,
        message: err.message,
        code: err.code,
      },
      env: {
        DATABASE_URL: dbUrlInfo,
      },
    }, { status: 500 })
  }
}
