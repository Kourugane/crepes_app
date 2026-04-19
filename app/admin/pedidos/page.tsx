"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye, X, ChevronRight, Loader2, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

type OrderStatus = 'recibido' | 'preparacion' | 'en-camino' | 'entregado' | 'cancelado'

interface DBOrder {
  id: string
  order_number: string
  status: OrderStatus
  total: number
  payment_method: string
  created_at: string
  customer: { name: string; phone: string; address: string } | null
  items: { id: string; product_name: string; quantity: number; total_price: number }[]
}

const statusOptions = [
  { id: 'recibido' as OrderStatus,    label: 'Recibido',        color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'preparacion' as OrderStatus, label: 'En Preparación',  color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 'en-camino' as OrderStatus,   label: 'En Camino',       color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { id: 'entregado' as OrderStatus,   label: 'Entregado',       color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { id: 'cancelado' as OrderStatus,   label: 'Cancelado',       color: 'bg-red-100 text-red-700 border-red-200' },
]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<DBOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<DBOrder | null>(null)
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchOrders = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id, order_number, status, total, payment_method, created_at,
        customer:customers(name, phone, address),
        items:order_items(id, product_name, quantity, total_price)
      `)
      .order('created_at', { ascending: false })

    if (!error && data) setOrders(data as any)
    setLoading(false)
  }

  useEffect(() => { fetchOrders() }, [])

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId)
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId)

    if (!error) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
      if (selectedOrder?.id === orderId) setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null)
    }
    setUpdatingId(null)
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price)

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

  const getStatusInfo = (status: OrderStatus) =>
    statusOptions.find(s => s.id === status) || statusOptions[0]

  const filteredOrders = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Pedidos</h1>
          <p className="text-muted-foreground mt-1">Gestiona y actualiza el estado de los pedidos</p>
        </div>
        <Button variant="outline" onClick={fetchOrders} disabled={loading}>
          <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
          Actualizar
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={filterStatus === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterStatus('all')}
          className="rounded-full"
        >
          Todos ({orders.length})
        </Button>
        {statusOptions.map((status) => (
          <Button
            key={status.id}
            variant={filterStatus === status.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus(status.id)}
            className="rounded-full"
          >
            {status.label} ({orders.filter(o => o.status === status.id).length})
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">
            {filterStatus === 'all' ? 'Todos los Pedidos' : `Pedidos — ${getStatusInfo(filterStatus as OrderStatus).label}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Cargando pedidos...</span>
            </div>
          ) : filteredOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No hay pedidos</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Pedido</th>
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
                          <span className="font-mono font-medium text-foreground text-xs">{order.order_number}</span>
                        </td>
                        <td className="py-3 px-2">
                          <p className="text-foreground">{order.customer?.name || '—'}</p>
                          <p className="text-xs text-muted-foreground">{order.customer?.phone || '—'}</p>
                        </td>
                        <td className="py-3 px-2 text-muted-foreground">{formatDate(order.created_at)}</td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right font-medium">{formatPrice(order.total)}</td>
                        <td className="py-3 px-2">
                          <div className="flex justify-end">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
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

      {/* Modal detalle */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-card rounded-2xl border border-border p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground">{selectedOrder.order_number}</h2>
                <p className="text-sm text-muted-foreground">{formatDate(selectedOrder.created_at)}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Cambiar estado */}
            <div className="mb-6">
              <p className="text-sm font-medium text-foreground mb-3">Actualizar Estado</p>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((status) => (
                  <button
                    key={status.id}
                    disabled={updatingId === selectedOrder.id}
                    onClick={() => updateStatus(selectedOrder.id, status.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-all",
                      selectedOrder.status === status.id ? status.color : "border-border hover:border-accent"
                    )}
                  >
                    {status.label}
                    {selectedOrder.status === status.id && <ChevronRight className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Info cliente */}
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-secondary/50 rounded-xl">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Cliente</p>
                <p className="font-medium text-foreground">{selectedOrder.customer?.name || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Teléfono</p>
                <p className="font-medium text-foreground">{selectedOrder.customer?.phone || '—'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground mb-1">Dirección</p>
                <p className="font-medium text-foreground">{selectedOrder.customer?.address || '—'}</p>
              </div>
            </div>

            {/* Productos */}
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
                        <td className="py-2 px-3 text-foreground">{item.product_name}</td>
                        <td className="py-2 px-3 text-center text-muted-foreground">{item.quantity}</td>
                        <td className="py-2 px-3 text-right font-medium">{formatPrice(item.total_price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

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