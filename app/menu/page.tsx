"use client"

import { useState, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { Chatbot } from '@/components/chatbot'
import { useStore } from '@/context/store-context'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const categories = [
  { id: 'all', name: 'Todos' },
  { id: 'desayunos', name: 'Desayunos' },
  { id: 'postres', name: 'Postres' },
  { id: 'platos-fuertes', name: 'Platos Fuertes' },
  { id: 'bebidas', name: 'Bebidas' },
]

function MenuContent() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get('categoria') || 'all'
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const { products, productsLoading } = useStore()

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') return products
    return products.filter(p => p.category === selectedCategory)
  }, [products, selectedCategory])

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-medium tracking-widest text-accent uppercase mb-2">
              Nuestra Carta
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground">
              Menú
            </h1>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Explora nuestra variedad de platos preparados con ingredientes frescos y el amor de nuestra cocina.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className={cn(
                  "rounded-full px-6",
                  selectedCategory === category.id
                    ? "bg-primary text-primary-foreground"
                    : "border-border hover:border-accent hover:text-accent"
                )}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>

          {productsLoading && (
            <div className="flex items-center justify-center py-24 gap-3 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Cargando menú...</span>
            </div>
          )}

          {!productsLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {!productsLoading && filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No hay productos en esta categoría.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <Chatbot />
    </>
  )
}

export default function MenuPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando menú...</span>
        </div>
      </div>
    }>
      <MenuContent />
    </Suspense>
  )
}