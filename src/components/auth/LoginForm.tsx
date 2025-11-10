"use client"

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ password?: string }>({})
  const [attemptCount, setAttemptCount] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [lockTime, setLockTime] = useState(0)

  // Rate limiting: bloqueia após 5 tentativas por 5 minutos
  useEffect(() => {
    const stored = localStorage.getItem('loginAttempts')
    if (stored) {
      const data = JSON.parse(stored)
      const now = Date.now()
      if (data.lockedUntil && data.lockedUntil > now) {
        setIsLocked(true)
        setLockTime(data.lockedUntil)
        const timeLeft = Math.ceil((data.lockedUntil - now) / 1000)
        toast.error(`Muitas tentativas. Tente novamente em ${Math.ceil(timeLeft / 60)} minutos.`)
      } else if (data.count) {
        setAttemptCount(data.count)
      }
    }
  }, [])

  useEffect(() => {
    if (lockTime > 0) {
      const timer = setInterval(() => {
        const now = Date.now()
        if (now >= lockTime) {
          setIsLocked(false)
          setLockTime(0)
          setAttemptCount(0)
          localStorage.removeItem('loginAttempts')
          clearInterval(timer)
          toast.success('Você pode tentar fazer login novamente')
        }
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [lockTime])

  function validateForm(): boolean {
    const newErrors: { password?: string } = {}
    
    if (!password) {
      newErrors.password = 'Senha é obrigatória'
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleFailedAttempt() {
    const newCount = attemptCount + 1
    setAttemptCount(newCount)
    
    if (newCount >= 5) {
      const lockedUntil = Date.now() + 5 * 60 * 1000 // 5 minutos
      localStorage.setItem('loginAttempts', JSON.stringify({ count: newCount, lockedUntil }))
      setIsLocked(true)
      setLockTime(lockedUntil)
      toast.error('Muitas tentativas falhadas. Conta bloqueada por 5 minutos.')
    } else {
      localStorage.setItem('loginAttempts', JSON.stringify({ count: newCount }))
      toast.error(`Tentativa ${newCount}/5 falhou. ${5 - newCount} tentativas restantes.`)
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (isLocked) {
      const timeLeft = Math.ceil((lockTime - Date.now()) / 1000)
      toast.error(`Aguarde ${Math.ceil(timeLeft / 60)} minutos antes de tentar novamente`)
      return
    }
    
    if (!validateForm()) {
      return
    }
    
    // Remove aspas se existirem na env var
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD?.replace(/^["']|["']$/g, '') || ''
    
    setLoading(true)
    try {
      console.log('[LoginForm] Tentando login admin...', { 
        passwordLength: password.length, 
        adminPasswordLength: adminPassword.length,
        match: password === adminPassword 
      })
      
      if (password !== adminPassword) {
        console.error('[LoginForm] Senha incorreta')
        handleFailedAttempt()
        throw new Error('Senha incorreta')
      }
      
      // Login bem-sucedido: limpar tentativas e salvar sessão
      localStorage.removeItem('loginAttempts')
      localStorage.setItem('adminAuth', 'true')
      
      // Salvar cookie para o middleware
      document.cookie = 'adminAuth=true; path=/; max-age=86400; SameSite=Lax'
      
      setAttemptCount(0)
      
      toast.success('Bem-vindo de volta! 🎉')
      
      // Aguardar um pouco antes do redirect para garantir que o toast apareça
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const next = redirectTo || searchParams.get('redirectTo') || '/admin'
      console.log('[LoginForm] Redirecionando para:', next)
      
      // Usar window.location ao invés de router.push para garantir reload completo
      window.location.href = next
    } catch (err) {
      let message = 'Falha no login. Verifique sua senha.'
      if (err instanceof Error) {
        message = err.message
      }
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const getLockTimeRemaining = (): string => {
    if (!isLocked || lockTime === 0) return ''
    const timeLeft = Math.ceil((lockTime - Date.now()) / 1000)
    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 w-full">
      {/* Password */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">Senha de Administrador</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (errors.password) setErrors({ ...errors, password: undefined })
            }}
            placeholder="Digite a senha de admin"
            className={`pl-10 pr-10 border-2 focus:ring-2 focus:ring-orange-500 ${
              errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
            }`}
            disabled={isLocked}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
            disabled={isLocked}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        </div>
        {errors.password && (
          <div className="mt-1 flex items-center gap-1 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span>{errors.password}</span>
          </div>
        )}
      </div>

      {/* Lock warning */}
      {isLocked && (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div className="text-sm text-red-800">
            <p className="font-semibold">Conta temporariamente bloqueada</p>
            <p>Tempo restante: {getLockTimeRemaining()}</p>
          </div>
        </div>
      )}

      {/* Attempt counter */}
      {attemptCount > 0 && attemptCount < 5 && !isLocked && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 text-sm text-yellow-800">
          Tentativas: {attemptCount}/5
        </div>
      )}

      <Button
        type="submit"
        disabled={loading || isLocked}
        className="w-full bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
            Entrando...
          </span>
        ) : (
          'Entrar no Painel'
        )}
      </Button>
    </form>
  )
}
