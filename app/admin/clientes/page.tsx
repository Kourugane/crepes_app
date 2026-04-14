"use client"

import { useMemo } from 'react'
import { useStore } from '@/context/store-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Phone, MapPin, ShoppingBag } from 'lucide-react'

export default function AdminCustomersPage() {
  const { orders } = useStore()

  // Extract unique customers from orders
  const customers = useMemo(() => {
    const customerMap = new Map<string, {
      name: string
      phone: string
      address: string
      totalOrders: number
      totalSpent: number
    }>()

    orders.forEach(order => {
      const key = order.customer.phone
      const existing = customerMap.get(key)
      
      if (existing) {
        customerMap.set(key, {
          ...existing,
          totalOrders: existing.totalOrders + 1,
          totalSpent: existing.totalSpent + order.total,
        })
      } else {
        customerMap.set(key, {
          name: order.customer.name,
          phone: order.customer.phone,
          address: order.customer.address,
          totalOrders: 1,
          totalSpent: order.total,
        })
      }
    })

    return Array.from(customerMap.values())
  }, [orders])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">Clientes</h1>
        <p className="text-muted-foreground mt-1">Lista de clientes que han realizado pedidos</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <User className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{customers.length}</p>
                <p className="text-sm text-muted-foreground">Total Clientes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{orders.length}</p>
                <p className="text-sm text-muted-foreground">Total Pedidos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <User className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {customers.length > 0 ? (orders.length / customers.length).toFixed(1) : 0}
                </p>
                <p className="text-sm text-muted-foreground">Pedidos/Cliente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customers list */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No hay clientes registrados aún</p>
              <p className="text-sm text-muted-foreground mt-1">Los clientes aparecerán aquí cuando realicen pedidos</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customers.map((customer, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl border border-border bg-secondary/20 hover:bg-secondary/40 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-6 w-6 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{customer.name}</h3>
                      
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          {customer.phone}
                        </div>
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">{customer.address}</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-border flex justify-between text-sm">
                        <div>
                          <p className="text-muted-foreground">Pedidos</p>
                          <p className="font-semibold text-foreground">{customer.totalOrders}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-muted-foreground">Total Gastado</p>
                          <p className="font-semibold text-accent">{formatPrice(customer.totalSpent)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
