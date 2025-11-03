"use client"

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

type Props = {
  onUploaded: (url: string) => void
  bucket?: string
  prefix?: string
}

export default function UploadImagem({ onUploaded, bucket = 'pratos', prefix = 'uploads' }: Props) {
  const [uploading, setUploading] = useState(false)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)

      // Criar FormData para enviar o arquivo
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', bucket)
      formData.append('prefix', prefix)

      // Fazer upload via API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Falha no upload')
      }

      const { url } = await response.json()
      onUploaded(url)
      toast.success('Imagem enviada!')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha no upload'
      toast.error(message)
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex gap-2 items-center">
      <Input type="file" accept="image/*" onChange={handleFile} disabled={uploading} />
      {uploading && <span className="text-sm text-gray-600">Enviando...</span>}
    </div>
  )
}
