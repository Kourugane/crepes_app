"use client"

import { useState } from 'react'
import { useStore, type Order } from '@/context/store-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Eye, X, FileText } from 'lucide-react'
import { InvoicePreview } from '@/components/invoice-preview'

export default function AdminInvoicesPage() {
  const { orders } = useStore()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

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
      month: 'long',
      year: 'numeric'
    })
  }

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">Facturas</h1>
        <p className="text-muted-foreground mt-1">Gestiona y descarga las facturas de los pedidos</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{orders.length}</p>
                <p className="text-sm text-muted-foreground">Total Facturas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{formatPrice(totalRevenue)}</p>
                <p className="text-sm text-muted-foreground">Total Facturado</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {orders.length > 0 ? formatPrice(totalRevenue / orders.length) : formatPrice(0)}
                </p>
                <p className="text-sm text-muted-foreground">Promedio por Factura</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices list */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">Historial de Facturas</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No hay facturas aún</p>
              <p className="text-sm text-muted-foreground mt-1">Las facturas se generarán automáticamente con cada pedido</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">No. Factura</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Cliente</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Fecha</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Total</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
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
                      <td className="py-3 px-2 text-right font-medium text-foreground">
                        {formatPrice(order.total)}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex justify-end gap-2">
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice preview modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-card rounded-2xl border border-border p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl font-bold text-foreground">
                Factura {selectedOrder.id}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <InvoicePreview order={selectedOrder} />
          </div>
        </div>
      )}
    </div>
  )
}
