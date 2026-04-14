import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/products - Obtener todos los productos o filtrar por categoría
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('category')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')

    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug, description)
      `)
      .eq('is_active', true)
      .order('name')

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true)
    }

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    const { data: products, error } = await query

    if (error) {
      console.error('Error fetching products:', error)
      return NextResponse.json(
        { error: 'Error al obtener productos' },
        { status: 500 }
      )
    }

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/products - Crear un nuevo producto (admin)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { name, description, price, image_url, category_id, is_featured, is_active } = body

    if (!name || !price || !category_id) {
      return NextResponse.json(
        { error: 'Nombre, precio y categoría son requeridos' },
        { status: 400 }
      )
    }

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        name,
        description,
        price: parseFloat(price),
        image_url,
        category_id,
        is_featured: is_featured ?? false,
        is_active: is_active ?? true
      })
      .select(`
        *,
        category:categories(id, name, slug)
      `)
      .single()

    if (error) {
      console.error('Error creating product:', error)
      return NextResponse.json(
        { error: 'Error al crear producto' },
        { status: 500 }
      )
    }

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    )
  }
}
