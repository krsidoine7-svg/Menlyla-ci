import { createClient } from '@/lib/supabase/server'

export async function checkDesignData() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No user' }

    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', user.id)
        .single()

    const { data: settings } = await supabase
        .from('restaurant_settings')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .single()

    return { restaurant, settings }
}
