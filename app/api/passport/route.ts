import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    try {
        const body = await request.json()

        const {
            username,
            full_name,
            bio,
            phone,
            email,
            profile_image,
            social_links,
            custom_links
        } = body

        // Check if username is already taken by another user
        if (username) {
            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('id')
                .eq('username', username)
                .neq('id', user.id)
                .single()

            if (existingProfile) {
                return NextResponse.json(
                    { error: 'Ce nom d\'utilisateur est déjà pris' },
                    { status: 400 }
                )
            }
        }

        // Update profile data (profiles table)
        const { data, error } = await supabase
            .from('profiles')
            .update({
                username,
                full_name,
                bio,
                phone,
                email,
                profile_image,
                social_links,
                custom_links,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id)
            .select()
            .single()

        if (error) {
            console.error('Database error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, data })
    } catch (error: any) {
        console.error('API error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function GET(request: NextRequest) {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('username, full_name, bio, phone, email, profile_image, social_links, custom_links')
            .eq('id', user.id)
            .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ data: data || null })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
