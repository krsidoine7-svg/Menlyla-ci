'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function likeDish(dishId: string) {
    const supabase = await createClient()

    // Simple increment (no auth needed for public likes for now)
    const { data, error } = await supabase.rpc('increment_dish_likes', { dish_id: dishId })

    // Fallback if RPC not defined: update manually
    if (error) {
        const { data: currentDish } = await supabase.from('dishes').select('likes_count').eq('id', dishId).single()
        await supabase
            .from('dishes')
            .update({ likes_count: (currentDish?.likes_count || 0) + 1 })
            .eq('id', dishId)
    }

    return { success: true }
}
