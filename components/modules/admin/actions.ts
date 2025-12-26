'use server'

import { createClient } from '@/lib/supabase/server'

export async function getDashboardStats() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Get Restaurant
    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id, currency')
        .eq('owner_id', user.id)
        .single()

    if (!restaurant) return null

    const today = new Date().toISOString().split('T')[0]

    // 1. Orders Today
    const { data: orders, error } = await supabase
        .from('orders')
        .select('total_amount, status, created_at')
        .eq('restaurant_id', restaurant.id)
        .gte('created_at', today) // Since midnight UTC (approx)

    if (error || !orders) return { revenue: 0, count: 0, preparing: 0, currency: restaurant.currency }

    // Calc Stats
    const totalRevenue = orders
        .filter(o => ['delivered', 'completed', 'paid'].includes(o.status)) // Only counted if served/paid
        .reduce((sum, o) => sum + Number(o.total_amount), 0)

    const orderCount = orders.length
    const preparingCount = orders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status)).length

    return {
        revenue: totalRevenue,
        count: orderCount,
        preparing: preparingCount,
        currency: restaurant.currency || 'XOF'
    }
}
