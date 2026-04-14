"use client"

import Image from 'next/image'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStore, type Product } from '@/context/store-context'

interface ProductCardProps {
  product: Product
  showAddButton?: boolean
}

export function ProductCard({ product, showAddButton = true }: ProductCardProps) {
  const { addToCart } = useStore()

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, 1, {})
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const categoryLabels: Record<string, string> = {
    'desayunos': 'Desayuno',
    'postres': 'Postre',
    'platos-fuertes': 'Plato Fuerte',
    'bebidas': 'Bebida',
  }

  return (
    <Link href={`/producto/${product.id}`} className="group">
      <article className="bg-card rounded-2xl overflow-hidden border border-border hover:border-accent hover:shadow-xl transition-all duration-300">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          
          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 text-xs font-medium bg-background/90 backdrop-blur-sm rounded-full text-foreground">
              {categoryLabels[product.category]}
            </span>
          </div>

          {/* Quick add button */}
          {showAddButton && (
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="icon"
                className="h-10 w-10 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg"
                onClick={handleQuickAdd}
                aria-label={`Agregar ${product.name} al carrito`}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <p className="font-semibold text-accent">
              {formatPrice(product.price)}
            </p>
            {product.customizations && product.customizations.length > 0 && (
              <span className="text-xs text-muted-foreground">Personalizable</span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
