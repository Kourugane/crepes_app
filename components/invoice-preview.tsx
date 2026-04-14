"use client"

import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import type { Order } from '@/context/store-context'
import jsPDF from 'jspdf'

interface InvoicePreviewProps {
  order: Order
}

export function InvoicePreview({ order }: InvoicePreviewProps) {
  const invoiceRef = useRef<HTMLDivElement>(null)

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
      minute: '2-digit'
    })
  }

  const paymentMethodLabels: Record<string, string> = {
    'efectivo': 'Efectivo',
    'tarjeta': 'Tarjeta',
    'transferencia': 'Transferencia',
  }

  const generatePDF = () => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const margin = 20
    let yPos = margin

    // Colors
    const goldColor: [number, number, number] = [180, 142, 73]
    const blackColor: [number, number, number] = [26, 26, 26]
    const grayColor: [number, number, number] = [120, 120, 120]

    // Header background
    pdf.setFillColor(250, 248, 244)
    pdf.rect(0, 0, pageWidth, 55, 'F')

    // Logo/Brand
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(24)
    pdf.setTextColor(...blackColor)
    pdf.text('Crepes & Waffles', margin, yPos + 10)

    // Tagline
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    pdf.setTextColor(...grayColor)
    pdf.text('Experiencia Gastronomica', margin, yPos + 18)

    // Invoice label
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(12)
    pdf.setTextColor(...goldColor)
    pdf.text('FACTURA', pageWidth - margin, yPos + 10, { align: 'right' })

    // Invoice number
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    pdf.setTextColor(...blackColor)
    pdf.text(order.id, pageWidth - margin, yPos + 18, { align: 'right' })

    yPos = 65

    // Gold line separator
    pdf.setDrawColor(...goldColor)
    pdf.setLineWidth(0.5)
    pdf.line(margin, yPos - 5, pageWidth - margin, yPos - 5)

    // Two columns: Customer info and Invoice details
    // Customer info
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(10)
    pdf.setTextColor(...goldColor)
    pdf.text('DATOS DEL CLIENTE', margin, yPos)
    
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    pdf.setTextColor(...blackColor)
    yPos += 7
    pdf.text(order.customer.name, margin, yPos)
    yPos += 5
    pdf.text(order.customer.phone, margin, yPos)
    yPos += 5
    
    // Handle long address with word wrap
    const addressLines = pdf.splitTextToSize(order.customer.address, 70)
    addressLines.forEach((line: string) => {
      pdf.text(line, margin, yPos)
      yPos += 5
    })

    // Invoice details on the right
    let rightYPos = 65
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(10)
    pdf.setTextColor(...goldColor)
    pdf.text('DETALLES DE FACTURA', pageWidth - margin, rightYPos, { align: 'right' })
    
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(...blackColor)
    rightYPos += 7
    pdf.text(`Fecha: ${formatDate(order.createdAt)}`, pageWidth - margin, rightYPos, { align: 'right' })
    rightYPos += 5
    pdf.text(`Metodo de pago: ${paymentMethodLabels[order.paymentMethod]}`, pageWidth - margin, rightYPos, { align: 'right' })

    yPos = Math.max(yPos, rightYPos) + 15

    // Products table header
    pdf.setFillColor(250, 248, 244)
    pdf.rect(margin, yPos - 5, pageWidth - 2 * margin, 10, 'F')
    
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(9)
    pdf.setTextColor(...blackColor)
    pdf.text('PRODUCTO', margin + 2, yPos + 2)
    pdf.text('CANT.', pageWidth - margin - 60, yPos + 2)
    pdf.text('PRECIO', pageWidth - margin - 30, yPos + 2)
    pdf.text('TOTAL', pageWidth - margin - 2, yPos + 2, { align: 'right' })

    yPos += 12

    // Products
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    
    order.items.forEach((item) => {
      pdf.setTextColor(...blackColor)
      pdf.text(item.product.name, margin + 2, yPos)
      pdf.text(item.quantity.toString(), pageWidth - margin - 58, yPos)
      pdf.text(formatPrice(item.product.price), pageWidth - margin - 28, yPos)
      pdf.text(formatPrice(item.totalPrice), pageWidth - margin - 2, yPos, { align: 'right' })
      
      // Light separator line
      pdf.setDrawColor(230, 230, 230)
      pdf.setLineWidth(0.2)
      pdf.line(margin, yPos + 3, pageWidth - margin, yPos + 3)
      
      yPos += 8
    })

    yPos += 10

    // Totals section
    const totalsX = pageWidth - margin - 60
    
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(...grayColor)
    pdf.text('Subtotal:', totalsX, yPos)
    pdf.setTextColor(...blackColor)
    pdf.text(formatPrice(order.total), pageWidth - margin - 2, yPos, { align: 'right' })
    
    yPos += 6
    pdf.setTextColor(...grayColor)
    pdf.text('Envio:', totalsX, yPos)
    pdf.setTextColor(...blackColor)
    pdf.text('Gratis', pageWidth - margin - 2, yPos, { align: 'right' })

    yPos += 8
    
    // Total with gold background
    pdf.setFillColor(250, 248, 244)
    pdf.rect(totalsX - 5, yPos - 5, pageWidth - margin - totalsX + 7, 12, 'F')
    
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(11)
    pdf.setTextColor(...goldColor)
    pdf.text('TOTAL:', totalsX, yPos + 2)
    pdf.setTextColor(...blackColor)
    pdf.text(formatPrice(order.total), pageWidth - margin - 2, yPos + 2, { align: 'right' })

    yPos += 25

    // Footer
    pdf.setDrawColor(...goldColor)
    pdf.setLineWidth(0.5)
    pdf.line(margin, yPos, pageWidth - margin, yPos)
    
    yPos += 10
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    pdf.setTextColor(...grayColor)
    pdf.text('Gracias por tu preferencia', pageWidth / 2, yPos, { align: 'center' })
    yPos += 5
    pdf.text('Crepes & Waffles - Experiencia Gastronomica', pageWidth / 2, yPos, { align: 'center' })
    yPos += 4
    pdf.setFontSize(8)
    pdf.text('Tel: +57 (1) 123 4567 | info@crepesywaffles.com', pageWidth / 2, yPos, { align: 'center' })
    yPos += 4
    pdf.text('Bogota, Colombia', pageWidth / 2, yPos, { align: 'center' })

    // Save the PDF
    pdf.save(`factura-${order.id}.pdf`)
  }

  return (
    <div className="space-y-4">
      {/* Invoice preview card */}
      <div 
        ref={invoiceRef}
        className="bg-card rounded-2xl border border-border overflow-hidden"
      >
        {/* Invoice header */}
        <div className="bg-secondary/50 p-6 border-b border-border">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground">Crepes & Waffles</h2>
              <p className="text-sm text-muted-foreground">Experiencia Gastronómica</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-accent uppercase tracking-wide">Factura</p>
              <p className="font-mono text-sm font-semibold text-foreground">{order.id}</p>
            </div>
          </div>
        </div>

        {/* Invoice body */}
        <div className="p-6">
          {/* Customer and date info */}
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
              <p className="text-sm text-muted-foreground">Pago: {paymentMethodLabels[order.paymentMethod]}</p>
            </div>
          </div>

          {/* Products table */}
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

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-48 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">{formatPrice(order.total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Envío</span>
                <span className="text-foreground">Gratis</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="font-semibold text-foreground">Total</span>
                <span className="font-serif text-xl font-bold text-accent">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice footer */}
        <div className="bg-secondary/30 p-4 text-center border-t border-border">
          <p className="text-sm text-muted-foreground">Gracias por tu preferencia</p>
          <p className="text-xs text-muted-foreground mt-1">Crepes & Waffles - Tel: +57 (1) 123 4567</p>
        </div>
      </div>

      {/* Download button */}
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
