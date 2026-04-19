import { supabaseServer } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await supabaseServer()
    const { data: product, error } = await supabase
      .from('products')
      .select('*, category:categories(id, name, slug)')
      .eq('id', id).single()
    if (error) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    return NextResponse.json({ product })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await supabaseServer()
    const body = await request.json()
    const { name, description, price, image, category_slug, is_active } = body

    let categoryId = undefined
    if (category_slug) {
      const { data: cat } = await supabase
        .from('categories').select('id').eq('slug', category_slug).single()
      categoryId = cat?.id || null
    }

    const updates: any = { updated_at: new Date().toISOString() }
    if (name !== undefined) updates.name = name
    if (description !== undefined) updates.description = description
    if (price !== undefined) updates.price = parseFloat(price)
    if (image !== undefined) updates.image = image
    if (categoryId !== undefined) updates.category_id = categoryId
    if (is_active !== undefined) updates.is_active = is_active

    const { data: product, error } = await supabase
      .from('products').update(updates).eq('id', id)
      .select('*, category:categories(id, name, slug)').single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ product })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await supabaseServer()
    const { error } = await supabase
      .from('products')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ message: 'Producto eliminado' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}