"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Cake, Loader2, ExternalLink, PartyPopper } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

type Aniversariante = {
  id: number
  nome: string
  telefone: string
  dataNascimento: string
  aceitaPromocoes: boolean
}

type MensagemGerada = {
  clienteId: number
  nome: string
  telefone: string
  mensagem: string
  linkWhatsApp: string
}

export default function AniversariantesPage() {
  const [aniversariantes, setAniversariantes] = useState<Aniversariante[]>([])
  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [mensagensGeradas, setMensagensGeradas] = useState<MensagemGerada[]>([])
  
  const [mensagemTemplate, setMensagemTemplate] = useState(
    "Olá {nome}! 🎉 Feliz aniversário! A equipe do Sabor da Casa deseja um dia maravilhoso! Use o cupom {cupom} para ganhar 15% de desconto hoje!"
  )
  const [cupom, setCupom] = useState("ANIVER15")

  useEffect(() => {
    carregarAniversariantes()
  }, [])

  async function carregarAniversariantes() {
    try {
      setLoading(true)
      const res = await fetch('/api/clientes/aniversariantes-hoje')
      if (!res.ok) throw new Error('Erro ao carregar aniversariantes')
      const data = await res.json()
      setAniversariantes(data.aniversariantes || [])
    } catch (err) {
      toast.error('Erro ao carregar aniversariantes do dia')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function gerarMensagens() {
    try {
      setEnviando(true)
      const res = await fetch('/api/clientes/aniversariantes-hoje', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensagemTemplate, cupom })
      })
      if (!res.ok) throw new Error('Erro ao gerar mensagens')
      const data = await res.json()
      setMensagensGeradas(data.mensagens || [])
      toast.success(`${data.total} mensagens geradas com sucesso!`)
    } catch (err) {
      toast.error('Erro ao gerar mensagens')
      console.error(err)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent flex items-center gap-2">
            <Cake className="w-7 h-7 text-pink-500" />
            Aniversariantes do Dia
          </h1>
          <p className="text-gray-600 mt-1">Envie parabéns automáticos por WhatsApp</p>
        </div>
        <Link href="/admin/clientes" className="text-sm text-gray-600 hover:text-orange-600">
          ← Voltar para Clientes
        </Link>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 border-2 border-pink-200 bg-pink-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aniversariantes Hoje</p>
              <p className="text-3xl font-bold text-pink-600">{aniversariantes.length}</p>
            </div>
            <PartyPopper className="w-10 h-10 text-pink-500" />
          </div>
        </Card>
        <Card className="p-6 border-2 border-green-200 bg-green-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aceitam Promoções</p>
              <p className="text-3xl font-bold text-green-600">
                {aniversariantes.filter(a => a.aceitaPromocoes).length}
              </p>
            </div>
            <Cake className="w-10 h-10 text-green-500" />
          </div>
        </Card>
        <Card className="p-6 border-2 border-blue-200 bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Mensagens Geradas</p>
              <p className="text-3xl font-bold text-blue-600">{mensagensGeradas.length}</p>
            </div>
            <ExternalLink className="w-10 h-10 text-blue-500" />
          </div>
        </Card>
      </div>

      {/* Template da mensagem */}
      <Card className="p-6 border-2 border-orange-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Configurar Mensagem</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template da mensagem (use {"{nome}"} e {"{cupom}"})
            </label>
            <Textarea
              value={mensagemTemplate}
              onChange={(e) => setMensagemTemplate(e.target.value)}
              rows={4}
              className="font-mono text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cupom de desconto</label>
            <Input
              value={cupom}
              onChange={(e) => setCupom(e.target.value)}
              placeholder="Ex: ANIVER15"
            />
          </div>
          <Button
            onClick={gerarMensagens}
            disabled={enviando || aniversariantes.length === 0}
            className="bg-linear-to-r from-orange-500 to-red-500 text-white"
          >
            {enviando ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              `Gerar Mensagens para ${aniversariantes.filter(a => a.aceitaPromocoes).length} clientes`
            )}
          </Button>
        </div>
      </Card>

      {/* Lista de aniversariantes */}
      {loading ? (
        <Card className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500" />
          <p className="text-gray-600 mt-2">Carregando aniversariantes...</p>
        </Card>
      ) : aniversariantes.length === 0 ? (
        <Card className="p-8 text-center border-2 border-dashed border-gray-300">
          <Cake className="w-16 h-16 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 text-lg">Nenhum aniversariante hoje</p>
          <p className="text-gray-500 text-sm mt-1">Volte amanhã para verificar novamente</p>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden border-2 border-orange-100">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-orange-50/80">
                <tr className="text-left">
                  <th className="px-4 py-3 font-semibold text-gray-700">Nome</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Telefone</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Nascimento</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Promoções</th>
                </tr>
              </thead>
              <tbody>
                {aniversariantes.map((a) => (
                  <tr key={a.id} className="border-t hover:bg-orange-50/40">
                    <td className="px-4 py-3 font-medium">{a.nome}</td>
                    <td className="px-4 py-3">{a.telefone}</td>
                    <td className="px-4 py-3">
                      {(() => {
                        // a.dataNascimento pode vir como ISO string
                        const iso = new Date(a.dataNascimento).toISOString()
                        const [yyyy, mm, dd] = iso.split('T')[0].split('-')
                        return `${dd}/${mm}/${yyyy}`
                      })()}
                    </td>
                    <td className="px-4 py-3">
                      {a.aceitaPromocoes ? (
                        <span className="text-green-600 font-medium">Sim</span>
                      ) : (
                        <span className="text-gray-400">Não</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Mensagens geradas */}
      {mensagensGeradas.length > 0 && (
        <Card className="p-6 border-2 border-green-200 bg-green-50/30">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-green-600" />
            Mensagens Prontas ({mensagensGeradas.length})
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Clique nos links abaixo para abrir o WhatsApp com a mensagem pré-preenchida:
          </p>
          <div className="space-y-3">
            {mensagensGeradas.map((msg) => (
              <div key={msg.clienteId} className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{msg.nome}</p>
                    <p className="text-sm text-gray-600">{msg.telefone}</p>
                    <p className="text-sm text-gray-700 mt-2 italic">&ldquo;{msg.mensagem}&rdquo;</p>
                  </div>
                  <a
                    href={msg.linkWhatsApp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Abrir WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
