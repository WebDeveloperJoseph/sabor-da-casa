import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const startedAt = Date.now()
  try {
    // ping simples no banco
    const result = await prisma.$queryRawUnsafe('SELECT 1 as ok') as Array<{ ok: number }>
    const dbOk = Array.isArray(result) && result[0]?.ok === 1
    const durationMs = Date.now() - startedAt

    return NextResponse.json({
      status: 'ok',
      db: { ok: dbOk, durationMs },
      env: {
        nodeEnv: process.env.NODE_ENV,
      }
    })
  } catch (error) {
    const durationMs = Date.now() - startedAt
    return NextResponse.json({
      status: 'error',
      db: { ok: false, durationMs },
      error: error instanceof Error ? error.message : 'unknown error'
    }, { status: 500 })
  }
}
