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
    // Use NEXT_PUBLIC_APP_URL if defined, otherwise use the request origin
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${request.headers.get('host')}`
    const targetUrl = new URL(`/${slug}`, baseUrl)
    if (qr.table_id) {
        targetUrl.searchParams.set('table', qr.table_id)
    }

    return NextResponse.redirect(targetUrl)
}
