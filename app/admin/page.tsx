"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useStore } from '@/context/store-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, ShoppingCart, Package, TrendingUp, Loader2 } from 'lucide-react'

interface DBOrder {
  id: string
  order_number: string
  status: string
  total: number
  created_at: string
  customer: { name: string } | null
}

const statusLabels: Record<string, { label: string; color: string }> = {
  'recibido':    { label: 'Recibido',       color: 'bg-blue-100 text-blue-700' },
  'preparacion': { label: 'En Preparación', color: 'bg-amber-100 text-amber-700' },
  'en-camino':   { label: 'En Camino',      color: 'bg-purple-100 text-purple-700' },
  'entregado':   { label: 'Entregado',      color: 'bg-emerald-100 text-emerald-700' },
  'cancelado':   { label: 'Cancelado',      color: 'bg-red-100 text-red-700' },
}

export default function AdminDashboard() {
  const { products } = useStore()
  const [orders, setOrders] = useState<DBOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrders() {
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, status, total, created_at, customer:customers(name)')
        .order('created_at', { ascending: false })

      if (!error && data) setOrders(data as any)
      setLoading(false)
    }
    fetchOrders()
  }, [])

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price)

  const totalSales = orders.reduce((sum, o) => sum + o.total, 0)
  const totalOrders = orders.length
  const pendingOrders = orders.filter(o => o.status !== 'entregado' && o.status !== 'cancelado').length
  const avgTicket = totalOrders > 0 ? totalSales / totalOrders : 0
  const recentOrders = orders.slice(0, 5)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Resumen general del negocio</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando datos...</span>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Ventas Totales</CardTitle>
                <DollarSign className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{formatPrice(totalSales)}</div>
                <p className="text-xs text-muted-foreground mt-1">Todos los pedidos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pedidos</CardTitle>
                <ShoppingCart className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{totalOrders}</div>
                <p className="text-xs text-muted-foreground mt-1">{pendingOrders} pendientes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Productos</CardTitle>
                <Package className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{products.length}</div>
                <p className="text-xs text-muted-foreground mt-1">En catálogo</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Promedio</CardTitle>
                <TrendingUp className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{formatPrice(avgTicket)}</div>
                <p className="text-xs text-muted-foreground mt-1">Por pedido</p>
              </CardContent>
            </Card>
          </div>

          {/* Pedidos recientes */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-xl">Pedidos Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No hay pedidos aún</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">Pedido</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">Cliente</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">Estado</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => {
                        const status = statusLabels[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-700' }
                        return (
                          <tr key={order.id} className="border-b border-border last:border-0">
                            <td className="py-3 px-2">
                              <span className="font-mono font-medium text-foreground text-xs">{order.order_number}</span>
                            </td>
                            <td className="py-3 px-2 text-foreground">{order.customer?.name || '—'}</td>
                            <td className="py-3 px-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                {status.label}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-right font-medium text-foreground">{formatPrice(order.total)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}