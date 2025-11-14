"use client"

import { Suspense, lazy } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

// Lazy load do componente de carrinho para melhor performance inicial
const CartDialog = lazy(() => import('./CartDialog').then(module => ({ default: module.CartDialog })))

export function LazyCartDialog() {
  return (
    <Suspense fallback={
      <div className="fixed top-4 right-4 z-50">
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    }>
      <CartDialog />
    </Suspense>
  )
}