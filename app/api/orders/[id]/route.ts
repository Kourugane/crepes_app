import { supabaseServer } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await supabaseServer()
    const { data: order, error } = await supabase
      .from('orders')
      .select(`*, customer:customers(id, name, email, phone, address),
        items:order_items(id, quantity, product_price, total_price, customizations,
          product:products(id, name, image)),
        invoice:invoices(id, invoice_number, total)`)
      .eq('id', id).single()
    if (error) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    return NextResponse.json({ order })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await supabaseServer()
    const { status, notes } = await request.json()

    const validStatuses = ['recibido', 'preparacion', 'en-camino', 'entregado', 'cancelado']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Estado no válido' }, { status: 400 })
    }

    const updates: any = { updated_at: new Date().toISOString() }
    if (status) updates.status = status
    if (notes !== undefined) updates.notes = notes

    const { data: order, error } = await supabase
      .from('orders').update(updates).eq('id', id)
      .select('*, customer:customers(id, name, email, phone)').single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ order })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}