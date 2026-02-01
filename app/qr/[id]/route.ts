import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    // 1. Récupérer le QR code
    const { data: qr, error: qrErr } = await supabase
        .from('qr_codes')
        .select('restaurant_id, table_id')
        .eq('id', id)
        .single()

    if (qrErr || !qr) {
        return NextResponse.redirect(new URL('/?error=qr_not_found', request.url))
    }

    // 2. Récupérer le Restaurant
    const { data: restaurant, error: restErr } = await supabase
        .from('restaurants')
        .select('slug, id')
        .eq('id', qr.restaurant_id)
        .single()

    if (restErr || !restaurant) {
        return NextResponse.redirect(new URL('/?error=restaurant_not_found', request.url))
    }

    // 3. Construction dynamique de l'URL finale
    // On récupère le protocole (http/https) et l'hôte (domaine) directement depuis la requête
    const host = request.headers.get('host') || 'menlyla-chi.vercel.app'
    const protocol = request.headers.get('x-forwarded-proto') || 'https'

    const slug = restaurant.slug || `res-${restaurant.id}`
    const targetPath = `/${slug}${qr.table_id ? `?table=${qr.table_id}` : ''}`

    // On force la redirection vers le même domaine que celui qui a reçu le scan
    const finalRedirectUrl = `${protocol}://${host}${targetPath}`

    console.log("QR Scan success. Redirecting to:", finalRedirectUrl)

    return NextResponse.redirect(finalRedirectUrl)
}
