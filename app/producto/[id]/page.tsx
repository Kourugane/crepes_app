"use client"

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Chatbot } from '@/components/chatbot'
import { useStore } from '@/context/store-context'
import { Button } from '@/components/ui/button'
import { Minus, Plus, ShoppingBag, ArrowLeft, Check } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { products, addToCart } = useStore()
  
  const product = useMemo(() => {
    return products.find(p => p.id === params.id)
  }, [products, params.id])

  const [quantity, setQuantity] = useState(1)
  const [selectedCustomizations, setSelectedCustomizations] = useState<{ [key: string]: string }>({})
  const [added, setAdded] = useState(false)

  if (!product) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-serif text-2xl font-bold text-foreground mb-4">
              Producto no encontrado
            </h1>
            <Link href="/menu">
              <Button variant="outline">Volver al menú</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const customizationPrice = Object.entries(selectedCustomizations).reduce((total, [customId, optionId]) => {
    const custom = product.customizations?.find(c => c.id === customId)
    const option = custom?.options.find(o => o.id === optionId)
    return total + (option?.price || 0)
  }, 0)

  const totalPrice = (product.price + customizationPrice) * quantity

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedCustomizations)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const categoryLabels: Record<string, string> = {
    'desayunos': 'Desayuno',
    'postres': 'Postre',
    'platos-fuertes': 'Plato Fuerte',
    'bebidas': 'Bebida',
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-secondary">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute top-4 left-4">
                <span className="px-4 py-1.5 text-sm font-medium bg-background/90 backdrop-blur-sm rounded-full text-foreground">
                  {categoryLabels[product.category]}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="flex flex-col">
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
                {product.name}
              </h1>
              
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                {product.description}
              </p>

              <p className="mt-6 font-serif text-3xl font-bold text-accent">
                {formatPrice(product.price)}
              </p>

              {/* Customizations */}
              {product.customizations && product.customizations.length > 0 && (
                <div className="mt-8 space-y-6">
                  {product.customizations.map((customization) => (
                    <div key={customization.id}>
                      <h3 className="font-semibold text-foreground mb-3">
                        {customization.name}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {customization.options.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => setSelectedCustomizations(prev => ({
                              ...prev,
                              [customization.id]: option.id
                            }))}
                            className={cn(
                              "px-4 py-2 rounded-full border text-sm transition-all",
                              selectedCustomizations[customization.id] === option.id
                                ? "border-accent bg-accent/10 text-accent"
                                : "border-border hover:border-accent"
                            )}
                          >
                            {option.name}
                            {option.price > 0 && (
                              <span className="ml-1 text-muted-foreground">
                                (+{formatPrice(option.price)})
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity */}
              <div className="mt-8">
                <h3 className="font-semibold text-foreground mb-3">Cantidad</h3>
                <div className="inline-flex items-center gap-4 bg-secondary rounded-full p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-semibold text-foreground">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full"
                    onClick={() => setQuantity(q => q + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Total and Add to cart */}
              <div className="mt-8 pt-8 border-t border-border">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-serif text-2xl font-bold text-foreground">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
                
                <Button
                  size="lg"
                  className={cn(
                    "w-full py-6 text-lg rounded-full transition-all",
                    added 
                      ? "bg-emerald-600 hover:bg-emerald-600"
                      : "bg-primary hover:bg-primary/90"
                  )}
                  onClick={handleAddToCart}
                >
                  {added ? (
                    <>
                      <Check className="mr-2 h-5 w-5" />
                      Agregado al carrito
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="mr-2 h-5 w-5" />
                      Agregar al carrito
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <Chatbot />
    </>
  )
}
