"use client"

import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import type { Order } from '@/context/store-context'
import jsPDF from 'jspdf'

const EMPRESA = {
  nombre: 'Crepes & Waffles',
  nit: '900.123.456-7',
  direccion: 'Calle 85 #11-10, Bogotá, Colombia',
  telefono: '+57 (1) 123 4567',
  email: 'info@crepesywaffles.com',
}

interface InvoicePreviewProps {
  order: Order
}

export function InvoicePreview({ order }: InvoicePreviewProps) {
  const invoiceRef = useRef<HTMLDivElement>(null)

  // Calcular subtotal e IVA correctamente
  const subtotal = order.subtotal ?? order.total
  const tax = order.tax ?? Math.round(subtotal * 0.19)
  const total = order.total
  const invoiceNumber = order.invoice_number || order.order_number || order.id

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const paymentMethodLabels: Record<string, string> = {
    'efectivo': 'Efectivo',
    'tarjeta': 'Tarjeta',
    'transferencia': 'Transferencia',
  }

  const generatePDF = () => {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const margin = 20
    let yPos = margin

    const goldColor: [number, number, number] = [180, 142, 73]
    const blackColor: [number, number, number] = [26, 26, 26]
    const grayColor: [number, number, number] = [120, 120, 120]

    // Header background
    pdf.setFillColor(250, 248, 244)
    pdf.rect(0, 0, pageWidth, 60, 'F')

    // Nombre empresa
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(22)
    pdf.setTextColor(...blackColor)
    pdf.text(EMPRESA.nombre, margin, yPos + 10)

    // NIT
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    pdf.setTextColor(...grayColor)
    pdf.text(`NIT: ${EMPRESA.nit}`, margin, yPos + 17)
    pdf.text(EMPRESA.direccion, margin, yPos + 22)
    pdf.text(`Tel: ${EMPRESA.telefono}`, margin, yPos + 27)

    // Etiqueta FACTURA
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(14)
    pdf.setTextColor(...goldColor)
    pdf.text('FACTURA DE VENTA', pageWidth - margin, yPos + 10, { align: 'right' })

    // Número de factura
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    pdf.setTextColor(...blackColor)
    pdf.text(`No. ${invoiceNumber}`, pageWidth - margin, yPos + 17, { align: 'right' })
    pdf.text(`Fecha: ${formatDate(order.createdAt)}`, pageWidth - margin, yPos + 22, { align: 'right' })
    pdf.text(`Pago: ${paymentMethodLabels[order.paymentMethod] || order.paymentMethod}`, pageWidth - margin, yPos + 27, { align: 'right' })

    yPos = 68

    // Línea separadora dorada
    pdf.setDrawColor(...goldColor)
    pdf.setLineWidth(0.5)
    pdf.line(margin, yPos - 3, pageWidth - margin, yPos - 3)

    // Datos del cliente
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(9)
    pdf.setTextColor(...goldColor)
    pdf.text('DATOS DEL CLIENTE', margin, yPos + 3)

    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(...blackColor)
    yPos += 10
    pdf.text(order.customer.name, margin, yPos)
    yPos += 5
    pdf.text(order.customer.phone, margin, yPos)
    yPos += 5
    const addrLines = pdf.splitTextToSize(order.customer.address, 80)
    addrLines.forEach((line: string) => {
      pdf.text(line, margin, yPos)
      yPos += 5
    })

    yPos += 8

    // Tabla de productos — encabezado
    pdf.setFillColor(250, 248, 244)
    pdf.rect(margin, yPos - 5, pageWidth - 2 * margin, 10, 'F')

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(9)
    pdf.setTextColor(...blackColor)
    pdf.text('PRODUCTO', margin + 2, yPos + 2)
    pdf.text('CANT.', pageWidth - margin - 55, yPos + 2)
    pdf.text('PRECIO UNIT.', pageWidth - margin - 30, yPos + 2)
    pdf.text('TOTAL', pageWidth - margin - 2, yPos + 2, { align: 'right' })

    yPos += 12

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)

    order.items.forEach((item) => {
      pdf.setTextColor(...blackColor)
      const productLines = pdf.splitTextToSize(item.product.name, 80)
      pdf.text(productLines[0], margin + 2, yPos)
      pdf.text(item.quantity.toString(), pageWidth - margin - 53, yPos)
      pdf.text(formatPrice(item.product.price), pageWidth - margin - 28, yPos)
      pdf.text(formatPrice(item.totalPrice), pageWidth - margin - 2, yPos, { align: 'right' })

      pdf.setDrawColor(230, 230, 230)
      pdf.setLineWidth(0.2)
      pdf.line(margin, yPos + 3, pageWidth - margin, yPos + 3)

      yPos += 8
    })

    yPos += 8

    // Totales
    const totalsX = pageWidth - margin - 65

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    pdf.setTextColor(...grayColor)
    pdf.text('Subtotal (sin IVA):', totalsX, yPos)
    pdf.setTextColor(...blackColor)
    pdf.text(formatPrice(subtotal), pageWidth - margin - 2, yPos, { align: 'right' })

    yPos += 6
    pdf.setTextColor(...grayColor)
    pdf.text('IVA (19%):', totalsX, yPos)
    pdf.setTextColor(...blackColor)
    pdf.text(formatPrice(tax), pageWidth - margin - 2, yPos, { align: 'right' })

    yPos += 6
    pdf.setTextColor(...grayColor)
    pdf.text('Envío:', totalsX, yPos)
    pdf.setTextColor(...blackColor)
    pdf.text('Gratis', pageWidth - margin - 2, yPos, { align: 'right' })

    yPos += 8

    // Total final con fondo dorado
    pdf.setFillColor(250, 248, 244)
    pdf.rect(totalsX - 5, yPos - 5, pageWidth - margin - totalsX + 7, 12, 'F')

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(11)
    pdf.setTextColor(...goldColor)
    pdf.text('TOTAL:', totalsX, yPos + 2)
    pdf.setTextColor(...blackColor)
    pdf.text(formatPrice(total), pageWidth - margin - 2, yPos + 2, { align: 'right' })

    yPos += 22

    // Texto legal IVA
    pdf.setFont('helvetica', 'italic')
    pdf.setFontSize(7)
    pdf.setTextColor(...grayColor)
    pdf.text('IVA incluido según Art. 468 E.T. — Régimen Común', margin, yPos)

    yPos += 12

    // Footer
    pdf.setDrawColor(...goldColor)
    pdf.setLineWidth(0.5)
    pdf.line(margin, yPos, pageWidth - margin, yPos)

    yPos += 8
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8)
    pdf.setTextColor(...grayColor)
    pdf.text('Gracias por tu preferencia', pageWidth / 2, yPos, { align: 'center' })
    yPos += 4
    pdf.text(`${EMPRESA.nombre} · NIT ${EMPRESA.nit}`, pageWidth / 2, yPos, { align: 'center' })
    yPos += 4
    pdf.text(`${EMPRESA.telefono} · ${EMPRESA.email}`, pageWidth / 2, yPos, { align: 'center' })

    pdf.save(`factura-${invoiceNumber}.pdf`)
  }

  return (
    <div className="space-y-4">
      <div
        ref={invoiceRef}
        className="bg-card rounded-2xl border border-border overflow-hidden"
      >
        {/* Header */}
        <div className="bg-secondary/50 p-6 border-b border-border">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground">{EMPRESA.nombre}</h2>
              <p className="text-xs text-muted-foreground">NIT: {EMPRESA.nit}</p>
              <p className="text-sm text-muted-foreground">{EMPRESA.direccion}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-accent uppercase tracking-wide">Factura de Venta</p>
              <p className="font-mono text-sm font-semibold text-foreground">No. {invoiceNumber}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Cliente y fecha */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <p className="text-xs font-medium text-accent uppercase tracking-wide mb-2">Datos del Cliente</p>
              <p className="font-medium text-foreground">{order.customer.name}</p>
              <p className="text-sm text-muted-foreground">{order.customer.phone}</p>
              <p className="text-sm text-muted-foreground">{order.customer.address}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-accent uppercase tracking-wide mb-2">Detalles</p>
              <p className="text-sm text-foreground">{formatDate(order.createdAt)}</p>
              <p className="text-sm text-muted-foreground">
                Pago: {paymentMethodLabels[order.paymentMethod] || order.paymentMethod}
              </p>
            </div>
          </div>

          {/* Tabla de productos */}
          <div className="border border-border rounded-xl overflow-hidden mb-6">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Producto</th>
                  <th className="text-center py-3 px-2 font-medium text-foreground">Cant.</th>
                  <th className="text-right py-3 px-4 font-medium text-foreground">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={item.id} className={index < order.items.length - 1 ? 'border-b border-border' : ''}>
                    <td className="py-3 px-4 text-foreground">{item.product.name}</td>
                    <td className="py-3 px-2 text-center text-muted-foreground">{item.quantity}</td>
                    <td className="py-3 px-4 text-right font-medium text-foreground">{formatPrice(item.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totales con IVA */}
          <div className="flex justify-end">
            <div className="w-56 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IVA (19%)</span>
                <span className="text-foreground">{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Envío</span>
                <span className="text-foreground">Gratis</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="font-semibold text-foreground">Total</span>
                <span className="font-serif text-xl font-bold text-accent">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-secondary/30 p-4 text-center border-t border-border">
          <p className="text-sm text-muted-foreground">Gracias por tu preferencia</p>
          <p className="text-xs text-muted-foreground mt-1">
            {EMPRESA.nombre} · NIT {EMPRESA.nit} · {EMPRESA.telefono}
          </p>
        </div>
      </div>

      <Button
        onClick={generatePDF}
        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-5 rounded-xl"
      >
        <Download className="mr-2 h-5 w-5" />
        Descargar factura en PDF
      </Button>
    </div>
  )
}
