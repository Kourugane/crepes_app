import { supabaseServer } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/orders - Obtener todos los pedidos (admin)
export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseServer()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const customerId = searchParams.get('customer_id')

    let query = supabase
      .from('orders')
      .select(`
        *,
        customer:customers(id, name, email, phone),
        items:order_items(
          id,
          quantity,
          product_price,
          total_price,
          customizations,
          product:products(id, name, image)
        )
      `)
      .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)
    if (customerId) query = query.eq('customer_id', customerId)

    const { data: orders, error } = await query

    if (error) {
      console.error('Error fetching orders:', error)
      return NextResponse.json({ error: 'Error al obtener pedidos' }, { status: 500 })
    }

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// POST /api/orders - Crear un nuevo pedido completo
export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseServer()
    const body = await request.json()

    const { customer, items, subtotal, tax, total, delivery_address, payment_method, notes } = body

    if (!customer || !items || items.length === 0) {
      return NextResponse.json({ error: 'Cliente e items son requeridos' }, { status: 400 })
    }

    // ─── 1. Crear o reutilizar cliente ─────────────────────────────────────
    let customerId: string

    // Buscar por teléfono (no siempre hay email)
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', customer.phone)
      .maybeSingle()

    if (existingCustomer) {
      customerId = existingCustomer.id
      await supabase
        .from('customers')
        .update({ name: customer.name, email: customer.email || null, address: delivery_address })
        .eq('id', customerId)
    } else {
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({
          name: customer.name,
          email: customer.email || null,
          phone: customer.phone,
          address: delivery_address,
        })
        .select('id')
        .single()

      if (customerError || !newCustomer) {
        console.error('Error creating customer:', customerError)
        return NextResponse.json({ error: 'Error al crear cliente' }, { status: 500 })
      }
      customerId = newCustomer.id
    }

    // ─── 2. Generar número de orden único ──────────────────────────────────
    const orderNumber = `CW-${Date.now().toString(36).toUpperCase()}`

    // ─── 3. Calcular totales ───────────────────────────────────────────────
    const computedSubtotal = subtotal ?? items.reduce((s: number, i: any) => s + i.total_price, 0)
    const computedTax = tax ?? Math.round(computedSubtotal * 0.19)
    const computedTotal = total ?? computedSubtotal + computedTax

    // ─── 4. Crear orden ────────────────────────────────────────────────────
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_id: customerId,
        status: 'recibido',
        total: computedTotal,
        payment_method,
        notes: notes || null,
      })
      .select('*')
      .single()

    if (orderError || !order) {
      console.error('Error creating order:', orderError)
      return NextResponse.json({ error: 'Error al crear pedido' }, { status: 500 })
    }

    // ─── 5. Crear order_items ──────────────────────────────────────────────
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id || null,
      product_name: item.product_name,
      product_price: item.product_price,
      quantity: item.quantity,
      customizations: item.customizations || {},
      total_price: item.total_price,
    }))

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

    if (itemsError) {
      console.error('Error creating order items:', itemsError)
      // Rollback
      await supabase.from('orders').delete().eq('id', order.id)
      return NextResponse.json({ error: 'Error al guardar items del pedido' }, { status: 500 })
    }

    // ─── 6. Crear factura con IVA ──────────────────────────────────────────
    const invoiceNumber = `FAC-${orderNumber}`

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        order_id: order.id,
        subtotal: computedSubtotal,
        tax: computedTax,
        total: computedTotal,
      })
      .select('*')
      .single()

    if (invoiceError) {
      console.error('Error creating invoice (non-fatal):', invoiceError)
    }

    return NextResponse.json({
      order: {
        ...order,
        invoice_number: invoice?.invoice_number,
      },
      invoice,
    }, { status: 201 })

  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
