import { supabaseServer } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/customers - Obtener todos los clientes (admin)
export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseServer()
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    let query = supabase
      .from('customers')
      .select(`
        *,
        orders:orders(count)
      `)
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { data: customers, error } = await query

    if (error) {
      console.error('Error fetching customers:', error)
      return NextResponse.json(
        { error: 'Error al obtener clientes' },
        { status: 500 }
      )
    }

    return NextResponse.json({ customers })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    )
  }
}

// GET customer by email
export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseServer()
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      )
    }

    const { data: customer, error } = await supabase
      .from('customers')
      .select(`
        *,
        orders:orders(
          id,
          status,
          total,
          created_at
        )
      `)
      .eq('email', email)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ customer })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    )
  }
}
