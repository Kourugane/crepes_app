"use client"

import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Chatbot } from '@/components/chatbot'
import { useStore } from '@/context/store-context'
import { Button } from '@/components/ui/button'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useStore()

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
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          {/* Page header */}
          <div className="text-center mb-12">
            <p className="text-sm font-medium tracking-widest text-accent uppercase mb-2">
              Tu Pedido
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground">
              Carrito
            </h1>
          </div>

          {cart.length === 0 ? (
            /* Empty cart */
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
                <ShoppingBag className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
                Tu carrito está vacío
              </h2>
              <p className="text-muted-foreground mb-8">
                Explora nuestro menú y agrega tus platos favoritos.
              </p>
              <Link href="/menu">
                <Button className="bg-primary hover:bg-primary/90">
                  Ver Menú
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart items */}
              <div className="lg:col-span-2 space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="bg-card rounded-2xl border border-border p-4 flex gap-4"
                  >
                    {/* Image */}
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif font-semibold text-foreground truncate">
                        {item.product.name}
                      </h3>
                      
                      {/* Customizations */}
                      {Object.entries(item.selectedCustomizations).length > 0 && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          {Object.entries(item.selectedCustomizations).map(([customId, optionId]) => {
                            const custom = item.product.customizations?.find(c => c.id === customId)
                            const option = custom?.options.find(o => o.id === optionId)
                            return option ? (
                              <span key={customId} className="mr-2">
                                {custom?.name}: {option.name}
                              </span>
                            ) : null
                          })}
                        </div>
                      )}

                      {/* Price */}
                      <p className="mt-2 font-semibold text-accent">
                        {formatPrice(item.totalPrice)}
                      </p>

                      {/* Quantity controls */}
                      <div className="mt-3 flex items-center gap-4">
                        <div className="inline-flex items-center gap-2 bg-secondary rounded-full p-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order summary */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-2xl border border-border p-6 sticky top-28">
                  <h2 className="font-serif text-xl font-semibold text-foreground mb-6">
                    Resumen del Pedido
                  </h2>

                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal ({cartCount} productos)</span>
                      <span className="font-medium text-foreground">{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Envío</span>
                      <span className="font-medium text-foreground">Gratis</span>
                    </div>
                    <div className="border-t border-border pt-4">
                      <div className="flex justify-between">
                        <span className="font-semibold text-foreground">Total</span>
                        <span className="font-serif text-xl font-bold text-accent">
                          {formatPrice(cartTotal)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link href="/checkout" className="block mt-6">
                    <Button className="w-full bg-primary hover:bg-primary/90 py-6 text-lg rounded-full">
                      Continuar al Pago
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>

                  <Link href="/menu" className="block mt-3 text-center">
                    <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                      Seguir comprando
                    </Button>
                  </Link>
                </div>
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
