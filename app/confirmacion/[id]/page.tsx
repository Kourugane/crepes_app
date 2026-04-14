"use client"

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Chatbot } from '@/components/chatbot'
import { useStore } from '@/context/store-context'
import { Button } from '@/components/ui/button'
import { CheckCircle, MapPin, Phone, CreditCard, ArrowRight } from 'lucide-react'
import { InvoicePreview } from '@/components/invoice-preview'

export default function ConfirmationPage() {
  const params = useParams()
  const { orders } = useStore()
  
  const order = orders.find(o => o.id === params.id)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const paymentMethodLabels: Record<string, string> = {
    'efectivo': 'Efectivo',
    'tarjeta': 'Tarjeta de crédito/débito',
    'transferencia': 'Transferencia bancaria',
  }

  if (!order) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-serif text-2xl font-bold text-foreground mb-4">
              Pedido no encontrado
            </h1>
            <Link href="/">
              <Button>Volver al inicio</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          {/* Success message */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-emerald-600" />
            </div>
            <p className="text-sm font-medium tracking-widest text-accent uppercase mb-2">
              Pedido Confirmado
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground">
              ¡Gracias por tu pedido!
            </h1>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
              Tu pedido ha sido recibido y está siendo preparado. Recibirás actualizaciones sobre el estado de tu entrega.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order details */}
            <div className="space-y-6">
              {/* Order ID */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
                  Detalles del Pedido
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Número de pedido</p>
                    <p className="font-mono text-lg font-semibold text-accent">{order.id}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha</p>
                    <p className="font-medium text-foreground">
                      {new Date(order.createdAt).toLocaleDateString('es-CO', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Delivery info */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
                  Información de Entrega
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Dirección</p>
                      <p className="font-medium text-foreground">{order.customer.address}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                      <Phone className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Teléfono</p>
                      <p className="font-medium text-foreground">{order.customer.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                      <CreditCard className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Método de pago</p>
                      <p className="font-medium text-foreground">{paymentMethodLabels[order.paymentMethod]}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order items */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
                  Productos
                </h2>
                
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                      <div>
                        <p className="font-medium text-foreground">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-foreground">{formatPrice(item.totalPrice)}</p>
                    </div>
                  ))}
                  
                  <div className="flex justify-between items-center pt-4 border-t border-border">
                    <p className="font-semibold text-foreground">Total</p>
                    <p className="font-serif text-2xl font-bold text-accent">{formatPrice(order.total)}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={`/seguimiento?pedido=${order.id}`} className="flex-1">
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Seguir mi pedido
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/menu" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Seguir comprando
                  </Button>
                </Link>
              </div>
            </div>

            {/* Invoice preview */}
            <div>
              <InvoicePreview order={order} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <Chatbot />
    </>
  )
}
