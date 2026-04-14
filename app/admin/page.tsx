"use client"

import { useMemo } from 'react'
import { useStore } from '@/context/store-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, ShoppingCart, Package, TrendingUp } from 'lucide-react'

export default function AdminDashboard() {
  const { orders, products } = useStore()

  const stats = useMemo(() => {
    const totalSales = orders.reduce((sum, order) => sum + order.total, 0)
    const totalOrders = orders.length
    const totalProducts = products.length
    const pendingOrders = orders.filter(o => o.status !== 'entregado').length
    
    return { totalSales, totalOrders, totalProducts, pendingOrders }
  }, [orders, products])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const recentOrders = orders.slice(-5).reverse()

  const statusLabels: Record<string, { label: string; color: string }> = {
    'recibido': { label: 'Recibido', color: 'bg-blue-100 text-blue-700' },
    'preparacion': { label: 'En Preparación', color: 'bg-amber-100 text-amber-700' },
    'en-camino': { label: 'En Camino', color: 'bg-purple-100 text-purple-700' },
    'entregado': { label: 'Entregado', color: 'bg-emerald-100 text-emerald-700' },
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Resumen general del negocio</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ventas Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatPrice(stats.totalSales)}</div>
            <p className="text-xs text-muted-foreground mt-1">+12% vs mes anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats.pendingOrders} pendientes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Productos</CardTitle>
            <Package className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">En catálogo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats.totalOrders > 0 ? formatPrice(stats.totalSales / stats.totalOrders) : formatPrice(0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Por pedido</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent orders */}
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
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">ID Pedido</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Cliente</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Estado</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-border last:border-0">
                      <td className="py-3 px-2">
                        <span className="font-mono font-medium text-foreground">{order.id}</span>
                      </td>
                      <td className="py-3 px-2 text-foreground">{order.customer.name}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusLabels[order.status].color}`}>
                          {statusLabels[order.status].label}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right font-medium text-foreground">{formatPrice(order.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
