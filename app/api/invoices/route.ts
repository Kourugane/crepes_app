import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/invoices - Obtener todas las facturas (admin)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const orderId = searchParams.get('order_id')

    let query = supabase
      .from('invoices')
      .select(`
        *,
        order:orders(
          id,
          status,
          delivery_address,
          payment_method,
          items:order_items(
            id,
            quantity,
            unit_price,
            subtotal,
            product:products(id, name)
          )
        )
      `)
      .order('issued_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (orderId) {
      query = query.eq('order_id', orderId)
    }

    const { data: invoices, error } = await query

    if (error) {
      console.error('Error fetching invoices:', error)
      return NextResponse.json(
        { error: 'Error al obtener facturas' },
        { status: 500 }
      )
    }

    return NextResponse.json({ invoices })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    )
  }
}
