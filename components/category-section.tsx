"use client"

import Link from 'next/link'
import { Coffee, Cake, UtensilsCrossed, Wine } from 'lucide-react'

const categories = [
  {
    id: 'desayunos',
    name: 'Desayunos',
    description: 'Comienza tu día con nuestros deliciosos crepes y waffles',
    icon: Coffee,
    color: 'bg-amber-100 text-amber-700',
  },
  {
    id: 'postres',
    name: 'Postres',
    description: 'Endulza tu vida con nuestras creaciones dulces',
    icon: Cake,
    color: 'bg-rose-100 text-rose-700',
  },
  {
    id: 'platos-fuertes',
    name: 'Platos Fuertes',
    description: 'Platos principales elaborados con los mejores ingredientes',
    icon: UtensilsCrossed,
    color: 'bg-emerald-100 text-emerald-700',
  },
  {
    id: 'bebidas',
    name: 'Bebidas',
    description: 'Acompaña tu comida con nuestras bebidas refrescantes',
    icon: Wine,
    color: 'bg-sky-100 text-sky-700',
  },
]

export function CategorySection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-sm font-medium tracking-widest text-accent uppercase mb-2">
            Explora
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-foreground">
            Nuestras Categorías
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Encuentra tu plato perfecto explorando nuestras diferentes categorías.
          </p>
        </div>

        {/* Categories grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <Link
                key={category.id}
                href={`/menu?categoria=${category.id}`}
                className="group relative bg-card rounded-2xl p-8 border border-border hover:border-accent hover:shadow-lg transition-all duration-300"
              >
                {/* Icon */}
                <div className={`inline-flex p-4 rounded-xl ${category.color} mb-6`}>
                  <Icon className="h-8 w-8" />
                </div>

                {/* Content */}
                <h3 className="font-serif text-xl font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {category.description}
                </p>

                {/* Arrow */}
                <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
