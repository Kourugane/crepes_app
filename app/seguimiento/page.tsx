"use client"

import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Chatbot } from '@/components/chatbot'
import { useStore } from '@/context/store-context'
import { Button } from '@/components/ui/button'
import { Package, ChefHat, Truck, CheckCircle, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

const statusSteps = [
  { id: 'recibido', label: 'Pedido Recibido', description: 'Tu pedido ha sido confirmado', icon: Package },
  { id: 'preparacion', label: 'En Preparación', description: 'Estamos preparando tu pedido', icon: ChefHat },
  { id: 'en-camino', label: 'En Camino', description: 'Tu pedido está en camino', icon: Truck },
  { id: 'entregado', label: 'Entregado', description: 'Pedido entregado con éxito', icon: CheckCircle },
]

export default function TrackingPage() {
  const searchParams = useSearchParams()
  const initialOrderId = searchParams.get('pedido') || ''
  const [orderId, setOrderId] = useState(initialOrderId)
  const [searchedOrderId, setSearchedOrderId] = useState(initialOrderId)
  const { orders } = useStore()

  const order = useMemo(() => {
    return orders.find(o => o.id === searchedOrderId)
  }, [orders, searchedOrderId])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchedOrderId(orderId.trim().toUpperCase())
  }

  const currentStepIndex = order ? statusSteps.findIndex(s => s.id === order.status) : -1

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          {/* Page header */}
          <div className="text-center mb-12">
            <p className="text-sm font-medium tracking-widest text-accent uppercase mb-2">
              Rastrea tu orden
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground">
              Seguimiento de Pedido
            </h1>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
              Ingresa el número de tu pedido para ver el estado actual de tu orden.
            </p>
          </div>

          {/* Search form */}
          <form onSubmit={handleSearch} className="mb-12">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="Ingresa tu número de pedido (ej: ORD-ABC123)"
                  className="w-full px-5 py-4 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 px-6 rounded-xl"
              >
                <Search className="h-5 w-5" />
                <span className="ml-2 hidden sm:inline">Buscar</span>
              </Button>
            </div>
          </form>

          {/* Order not found */}
          {searchedOrderId && !order && (
            <div className="text-center py-12 bg-card rounded-2xl border border-border">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="font-serif text-xl font-semibold text-foreground mb-2">
                Pedido no encontrado
              </h2>
              <p className="text-muted-foreground">
                No encontramos un pedido con el número <span className="font-mono font-medium">{searchedOrderId}</span>
              </p>
            </div>
          )}

          {/* Order found */}
          {order && (
            <div className="space-y-8">
              {/* Order info card */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Número de pedido</p>
                    <p className="font-mono text-xl font-bold text-accent">{order.id}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="font-serif text-2xl font-bold text-foreground">{formatPrice(order.total)}</p>
                  </div>
                </div>

                {/* Status tracker */}
                <div className="relative">
                  {/* Progress line */}
                  <div className="absolute top-6 left-6 right-6 h-0.5 bg-border hidden sm:block" />
                  <div 
                    className="absolute top-6 left-6 h-0.5 bg-accent hidden sm:block transition-all duration-500"
                    style={{ 
                      width: `calc(${(currentStepIndex / (statusSteps.length - 1)) * 100}% - 48px)` 
                    }}
                  />

                  {/* Steps */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-0">
                    {statusSteps.map((step, index) => {
                      const isCompleted = index <= currentStepIndex
                      const isCurrent = index === currentStepIndex
                      const Icon = step.icon

                      return (
                        <div key={step.id} className="flex sm:flex-col items-center sm:items-center gap-4 sm:gap-0">
                          {/* Icon circle */}
                          <div
                            className={cn(
                              "relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
                              isCompleted
                                ? "bg-accent text-accent-foreground"
                                : "bg-secondary text-muted-foreground"
                            )}
                          >
                            <Icon className={cn(
                              "h-5 w-5",
                              isCurrent && "animate-pulse"
                            )} />
                          </div>
                          
                          {/* Label */}
                          <div className="flex-1 sm:flex-none sm:text-center sm:mt-4">
                            <p className={cn(
                              "font-medium text-sm",
                              isCompleted ? "text-foreground" : "text-muted-foreground"
                            )}>
                              {step.label}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Order details */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-serif text-xl font-semibold text-foreground mb-6">
                  Detalles del Pedido
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Cliente</p>
                    <p className="font-medium text-foreground">{order.customer.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Teléfono</p>
                    <p className="font-medium text-foreground">{order.customer.phone}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-sm text-muted-foreground mb-1">Dirección de entrega</p>
                    <p className="font-medium text-foreground">{order.customer.address}</p>
                  </div>
                </div>

                <div className="border-t border-border pt-6">
                  <h3 className="font-medium text-foreground mb-4">Productos</h3>
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                        <div>
                          <p className="font-medium text-foreground">{item.product.name}</p>
                          <p className="text-sm text-muted-foreground">x{item.quantity}</p>
                        </div>
                        <p className="font-medium text-foreground">{formatPrice(item.totalPrice)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Demo orders info */}
          {!searchedOrderId && orders.length > 0 && (
            <div className="bg-secondary/50 rounded-2xl p-6 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Tienes {orders.length} pedido{orders.length > 1 ? 's' : ''} reciente{orders.length > 1 ? 's' : ''}:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {orders.map((o) => (
                  <Button
                    key={o.id}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setOrderId(o.id)
                      setSearchedOrderId(o.id)
                    }}
                    className="font-mono"
                  >
                    {o.id}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <Chatbot />
    </>
  )
}
