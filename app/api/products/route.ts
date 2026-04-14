import { supabaseServer } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/products
export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseServer()
    const { searchParams } = new URL(request.url)
    const categorySlug = searchParams.get('category')
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

    if (categorySlug) {
      // filtrar por slug de categoría
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .single()
      if (cat) query = query.eq('category_id', cat.id)
    }

    if (featured === 'true') query = query.eq('is_featured', true)
    if (search) query = query.ilike('name', `%${search}%`)

    const { data: products, error } = await query

    if (error) {
      console.error('Error fetching products:', error)
      return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 })
    }

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// POST /api/products - Crear producto (admin)
export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseServer()
    const body = await request.json()

    const { name, description, price, image_url, category_id, category_slug, is_active } = body

    if (!name || !price) {
      return NextResponse.json({ error: 'Nombre y precio son requeridos' }, { status: 400 })
    }

    // Resolver category_id desde slug si no viene directo
    let resolvedCategoryId = category_id
    if (!resolvedCategoryId && category_slug) {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category_slug)
        .single()
      resolvedCategoryId = cat?.id || null
    }

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        name,
        description: description || null,
        price: parseFloat(price),
        image: image_url || null,
        category_id: resolvedCategoryId || null,
        is_active: is_active ?? true,
      })
      .select(`
        *,
        category:categories(id, name, slug)
      `)
      .single()

    if (error) {
      console.error('Error creating product:', error)
      return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 })
    }

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
