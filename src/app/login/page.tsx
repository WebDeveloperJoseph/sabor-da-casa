"use client"

import LoginForm from '@/components/auth/LoginForm'
import Image from 'next/image'
import { Flame, Shield, Lock } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginContent() {
  const params = useSearchParams()
  const redirectTo = params.get('redirectTo') ?? undefined

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-orange-500 via-red-500 to-pink-600 p-6 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
      
      {/* Floating elements */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Glassmorphism Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-white/50 p-8 md:p-10">
          {/* Logo com animação */}
          <div className="flex justify-center mb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-linear-to-r from-orange-500 to-red-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full bg-white p-3 shadow-2xl ring-4 ring-white/50 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                <Image 
                  src="/img/logoSaborDaCasa.jpg" 
                  alt="Sabor da Casa" 
                  fill
                  className="rounded-full object-contain"
                  priority
                />
              </div>
              {/* Flame icon animado */}
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <Flame className="w-6 h-6 text-white fill-white" />
              </div>
            </div>
          </div>
          
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
              Bem-vindo de volta!
            </h1>
            <p className="text-gray-600 font-medium">Acesse o painel administrativo</p>
          </div>
          
          <LoginForm redirectTo={redirectTo} />
          
          {/* Security badges */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Conexão Segura</span>
              </div>
              <div className="flex items-center gap-1">
                <Lock className="w-4 h-4 text-blue-500" />
                <span>Dados Criptografados</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-white/90 text-sm font-medium drop-shadow-lg">
            Sistema Sabor da Casa © 2025
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white">Carregando…</div>}>
      <LoginContent />
    </Suspense>
  )
}
