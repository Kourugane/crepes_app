"use client"

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, ShoppingBag, User, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStore } from '@/context/store-context'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { cartCount } = useStore()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="font-serif text-2xl font-bold tracking-tight text-foreground">
              Crepes & Waffles
            </span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {/* Desktop navigation */}
        <div className="hidden lg:flex lg:gap-x-12">
          <Link href="/" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
            Inicio
          </Link>
          <Link href="/menu" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
            Menú
          </Link>
          <Link href="/reconocer" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
            Reconocer Plato
          </Link>
          <Link href="/seguimiento" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
            Seguimiento
          </Link>
        </div>

        {/* Desktop actions */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon" aria-label="Panel de administración">
              <User className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/carrito" className="relative">
            <Button variant="ghost" size="icon" aria-label="Ver carrito">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-background px-6 py-6 shadow-xl">
            <div className="flex items-center justify-between">
              <Link href="/" className="-m-1.5 p-1.5" onClick={() => setMobileMenuOpen(false)}>
                <span className="font-serif text-xl font-bold text-foreground">Crepes & Waffles</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} aria-label="Cerrar menú">
                <X className="h-6 w-6" />
              </Button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-border">
                <div className="space-y-2 py-6">
                  <Link
                    href="/"
                    className="block rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-secondary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Inicio
                  </Link>
                  <Link
                    href="/menu"
                    className="block rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-secondary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Menú
                  </Link>
                  <Link
                    href="/reconocer"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-secondary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Camera className="h-5 w-5" />
                    Reconocer Plato
                  </Link>
                  <Link
                    href="/seguimiento"
                    className="block rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-secondary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Seguimiento
                  </Link>
                </div>
                <div className="py-6 space-y-2">
                  <Link
                    href="/carrito"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-secondary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ShoppingBag className="h-5 w-5" />
                    Carrito ({cartCount})
                  </Link>
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-secondary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    Administración
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}