import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/orders - Obtener todos los pedidos (admin)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
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
          unit_price,
          subtotal,
          customizations,
          product:products(id, name, image_url)
        )
      `)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (customerId) {
      query = query.eq('customer_id', customerId)
    }

    const { data: orders, error } = await query

    if (error) {
      console.error('Error fetching orders:', error)
      return NextResponse.json(
        { error: 'Error al obtener pedidos' },
        { status: 500 }
      )
    }

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/orders - Crear un nuevo pedido
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { customer, items, delivery_address, payment_method, notes } = body

    if (!customer || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Cliente e items son requeridos' },
        { status: 400 }
      )
    }

    // Crear o buscar cliente
    let customerId: string

    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', customer.email)
      .single()

    if (existingCustomer) {
      customerId = existingCustomer.id
      
      // Actualizar datos del cliente
      await supabase
        .from('customers')
        .update({
          name: customer.name,
          phone: customer.phone,
          address: delivery_address
        })
        .eq('id', customerId)
    } else {
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: delivery_address
        })
        .select('id')
        .single()

      if (customerError) {
        console.error('Error creating customer:', customerError)
        return NextResponse.json(
          { error: 'Error al crear cliente' },
          { status: 500 }
        )
      }

      customerId = newCustomer.id
    }

    // Calcular totales
    const subtotal = items.reduce((sum: number, item: { subtotal: number }) => sum + item.subtotal, 0)
    const tax = subtotal * 0.19 // IVA Colombia 19%
    const total = subtotal + tax

    // Crear pedido
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: customerId,
        status: 'pending',
        subtotal,
        tax,
        total,
        delivery_address,
        payment_method,
        notes
      })
      .select('*')
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      return NextResponse.json(
        { error: 'Error al crear pedido' },
        { status: 500 }
      )
    }

    // Crear items del pedido
    const orderItems = items.map((item: {
      product_id: string
      quantity: number
      unit_price: number
      subtotal: number
      customizations?: Record<string, string>
    }) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.subtotal,
      customizations: item.customizations || {}
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Error creating order items:', itemsError)
      // Rollback: eliminar el pedido
      await supabase.from('orders').delete().eq('id', order.id)
      return NextResponse.json(
        { error: 'Error al crear items del pedido' },
        { status: 500 }
      )
    }

    // Crear factura
    const invoiceNumber = `CW-${Date.now().toString(36).toUpperCase()}`
    
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        order_id: order.id,
        invoice_number: invoiceNumber,
        subtotal,
        tax,
        total,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_address: delivery_address,
        status: 'issued'
      })
      .select('*')
      .single()

    if (invoiceError) {
      console.error('Error creating invoice:', invoiceError)
    }

    return NextResponse.json({ 
      order: {
        ...order,
        invoice_number: invoice?.invoice_number
      },
      invoice 
    }, { status: 201 })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    )
  }
}
