import { createClient } from '@supabase/supabase-js'

// Cliente do Supabase para o browser (chaves públicas)
// Configure em .env.local:
// NEXT_PUBLIC_SUPABASE_URL=...
// NEXT_PUBLIC_SUPABASE_ANON_KEY=...

function stripQuotes(v?: string) {
  if (!v) return v
  const trimmed = v.trim()
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseUrl = stripQuotes(rawUrl)
const supabaseAnonKey = stripQuotes(rawKey)

const isValidUrl = !!supabaseUrl && /^https?:\/\//i.test(supabaseUrl)

export const supabase = isValidUrl && !!supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : undefined

if (!supabase && rawUrl) {
  // Ajuda a diagnosticar em build/prerender quando houver aspas ou URL inválida
  console.warn('[Supabase] URL inválida ou mal formatada em NEXT_PUBLIC_SUPABASE_URL. Verifique se inicia com https e sem aspas.')
}
