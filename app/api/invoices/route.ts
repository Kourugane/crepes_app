import { supabaseServer } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await supabaseServer()
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('order_id')

    let query = supabase
      .from('invoices')
      .select('*, order:orders(id, status, payment_method, customer:customers(name, phone))')
      .order('created_at', { ascending: false })

    if (orderId) query = query.eq('order_id', orderId)

    const { data: invoices, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ invoices })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}