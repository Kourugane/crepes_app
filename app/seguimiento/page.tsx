"use client"

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useStore } from '@/context/store-context'
import { Button } from '@/components/ui/button'
import { CheckCircle, Clock, ChefHat, Truck, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const statusSteps = [
  { id: 'recibido',    label: 'Pedido Recibido',   icon: CheckCircle, description: 'Tu pedido ha sido confirmado' },
  { id: 'preparacion', label: 'En Preparación',    icon: ChefHat,     description: 'Estamos preparando tu pedido' },
  { id: 'en-camino',   label: 'En Camino',          icon: Truck,       description: 'Tu pedido está en camino' },
  { id: 'entregado',   label: 'Entregado',           icon: CheckCircle, description: 'Pedido entregado con éxito' },
]

function SeguimientoContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('pedido')
  const { orders } = useStore()

  const order = orders.find(o => o.id === orderId)

  const getCurrentStep = (status: string) => {
    return statusSteps.findIndex(s => s.id === status)
  }

  if (!orderId || !order) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
              <Clock className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-foreground mb-4">
              Pedido no encontrado
            </h1>
            <p className="text-muted-foreground mb-6">
              No encontramos información sobre este pedido.
            </p>
            <Link href="/">
              <Button>Volver al inicio</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const currentStep = getCurrentStep(order.status)

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16">
        <div className="mx-auto max-w-2xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-medium tracking-widest text-accent uppercase mb-2">
              Estado del Pedido
            </p>
            <h1 className="font-serif text-4xl font-bold text-foreground">
              Seguimiento
            </h1>
            <p className="mt-2 font-mono text-accent">{order.order_number || order.id}</p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-8">
            <div className="space-y-6">
              {statusSteps.map((step, index) => {
                const Icon = step.icon
                const isCompleted = index <= currentStep
                const isCurrent = index === currentStep

                return (
                  <div key={step.id} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                        isCompleted
                          ? "bg-accent border-accent text-accent-foreground"
                          : "border-border bg-background text-muted-foreground"
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>
                      {index < statusSteps.length - 1 && (
                        <div className={cn(
                          "w-0.5 h-8 mt-1",
                          index < currentStep ? "bg-accent" : "bg-border"
                        )} />
                      )}
                    </div>
                    <div className="pt-1.5">
                      <p className={cn(
                        "font-medium",
                        isCompleted ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {step.label}
                        {isCurrent && (
                          <span className="ml-2 text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                            Actual
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full">Volver al inicio</Button>
            </Link>
            <Link href="/menu" className="flex-1">
              <Button className="w-full bg-primary hover:bg-primary/90">Hacer otro pedido</Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function SeguimientoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando seguimiento...</span>
        </div>
      </div>
    }>
      <SeguimientoContent />
    </Suspense>
  )
}