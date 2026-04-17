import { supabaseServer } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/invoices/[id] - Obtener una factura específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = supabaseServer()

    // Buscar por ID o por número de factura
    let query = supabase
      .from('invoices')
      .select(`
        *,
        order:orders(
          id,
          status,
          delivery_address,
          payment_method,
          notes,
          created_at,
          items:order_items(
            id,
            quantity,
            unit_price,
            subtotal,
            customizations,
            product:products(id, name, description, image_url)
          )
        )
      `)

    // Si parece un UUID, buscar por ID, sino por número de factura
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    
    if (isUUID) {
      query = query.eq('id', id)
    } else {
      query = query.eq('invoice_number', id)
    }

    const { data: invoice, error } = await query.single()

    if (error) {
      console.error('Error fetching invoice:', error)
      return NextResponse.json(
        { error: 'Factura no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ invoice })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/invoices/[id] - Actualizar estado de factura (admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = supabaseServer()
    const body = await request.json()

    const { status } = body

    const validStatuses = ['issued', 'paid', 'cancelled']
    
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Estado no válido' },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (status) {
      updateData.status = status
      if (status === 'paid') {
        updateData.paid_at = new Date().toISOString()
      }
    }

    const { data: invoice, error } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      console.error('Error updating invoice:', error)
      return NextResponse.json(
        { error: 'Error al actualizar factura' },
        { status: 500 }
      )
    }

    return NextResponse.json({ invoice })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    )
  }
}
