import Link from 'next/link'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-serif text-2xl font-bold">Crepes & Waffles</h3>
            <p className="text-sm text-primary-foreground/80 leading-relaxed">
              Una experiencia gastronómica única donde la tradición se encuentra con la innovación.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Enlaces</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/menu" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                  Menú
                </Link>
              </li>
              <li>
                <Link href="/seguimiento" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                  Seguimiento de Pedido
                </Link>
              </li>
              <li>
                <Link href="/carrito" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                  Carrito
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Contacto</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-primary-foreground/80">
                <Phone className="h-4 w-4 text-accent" />
                +57 (1) 123 4567
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/80">
                <Mail className="h-4 w-4 text-accent" />
                info@crepesywaffles.com
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/80">
                <MapPin className="h-4 w-4 text-accent" />
                Bogotá, Colombia
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Horario</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-primary-foreground/80">
                <Clock className="h-4 w-4 text-accent mt-0.5" />
                <div>
                  <p>Lunes - Viernes</p>
                  <p>7:00 AM - 10:00 PM</p>
                </div>
              </li>
              <li className="flex items-start gap-2 text-sm text-primary-foreground/80">
                <Clock className="h-4 w-4 text-accent mt-0.5" />
                <div>
                  <p>Sábado - Domingo</p>
                  <p>8:00 AM - 11:00 PM</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-primary-foreground/20 pt-8 text-center">
          <p className="text-sm text-primary-foreground/60">
            &copy; {new Date().getFullYear()} Crepes & Waffles. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
