"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function AdminError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    // Log detalhado no servidor/console do Vercel sem expor segredo
    console.error('[admin/error] RSC error', {
      message: error?.message,
      digest: error?.digest,
    })
  }, [error])

  return (
    <div className="m-8 rounded-xl border-2 border-red-300 bg-red-50 p-6 text-red-800">
      <h2 className="text-xl font-bold mb-2">Falha ao carregar o painel</h2>
      <p className="mb-2">Ocorreu um erro ao renderizar a página administrativa.</p>
      {error?.digest && (
        <p className="text-sm text-red-700">Código de diagnóstico: {error.digest}</p>
      )}
      <div className="mt-4 flex gap-2">
        <button
          className="px-4 py-2 rounded bg-white border border-red-300 hover:bg-red-100"
          onClick={() => reset()}
        >
          Tentar novamente
        </button>
        <Link
          className="px-4 py-2 rounded bg-white border border-gray-300 hover:bg-gray-100"
          href="/"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  )
}
