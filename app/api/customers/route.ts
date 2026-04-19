import { supabaseServer } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await supabaseServer()
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    let query = supabase.from('customers').select('*').order('created_at', { ascending: false })
    if (search) query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`)

    const { data: customers, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ customers })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}