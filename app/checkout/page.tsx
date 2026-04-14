"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useStore, type CustomerInfo } from '@/context/store-context'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CreditCard, Banknote, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, cartTotal, createOrder } = useStore()

  const [formData, setFormData] = useState<CustomerInfo>({
    name: '',
    email: '',
    address: '',
    phone: '',
    paymentMethod: 'efectivo',
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const IVA_RATE = 0.19
  const subtotal = cartTotal
  const tax = Math.round(subtotal * IVA_RATE)
  const total = subtotal + tax

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido'
    if (!formData.address.trim()) newErrors.address = 'La dirección es requerida'
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido'
    } else if (!/^[0-9]{7,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Ingresa un teléfono válido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // createOrder ahora es async y guarda en Supabase
      const order = await createOrder(formData)
      router.push(`/confirmacion/${order.id}`)
    } catch (err: any) {
      console.error('Error al crear pedido:', err)
      setSubmitError(err.message || 'Error al procesar el pedido. Intenta de nuevo.')
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const paymentMethods = [
    { id: 'efectivo', name: 'Efectivo', description: 'Paga al recibir tu pedido', icon: Banknote },
    { id: 'tarjeta', name: 'Tarjeta', description: 'Débito o crédito', icon: CreditCard },
    { id: 'transferencia', name: 'Transferencia', description: 'Bancolombia, Nequi, Daviplata', icon: Building2 },
  ] as const

  if (cart.length === 0) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-serif text-2xl font-bold text-foreground mb-4">
              Tu carrito está vacío
            </h1>
            <Link href="/menu">
              <Button>Ir al menú</Button>
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
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <Link
            href="/carrito"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al carrito
          </Link>

          <div className="text-center mb-12">
            <p className="text-sm font-medium tracking-widest text-accent uppercase mb-2">
              Finalizar Compra
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground">
              Checkout
            </h1>
          </div>

          {submitError && (
            <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive text-destructive text-sm">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h2 className="font-serif text-xl font-semibold text-foreground mb-6">
                    Datos de Entrega
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={cn(
                          "w-full px-4 py-3 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent",
                          errors.name ? "border-destructive" : "border-border"
                        )}
                        placeholder="Juan Pérez"
                      />
                      {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                        Email <span className="text-muted-foreground">(opcional)</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="juan@email.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-foreground mb-2">
                        Dirección de entrega
                      </label>
                      <textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows={3}
                        className={cn(
                          "w-full px-4 py-3 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none",
                          errors.address ? "border-destructive" : "border-border"
                        )}
                        placeholder="Calle 123 #45-67, Apartamento 101, Bogotá"
                      />
                      {errors.address && <p className="mt-1 text-sm text-destructive">{errors.address}</p>}
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={cn(
                          "w-full px-4 py-3 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent",
                          errors.phone ? "border-destructive" : "border-border"
                        )}
                        placeholder="300 123 4567"
                      />
                      {errors.phone && <p className="mt-1 text-sm text-destructive">{errors.phone}</p>}
                    </div>
                  </div>
                </div>

                {/* Payment method */}
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h2 className="font-serif text-xl font-semibold text-foreground mb-6">
                    Método de Pago
                  </h2>

                  <div className="space-y-3">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon
                      return (
                        <label
                          key={method.id}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all",
                            formData.paymentMethod === method.id
                              ? "border-accent bg-accent/5"
                              : "border-border hover:border-accent/50"
                          )}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={formData.paymentMethod === method.id}
                            onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as CustomerInfo['paymentMethod'] }))}
                            className="sr-only"
                          />
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center",
                            formData.paymentMethod === method.id
                              ? "bg-accent text-accent-foreground"
                              : "bg-secondary text-secondary-foreground"
                          )}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{method.name}</p>
                            <p className="text-sm text-muted-foreground">{method.description}</p>
                          </div>
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                            formData.paymentMethod === method.id ? "border-accent" : "border-border"
                          )}>
                            {formData.paymentMethod === method.id && (
                              <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                            )}
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Order summary */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-2xl border border-border p-6 sticky top-28">
                  <h2 className="font-serif text-xl font-semibold text-foreground mb-6">
                    Tu Pedido
                  </h2>

                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm truncate">
                            {item.product.name}
                          </p>
                          <p className="text-sm text-accent font-medium">
                            {formatPrice(item.totalPrice)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 pt-4 border-t border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium text-foreground">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">IVA (19%)</span>
                      <span className="font-medium text-foreground">{formatPrice(tax)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Envío</span>
                      <span className="font-medium text-foreground">Gratis</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-border">
                      <span className="font-semibold text-foreground">Total</span>
                      <span className="font-serif text-xl font-bold text-accent">
                        {formatPrice(total)}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-6 bg-primary hover:bg-primary/90 py-6 text-lg rounded-full disabled:opacity-50"
                  >
                    {isSubmitting ? 'Procesando...' : 'Confirmar Pedido'}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  )
}
