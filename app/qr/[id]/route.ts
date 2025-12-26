import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    // Fetch QR code to find restaurant and table
    const { data: qr } = await supabase
        .from('qr_codes')
        .select('restaurant_id, table_id, restaurants(slug)')
        .eq('id', id)
        .single()

    if (!qr || !qr.restaurants) {
        return NextResponse.redirect(new URL('/', request.url)) // Not found -> Home
    }

    // Determine Redirect URL
    // Target: /slug?table=table_id
    const slug = (qr.restaurants as any).slug
    const targetUrl = new URL(`/${slug}`, request.url)
    if (qr.table_id) {
        targetUrl.searchParams.set('table', qr.table_id)
    }

    return NextResponse.redirect(targetUrl)
}
