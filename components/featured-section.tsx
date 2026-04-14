"use client"

import Link from 'next/link'
import { useStore } from '@/context/store-context'
import { ProductCard } from '@/components/product-card'

export function FeaturedSection() {
  const { products } = useStore()
  const featuredProducts = products.slice(0, 4)

  return (
    <section className="py-24 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-sm font-medium tracking-widest text-accent uppercase mb-2">
            Nuestros Favoritos
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-foreground">
            Platos Destacados
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Descubre los platos más queridos por nuestros clientes, elaborados con los ingredientes más frescos.
          </p>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link 
            href="/menu"
            className="inline-flex items-center text-accent font-medium hover:text-accent/80 transition-colors"
          >
            Ver menú completo
            <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
