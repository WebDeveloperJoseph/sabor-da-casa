"use client"

import { useState, useEffect } from 'react'
import { prisma } from "@/lib/prisma"
import { DollarSign, Lock, Eye, EyeOff, TrendingUp, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Senha de administrador (em produção, isso deveria estar em variável de ambiente)
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_FINANCIAL_PASSWORD || "admin2024"

export default function FinanceiroPage() {
  const [senha, setSenha] = useState('')
  const [autenticado, setAutenticado] = useState(false)
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [dadosFinanceiros, setDadosFinanceiros] = useState<{
    totalMes: number
    pedidosDoMes: number
    mesAno: string
    totalGeral: number
    pedidosGeral: number
    vendasHoje: number
    pedidosHoje: number
  } | null>(null)

  const carregarDados = async () => {
    try {
      const res = await fetch('/api/admin/financeiro')
      if (res.ok) {
        const dados = await res.json()
        setDadosFinanceiros(dados)
      }
    } catch (err) {
      console.error('Erro ao carregar dados financeiros:', err)
    }
  }

  const handleLogin = () => {
    if (senha === ADMIN_PASSWORD) {
      setAutenticado(true)
      setErro('')
      carregarDados()
    } else {
      setErro('Senha incorreta')
      setSenha('')
    }
  }

  const handleLogout = () => {
    setAutenticado(false)
    setSenha('')
    setDadosFinanceiros(null)
  }

  if (!autenticado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-orange-50 to-red-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-orange-200 p-8 w-full max-w-md">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-orange-100 p-4 rounded-full mb-4">
              <Lock className="w-12 h-12 text-orange-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Área Financeira</h1>
            <p className="text-gray-600 text-center">Esta área é protegida. Digite a senha de administrador.</p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Input
                type={mostrarSenha ? "text" : "password"}
                placeholder="Senha de administrador"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {mostrarSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {erro && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {erro}
              </div>
            )}

            <Button
              onClick={handleLogin}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3"
            >
              Entrar
            </Button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700">
              <strong>Nota:</strong> Apenas administradores com a senha correta podem acessar informações financeiras.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-orange-100 p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl font-bold bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent flex items-center">
              <DollarSign className="w-10 h-10 mr-4 text-orange-600" />
              Relatório Financeiro
            </h1>
            <p className="text-gray-600 mt-2">
              Visualização de receitas e estatísticas de vendas
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-orange-300 text-orange-600 hover:bg-orange-50"
          >
            <Lock className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>

      {dadosFinanceiros && (
        <>
          {/* Vendas Hoje */}
          <div className="bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 shadow-xl">
            <div className="flex items-center justify-between text-white">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 opacity-90" />
                  <p className="text-sm font-semibold uppercase tracking-wide opacity-90">
                    Vendas Hoje
                  </p>
                </div>
                <p className="text-5xl font-extrabold mt-2">
                  {dadosFinanceiros.vendasHoje.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <p className="text-sm mt-3 opacity-90">
                  {dadosFinanceiros.pedidosHoje} pedidos hoje
                </p>
              </div>
              <DollarSign className="w-24 h-24 opacity-20" />
            </div>
          </div>

          {/* Total do Mês Atual */}
          <div className="bg-linear-to-br from-orange-500 to-red-500 rounded-2xl p-8 shadow-xl">
            <div className="flex items-center justify-between text-white">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 opacity-90" />
                  <p className="text-sm font-semibold uppercase tracking-wide opacity-90">
                    Total do Mês
                  </p>
                </div>
                <p className="text-lg font-medium opacity-90 mb-1">{dadosFinanceiros.mesAno}</p>
                <p className="text-5xl font-extrabold mt-2">
                  {dadosFinanceiros.totalMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <p className="text-sm mt-3 opacity-90">
                  {dadosFinanceiros.pedidosDoMes} pedidos concluídos
                </p>
              </div>
              <DollarSign className="w-24 h-24 opacity-20" />
            </div>
          </div>

          {/* Total Geral (Todos os Tempos) */}
          <div className="bg-linear-to-br from-green-500 to-emerald-600 rounded-2xl p-8 shadow-xl">
            <div className="flex items-center justify-between text-white">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 opacity-90" />
                  <p className="text-sm font-semibold uppercase tracking-wide opacity-90">
                    Total Geral (Todos os Tempos)
                  </p>
                </div>
                <p className="text-5xl font-extrabold mt-2">
                  {dadosFinanceiros.totalGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <p className="text-sm mt-3 opacity-90">
                  {dadosFinanceiros.pedidosGeral} pedidos concluídos no total
                </p>
              </div>
              <TrendingUp className="w-24 h-24 opacity-20" />
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white border-2 border-orange-200 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Ticket Médio (Mês)</h3>
              <p className="text-3xl font-extrabold text-orange-600">
                {dadosFinanceiros.pedidosDoMes > 0 
                  ? (dadosFinanceiros.totalMes / dadosFinanceiros.pedidosDoMes).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                  : 'R$ 0,00'
                }
              </p>
            </div>

            <div className="bg-white border-2 border-green-200 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Ticket Médio (Geral)</h3>
              <p className="text-3xl font-extrabold text-green-600">
                {dadosFinanceiros.pedidosGeral > 0 
                  ? (dadosFinanceiros.totalGeral / dadosFinanceiros.pedidosGeral).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                  : 'R$ 0,00'
                }
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Nota:</strong> Os valores apresentados incluem apenas pedidos com status &quot;entregue&quot; (excluindo cancelados e pendentes).
            </p>
          </div>
        </>
      )}
    </div>
  )
}
