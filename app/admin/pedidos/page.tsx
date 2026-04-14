"use client"

import { useState } from 'react'
import { useStore, type Order } from '@/context/store-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye, X, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const statusOptions: { id: Order['status']; label: string; color: string }[] = [
  { id: 'recibido', label: 'Recibido', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'preparacion', label: 'En Preparación', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 'en-camino', label: 'En Camino', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { id: 'entregado', label: 'Entregado', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
]

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus } = useStore()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [filterStatus, setFilterStatus] = useState<Order['status'] | 'all'>('all')

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(o => o.status === filterStatus)

  const getStatusInfo = (status: Order['status']) => {
    return statusOptions.find(s => s.id === status) || statusOptions[0]
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">Pedidos</h1>
        <p className="text-muted-foreground mt-1">Gestiona y actualiza el estado de los pedidos</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={filterStatus === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterStatus('all')}
          className={cn(
            "rounded-full",
            filterStatus === 'all' && "bg-primary text-primary-foreground"
          )}
        >
          Todos ({orders.length})
        </Button>
        {statusOptions.map((status) => {
          const count = orders.filter(o => o.status === status.id).length
          return (
            <Button
              key={status.id}
              variant={filterStatus === status.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus(status.id)}
              className={cn(
                "rounded-full",
                filterStatus === status.id && "bg-primary text-primary-foreground"
              )}
            >
              {status.label} ({count})
            </Button>
          )
        })}
      </div>

      {/* Orders list */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">
            {filterStatus === 'all' ? 'Todos los Pedidos' : `Pedidos ${getStatusInfo(filterStatus as Order['status']).label}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No hay pedidos</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">ID Pedido</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Cliente</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Fecha</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Estado</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Total</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const statusInfo = getStatusInfo(order.status)
                    return (
                      <tr key={order.id} className="border-b border-border last:border-0">
                        <td className="py-3 px-2">
                          <span className="font-mono font-medium text-foreground">{order.id}</span>
                        </td>
                        <td className="py-3 px-2">
                          <div>
                            <p className="text-foreground">{order.customer.name}</p>
                            <p className="text-xs text-muted-foreground">{order.customer.phone}</p>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right font-medium text-foreground">
                          {formatPrice(order.total)}
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Ver
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-card rounded-2xl border border-border p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground">
                  Pedido {selectedOrder.id}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {formatDate(selectedOrder.createdAt)}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Status update */}
            <div className="mb-6">
              <p className="text-sm font-medium text-foreground mb-3">Actualizar Estado</p>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((status) => (
                  <button
                    key={status.id}
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, status.id)
                      setSelectedOrder({ ...selectedOrder, status: status.id })
                    }}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-all",
                      selectedOrder.status === status.id
                        ? status.color
                        : "border-border hover:border-accent"
                    )}
                  >
                    {status.label}
                    {selectedOrder.status === status.id && (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer info */}
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-secondary/50 rounded-xl">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Cliente</p>
                <p className="font-medium text-foreground">{selectedOrder.customer.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Teléfono</p>
                <p className="font-medium text-foreground">{selectedOrder.customer.phone}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground mb-1">Dirección</p>
                <p className="font-medium text-foreground">{selectedOrder.customer.address}</p>
              </div>
            </div>

            {/* Products */}
            <div className="mb-6">
              <p className="text-sm font-medium text-foreground mb-3">Productos</p>
              <div className="border border-border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">Producto</th>
                      <th className="text-center py-2 px-3 font-medium text-muted-foreground">Cant.</th>
                      <th className="text-right py-2 px-3 font-medium text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item) => (
                      <tr key={item.id} className="border-t border-border">
                        <td className="py-2 px-3 text-foreground">{item.product.name}</td>
                        <td className="py-2 px-3 text-center text-muted-foreground">{item.quantity}</td>
                        <td className="py-2 px-3 text-right font-medium text-foreground">{formatPrice(item.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-end pt-4 border-t border-border">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total del Pedido</p>
                <p className="font-serif text-2xl font-bold text-accent">{formatPrice(selectedOrder.total)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
