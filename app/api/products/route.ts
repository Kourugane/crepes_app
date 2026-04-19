import { supabaseServer } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await supabaseServer()
    const { searchParams } = new URL(request.url)
    const categorySlug = searchParams.get('category')
    const search = searchParams.get('search')

    let query = supabase
      .from('products')
      .select('*, category:categories(id, name, slug)')
      .eq('is_active', true)
      .order('name')

    if (categorySlug) {
      const { data: cat } = await supabase
        .from('categories').select('id').eq('slug', categorySlug).single()
      if (cat) query = query.eq('category_id', cat.id)
    }
    if (search) query = query.ilike('name', `%${search}%`)

    const { data: products, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ products })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await supabaseServer()
    const body = await request.json()
    const { name, description, price, image, category_slug, is_active } = body

    if (!name || !price) {
      return NextResponse.json({ error: 'Nombre y precio son requeridos' }, { status: 400 })
    }

    let categoryId = null
    if (category_slug) {
      const { data: cat } = await supabase
        .from('categories').select('id').eq('slug', category_slug).single()
      categoryId = cat?.id || null
    }

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        name,
        description: description || null,
        price: parseFloat(price),
        image: image || null,
        category_id: categoryId,
        is_active: is_active ?? true,
      })
      .select('*, category:categories(id, name, slug)')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ product }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}