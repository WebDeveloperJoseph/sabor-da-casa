"use client"

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

type Props = {
  printAuto?: boolean
}

export default function PrintActionsClient({ printAuto }: Props) {
  const btnRef = useRef<HTMLButtonElement | null>(null)

  // Se `printAuto` foi passado, não disparamos a impressão automaticamente.
  // Em vez disso, apenas focamos o botão de imprimir e mostramos uma mensagem
  // para que o usuário confirme a impressão — assim ele vê a pré-visualização primeiro.
  useEffect(() => {
    if (printAuto) {
      btnRef.current?.focus()
    }
  }, [printAuto])

  async function downloadPdf() {
    const el = document.querySelector('.printable') as HTMLElement | null
    if (!el) {
      toast.error('Conteúdo para impressão não encontrado')
      return
    }

    // Fallback simples (compatível sem dependências): abrir nova janela com o conteúdo imprimível e acionar print
    try {
      const printWindow = window.open('', '_blank', 'noopener,noreferrer')
      if (!printWindow) {
        toast.error('Não foi possível abrir nova janela para impressão.')
        return
      }

      const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]')).map((n) => n.outerHTML).join('\n')
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>Comprovante</title>${styles}<style>body{font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; padding:6mm;}</style></head><body>${el.innerHTML}</body></html>`
      printWindow.document.open()
      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        try {
          printWindow.print()
        } catch (e) {
          console.error('Erro ao imprimir na janela de fallback', e)
          toast.error('Erro ao acionar a impressão na janela de pré-visualização. Use "Baixar PDF" para salvar e imprimir manualmente.')
        }
      }, 500)
      toast.success('Janela de impressão aberta. Use "Salvar como PDF" no diálogo para gerar um arquivo se necessário.')
    } catch (e) {
      console.error('Fallback de impressão falhou', e)
      toast.error('Erro ao abrir janela de impressão')
    }
  }

  async function handlePrintClick() {
    // Tentar abrir o diálogo de impressão. Muitos erros relacionados à impressora
    // não disparam exceções aqui (são problemas do driver/spooler), mas ainda
    // capturamos falhas claras e orientamos o usuário para o fallback.
    try {
      window.print()
      toast.success('Diálogo de impressão aberto. Se ocorrer erro, use "Baixar PDF" ou verifique a impressora.')
    } catch (err) {
      console.error('Erro ao chamar window.print()', err)
      toast.error('Ocorreu um erro ao tentar imprimir. Verifique a impressora e tente novamente. Tentando abrir pré-visualização...')
      // tentar abrir fallback automático para que o usuário gere PDF
      await downloadPdf()
    }
  }

  return (
    <div className="mt-6 no-print flex flex-col items-start gap-3">
      {printAuto && (
        <div className="w-full p-3 bg-yellow-50 border-l-4 border-yellow-400 text-sm text-yellow-800 rounded">
          Visualização pronta. Clique em &quot;Imprimir&quot; quando quiser confirmar a impressão.
        </div>
      )}

      <div className="flex items-center gap-3">
  <button ref={btnRef} onClick={handlePrintClick} className="px-4 py-2 bg-orange-600 text-white rounded">Imprimir</button>
  <button onClick={downloadPdf} className="px-4 py-2 bg-blue-600 text-white rounded">Baixar PDF</button>
        <a href="/admin/pedidos" className="text-sm text-gray-600">Voltar à lista</a>
      </div>
    </div>
  )
}
