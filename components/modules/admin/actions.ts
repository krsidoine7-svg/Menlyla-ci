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
        .filter(o => ['delivered', 'completed', 'paid', 'ready', 'confirmed'].includes(o.status)) // Count confirmed/ready as earned for the chart
        .reduce((sum, o) => sum + Number(o.total_amount), 0)

    const orderCount = orders.length
    const preparingCount = orders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status)).length

    // 2. Top Dishes
    const { data: topItems } = await supabase
        .from('order_items')
        .select(`
            quantity,
            dishes (
                name,
                image_urls
            ),
            orders!inner(restaurant_id)
        `)
        .eq('orders.restaurant_id', restaurant.id)
        .limit(100)

    const dishCounts: Record<string, { count: number, name: string, image: string }> = {}
    topItems?.forEach((item: any) => {
        const dish = item.dishes
        if (!dish) return
        if (!dishCounts[dish.name]) {
            dishCounts[dish.name] = { count: 0, name: dish.name, image: dish.image_urls?.[0] || '' }
        }
        dishCounts[dish.name].count += item.quantity
    })

    const topDishes = Object.values(dishCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)

    // 3. Average Rating
    const { data: ratedOrders } = await supabase
        .from('orders')
        .select('rating')
        .eq('restaurant_id', restaurant.id)
        .not('rating', 'is', null)

    const avgRating = ratedOrders && ratedOrders.length > 0
        ? ratedOrders.reduce((sum, o) => sum + (o.rating || 0), 0) / ratedOrders.length
        : 5.0

    return {
        revenue: totalRevenue,
        count: orderCount,
        preparing: preparingCount,
        topDishes,
        avgRating: Number(avgRating.toFixed(1)),
        currency: restaurant.currency || 'XOF'
    }
}

export async function getRecentOrders() {
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

    const { data: orders } = await supabase
        .from('orders')
        .select(`
            id,
            created_at,
            status,
            total_amount,
            tables (
                name
            )
        `)
        .eq('restaurant_id', restaurant.id)
        .order('created_at', { ascending: false })
        .limit(5)

    return orders || []
}

export async function getWeeklyRevenue() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id')
        .eq('owner_id', user.id)
        .single()

    if (!restaurant) return []

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    const startDate = sevenDaysAgo.toISOString().split('T')[0]

    const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .eq('restaurant_id', restaurant.id)
        .gte('created_at', startDate)
        .in('status', ['confirmed', 'preparing', 'ready', 'delivered', 'completed', 'paid']) // Count all active/completed orders as revenue for the chart

    // Initialize 7 days with 0
    const daysMap = new Map<string, number>()
    const result = []

    for (let i = 0; i < 7; i++) {
        const d = new Date()
        d.setDate(d.getDate() - (6 - i))
        const dayName = d.toLocaleDateString('fr-FR', { weekday: 'short' })
        const dateKey = d.toISOString().split('T')[0]
        // We use a composite key of date str to aggregate, but we display dayName
        // Actually simplest is just to loop through last 7 days and check orders match

        let dailyTotal = 0
        if (orders) {
            dailyTotal = orders
                .filter(o => o.created_at.startsWith(dateKey))
                .reduce((sum, o) => sum + Number(o.total_amount), 0)
        }

        // Capitalize first letter
        const formattedName = dayName.charAt(0).toUpperCase() + dayName.slice(1)
        result.push({ name: formattedName, total: dailyTotal })
    }

    return result
}

export async function getOnboardingStatus() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('username, full_name, profile_image')
        .eq('id', user.id)
        .single()

    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id, phone, address, cuisine_type, logo_url, settings')
        .eq('owner_id', user.id)
        .single()

    const status = {
        restaurant: !!restaurant?.phone && !!restaurant?.address,
        logo: !!restaurant?.logo_url,
        hours: !!(restaurant?.settings as any)?.hours?.schedule,
        menu: false,
        tables: false,
        persona: !!profile?.username && !!profile?.full_name,
        branding: !!restaurant?.logo_url && !!(restaurant?.settings as any)?.hours?.schedule // Keep for backward compatibility if needed
    }

    if (restaurant) {
        // Check dishes (at least one)
        const { count: dishesCount } = await supabase
            .from('dishes')
            .select('*', { count: 'exact', head: true })
            .eq('restaurant_id', restaurant.id)

        status.menu = (dishesCount || 0) > 0

        // Check tables (at least one)
        const { count: tablesCount } = await supabase
            .from('tables')
            .select('*', { count: 'exact', head: true })
            .eq('restaurant_id', restaurant.id)

        status.tables = (tablesCount || 0) > 0
    }

    return status
}

export async function getRestaurantInfo() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('slug, plan')
        .eq('owner_id', user.id)
        .single()

    return restaurant || null
}

export async function getRestaurantSlug() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('slug')
        .eq('owner_id', user.id)
        .single()

    return restaurant?.slug || null
}
