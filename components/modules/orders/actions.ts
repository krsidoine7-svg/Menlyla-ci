'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function getRestaurantOrders() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // Get Restaurant
    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id')
        .eq('owner_id', user.id)
        .single()

    if (!restaurant) return []

    // Fetch Orders with Items and Table
    const { data: orders, error } = await supabase
        .from('orders')
        .select(`
        *,
        tables(name),
        order_items(
            quantity,
            unit_price,
            dishes(name)
        ),
        profiles(full_name)
    `)
        .eq('restaurant_id', restaurant.id)
        .order('created_at', { ascending: false }) // Newest first

    if (error) {
        console.error(error)
        return []
    }

    return orders
}

export async function updateOrderStatus(orderId: string, status: string) {
    const supabase = await createClient()

    // Auth check implicitly handled by RLS 'has_role_in_restaurant' but simple owner check here is good too
    // For now, trust RLS + getUser
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { message: "Non connecté" }

    const { error } = await supabase
        .from('orders')
        .update({ status: status as any })
        .eq('id', orderId)

    if (error) return { message: "Erreur mise à jour" }

    revalidatePath('/dashboard/orders')
    return { message: "Statut mis à jour" }
}
