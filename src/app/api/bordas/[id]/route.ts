import { NextResponse } from 'next/server'

// Legacy endpoint removed — keep stub to avoid build errors while routes are being cleaned up.
export async function GET() {
  return NextResponse.json({ message: 'Recurso removido' }, { status: 410 })
}

export async function PUT() {
  return NextResponse.json({ message: 'Recurso removido' }, { status: 410 })
}

export async function DELETE() {
  return NextResponse.json({ message: 'Recurso removido' }, { status: 410 })
}
