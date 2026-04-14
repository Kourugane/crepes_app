"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
        <div className="text-center">
          {/* Eyebrow */}
          <p className="text-sm font-medium tracking-widest text-accent uppercase mb-4">
            Experiencia Gastronómica
          </p>
          
          {/* Main headline */}
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-tight text-balance">
            Tradición y sabor
            <br />
            <span className="text-accent">en cada bocado</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
            Descubre nuestra deliciosa carta de crepes, waffles, platos fuertes y postres. 
            Una experiencia culinaria única que combina ingredientes frescos con recetas tradicionales.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/menu">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg">
                Ver Menú
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/menu#desayunos">
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                Explorar Desayunos
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div className="text-center">
              <p className="font-serif text-3xl sm:text-4xl font-bold text-accent">40+</p>
              <p className="text-sm text-muted-foreground mt-1">Años de Tradición</p>
            </div>
            <div className="text-center">
              <p className="font-serif text-3xl sm:text-4xl font-bold text-accent">100+</p>
              <p className="text-sm text-muted-foreground mt-1">Platos Únicos</p>
            </div>
            <div className="text-center">
              <p className="font-serif text-3xl sm:text-4xl font-bold text-accent">50+</p>
              <p className="text-sm text-muted-foreground mt-1">Restaurantes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-accent flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-accent rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  )
}
