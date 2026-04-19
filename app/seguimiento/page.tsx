"use client"

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { CheckCircle, Clock, ChefHat, Truck, Loader2, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

const statusSteps = [
  { id: 'recibido',    label: 'Pedido Recibido',  icon: CheckCircle, description: 'Tu pedido ha sido confirmado' },
  { id: 'preparacion', label: 'En Preparación',   icon: ChefHat,     description: 'Estamos preparando tu pedido' },
  { id: 'en-camino',  label: 'En Camino',          icon: Truck,       description: 'Tu pedido está en camino' },
  { id: 'entregado',  label: 'Entregado',           icon: CheckCircle, description: 'Pedido entregado con éxito' },
]

interface DBOrder {
  id: string
  order_number: string
  status: string
  total: number
  created_at: string
  customer: { name: string; phone: string } | null
  items: { product_name: string; quantity: number; total_price: number }[]
}

function SeguimientoContent() {
  const searchParams = useSearchParams()
  const initialId = searchParams.get('pedido') || ''
  const [searchInput, setSearchInput] = useState(initialId)
  const [order, setOrder] = useState<DBOrder | null>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const buscarPedido = async (id?: string) => {
    const query = (id || searchInput).trim()
    if (!query) return
    setLoading(true)
    setSearched(true)

    // Buscar por order_number o por id
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id, order_number, status, total, created_at,
        customer:customers(name, phone),
        items:order_items(product_name, quantity, total_price)
      `)
      .or(`order_number.eq.${query},id.eq.${query}`)
      .single()

    setOrder(!error && data ? data as any : null)
    setLoading(false)
  }

  // Si viene con ?pedido= en la URL, buscar automáticamente
  useState(() => {
    if (initialId) buscarPedido(initialId)
  })

  const getCurrentStep = (status: string) =>
    statusSteps.findIndex(s => s.id === status)

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price)

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16">
        <div className="mx-auto max-w-2xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-medium tracking-widest text-accent uppercase mb-2">
              Estado del Pedido
            </p>
            <h1 className="font-serif text-4xl font-bold text-foreground">Seguimiento</h1>
            <p className="mt-2 text-muted-foreground">Ingresa el número de tu pedido para ver el estado</p>
          </div>

          {/* Buscador */}
          <div className="flex gap-3 mb-8">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && buscarPedido()}
              placeholder="Ej: CW-ABC123"
              className="flex-1 px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <Button
              onClick={() => buscarPedido()}
              disabled={loading}
              className="bg-primary hover:bg-primary/90 px-6"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>

          {/* Resultado */}
          {loading && (
            <div className="flex items-center justify-center py-12 gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Buscando pedido...</span>
            </div>
          )}

          {!loading && searched && !order && (
            <div className="text-center py-12 bg-card rounded-2xl border border-border">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="font-medium text-foreground">Pedido no encontrado</p>
              <p className="text-sm text-muted-foreground mt-1">Verifica el número e intenta de nuevo</p>
            </div>
          )}

          {!loading && order && (
            <div className="space-y-6">
              {/* Número y fecha */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Número de pedido</p>
                    <p className="font-mono text-lg font-bold text-accent">{order.order_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Fecha</p>
                    <p className="text-sm text-foreground">{formatDate(order.created_at)}</p>
                  </div>
                </div>
                {order.customer && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-foreground font-medium">{order.customer.name}</p>
                    <p className="text-sm text-muted-foreground">{order.customer.phone}</p>
                  </div>
                )}
              </div>

              {/* Timeline de estado */}
              <div className="bg-card rounded-2xl border border-border p-8">
                <div className="space-y-6">
                  {statusSteps.map((step, index) => {
                    const Icon = step.icon
                    const currentStep = getCurrentStep(order.status)
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
                            <div className={cn("w-0.5 h-8 mt-1", index < currentStep ? "bg-accent" : "bg-border")} />
                          )}
                        </div>
                        <div className="pt-1.5">
                          <p className={cn("font-medium", isCompleted ? "text-foreground" : "text-muted-foreground")}>
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

              {/* Resumen productos */}
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border">
                  <p className="font-medium text-foreground">Productos</p>
                </div>
                <table className="w-full text-sm">
                  <tbody>
                    {order.items.map((item, i) => (
                      <tr key={i} className="border-b border-border last:border-0">
                        <td className="py-3 px-4 text-foreground">{item.product_name}</td>
                        <td className="py-3 px-4 text-center text-muted-foreground">x{item.quantity}</td>
                        <td className="py-3 px-4 text-right font-medium">{formatPrice(item.total_price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="p-4 border-t border-border flex justify-between">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-serif text-xl font-bold text-accent">{formatPrice(order.total)}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <Link href="/" className="flex-1">
                  <Button variant="outline" className="w-full">Volver al inicio</Button>
                </Link>
                <Link href="/menu" className="flex-1">
                  <Button className="w-full bg-primary hover:bg-primary/90">Hacer otro pedido</Button>
                </Link>
              </div>
            </div>
          )}
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
          <span>Cargando...</span>
        </div>
      </div>
    }>
      <SeguimientoContent />
    </Suspense>
  )
}