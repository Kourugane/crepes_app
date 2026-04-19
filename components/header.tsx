"use client"

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Menu, X, ShoppingBag, User, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStore } from '@/context/store-context'

function MobileMenu({ onClose, cartCount }: { onClose: () => void; cartCount: number }) {
  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#faf8f4',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #e5e0d8' }}>
        <Link href="/" onClick={onClose} style={{ fontFamily: 'serif', fontSize: '20px', fontWeight: 'bold', color: '#1a1a1a', textDecoration: 'none' }}>
          Crepes & Waffles
        </Link>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
          <X size={24} color="#1a1a1a" />
        </button>
      </div>

      {/* Links */}
      <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {[
          { href: '/', label: 'Inicio', icon: null },
          { href: '/menu', label: 'Menú', icon: null },
          { href: '/reconocer', label: 'Reconocer Plato', icon: <Camera size={20} color="#b48e49" /> },
          { href: '/seguimiento', label: 'Seguimiento', icon: null },
        ].map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: '500',
              color: '#1a1a1a',
              textDecoration: 'none',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f0ebe3')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            {icon}
            {label}
          </Link>
        ))}

        <div style={{ borderTop: '1px solid #e5e0d8', margin: '12px 0' }} />

        <Link
          href="/carrito"
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: '500',
            color: '#1a1a1a',
            textDecoration: 'none',
          }}
        >
          <ShoppingBag size={20} color="#b48e49" />
          Carrito
          {cartCount > 0 && (
            <span style={{
              marginLeft: 'auto',
              backgroundColor: '#b48e49',
              color: 'white',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: '600',
            }}>
              {cartCount}
            </span>
          )}
        </Link>

        <Link
          href="/admin"
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: '500',
            color: '#1a1a1a',
            textDecoration: 'none',
          }}
        >
          <User size={20} color="#b48e49" />
          Administración
        </Link>
      </div>
    </div>,
    document.body
  )
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { cartCount } = useStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

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

      {/* Mobile menu via Portal */}
      {mounted && mobileMenuOpen && (
        <MobileMenu
          onClose={() => setMobileMenuOpen(false)}
          cartCount={cartCount}
        />
      )}
    </header>
  )
}