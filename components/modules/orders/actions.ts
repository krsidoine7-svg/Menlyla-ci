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
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Non connecté")

    const { error, count } = await supabase
        .from('orders')
        .update({ status: status as any })
        .eq('id', orderId)
        .select() // Ensures we get feedback

    if (error) {
        console.error("Order update error:", error)
        throw new Error(error.message || "Erreur lors de la mise à jour")
    }

    revalidatePath('/dashboard/orders')
    return { success: true }
}
