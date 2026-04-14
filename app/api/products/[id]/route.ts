import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/products/[id] - Obtener un producto específico con sus personalizaciones
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug, description),
        customizations(
          id,
          name,
          type,
          is_required,
          options:customization_options(id, name, price_modifier)
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching product:', error)
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/products/[id] - Actualizar un producto (admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()

    const { name, description, price, image_url, category_id, is_featured, is_active } = body

    const { data: product, error } = await supabase
      .from('products')
      .update({
        name,
        description,
        price: price ? parseFloat(price) : undefined,
        image_url,
        category_id,
        is_featured,
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        category:categories(id, name, slug)
      `)
      .single()

    if (error) {
      console.error('Error updating product:', error)
      return NextResponse.json(
        { error: 'Error al actualizar producto' },
        { status: 500 }
      )
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id] - Eliminar un producto (admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting product:', error)
      return NextResponse.json(
        { error: 'Error al eliminar producto' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Producto eliminado exitosamente' })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    )
  }
}
