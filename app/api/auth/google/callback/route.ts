import { getGoogleAuthClient } from '@/lib/google-auth'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/analytics?error=code_missing`)
    }

    try {
        const client = getGoogleAuthClient()
        const { tokens } = await client.getToken(code)

        // Get user restaurant
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) throw new Error("Non authentifié")

        const { data: restaurant } = await supabase
            .from('restaurants')
            .select('id, settings')
            .eq('owner_id', user.id)
            .single()

        if (!restaurant) throw new Error("Restaurant non trouvé")

        // Save tokens in settings (simple approach for this project)
        const updatedSettings = {
            ...(restaurant.settings || {}),
            google_auth: {
                tokens,
                connected_at: new Date().toISOString(),
                email: (await client.getTokenInfo(tokens.access_token!)).email
            }
        }

        await supabase
            .from('restaurants')
            .update({ settings: updatedSettings })
            .eq('id', restaurant.id)

        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/analytics?success=google_connected`)
    } catch (error) {
        console.error("Google Auth Callback Error:", error)
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/analytics?error=auth_failed`)
    }
}
