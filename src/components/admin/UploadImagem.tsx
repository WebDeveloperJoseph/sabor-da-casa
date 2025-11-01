"use client"

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
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
    if (!supabase) {
      toast.error('Upload indisponível: configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY')
      return
    }
    try {
      setUploading(true)
      const path = `${prefix}/${Date.now()}-${file.name}`
      const { error } = await supabase.storage.from(bucket).upload(path, file, {
        upsert: true,
        contentType: file.type
      })
      if (error) throw error
      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      if (!data?.publicUrl) throw new Error('Não foi possível obter a URL pública')
      onUploaded(data.publicUrl)
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
      <Button type="button" disabled={uploading} onClick={() => {}}>
        {uploading ? 'Enviando...' : 'Enviar'}
      </Button>
    </div>
  )
}
