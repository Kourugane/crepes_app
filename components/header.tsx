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
  <div className="fixed inset-0 z-50 lg:hidden bg-background flex flex-col">
    {/* Header */}
    <div className="flex items-center justify-between px-6 py-5 border-b border-border">
      <Link href="/" onClick={() => setMobileMenuOpen(false)}>
        <span className="font-serif text-xl font-bold text-foreground">Crepes & Waffles</span>
      </Link>
      <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
        <X className="h-6 w-6" />
      </Button>
    </div>

    {/* Links */}
    <div className="flex-1 px-6 py-8 space-y-2">
      <Link
        href="/"
        className="flex items-center rounded-xl px-4 py-4 text-lg font-medium text-foreground hover:bg-secondary transition-colors"
        onClick={() => setMobileMenuOpen(false)}
      >
        Inicio
      </Link>
      <Link
        href="/menu"
        className="flex items-center rounded-xl px-4 py-4 text-lg font-medium text-foreground hover:bg-secondary transition-colors"
        onClick={() => setMobileMenuOpen(false)}
      >
        Menú
      </Link>
      <Link
        href="/reconocer"
        className="flex items-center gap-3 rounded-xl px-4 py-4 text-lg font-medium text-foreground hover:bg-secondary transition-colors"
        onClick={() => setMobileMenuOpen(false)}
      >
        <Camera className="h-5 w-5 text-accent" />
        Reconocer Plato
      </Link>
      <Link
        href="/seguimiento"
        className="flex items-center rounded-xl px-4 py-4 text-lg font-medium text-foreground hover:bg-secondary transition-colors"
        onClick={() => setMobileMenuOpen(false)}
      >
        Seguimiento
      </Link>

      <div className="border-t border-border my-4" />

      <Link
        href="/carrito"
        className="flex items-center gap-3 rounded-xl px-4 py-4 text-lg font-medium text-foreground hover:bg-secondary transition-colors"
        onClick={() => setMobileMenuOpen(false)}
      >
        <ShoppingBag className="h-5 w-5 text-accent" />
        Carrito
        {cartCount > 0 && (
          <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
            {cartCount}
          </span>
        )}
      </Link>
      <Link
        href="/admin"
        className="flex items-center gap-3 rounded-xl px-4 py-4 text-lg font-medium text-foreground hover:bg-secondary transition-colors"
        onClick={() => setMobileMenuOpen(false)}
      >
        <User className="h-5 w-5 text-accent" />
        Administración
      </Link>
    </div>
  </div>
)}
    </header>
  )
}