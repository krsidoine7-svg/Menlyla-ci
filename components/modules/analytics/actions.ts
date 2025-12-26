'use server'

import { createClient } from '@/lib/supabase/server'

export async function getAnalyticsData(range: '7d' | '30d' = '7d') {
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

    // Calculate start date
    const now = new Date()
    const startDate = new Date()
    startDate.setDate(now.getDate() - (range === '7d' ? 7 : 30))

    // Fetch Orders within range
    const { data: orders } = await supabase
        .from('orders')
        .select(`
            id,
            total_amount,
            created_at,
            status,
            order_items (
                quantity,
                unit_price,
                total_price,
                dishes (
                    name
                )
            )
        `)
        .eq('restaurant_id', restaurant.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true })

    if (!orders) return null

    // Process Data
    const dailyRevenue: Record<string, number> = {}
    const productSales: Record<string, number> = {}

    let totalRevenue = 0
    let totalOrders = orders.length

    orders.forEach(order => {
        if (['cancelled', 'pending'].includes(order.status)) return // Filter out cancelled/pending for revenue? Or keep paid/delivered? 
        // For accurate revenue, stick to 'paid' or completed statuses.
        // Let's assume delivered/paid/completed are valid sales.
        if (!['delivered', 'completed', 'paid'].includes(order.status)) return

        totalRevenue += Number(order.total_amount)

        // Daily aggregation
        const day = new Date(order.created_at).toLocaleDateString('fr-FR', { weekday: 'short' })
        dailyRevenue[day] = (dailyRevenue[day] || 0) + Number(order.total_amount)

        // Product aggregation
        order.order_items?.forEach((item: any) => {
            const productName = item.dishes?.name || 'Inconnu'
            productSales[productName] = (productSales[productName] || 0) + item.quantity
        })
    })

    // Format for Recharts
    const chartData = Object.keys(dailyRevenue).map(day => ({
        name: day,
        total: dailyRevenue[day]
    }))

    // Top Products
    const topProducts = Object.entries(productSales)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }))

    return {
        revenue: totalRevenue,
        ordersCount: totalOrders,
        averageBasket: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        currency: restaurant.currency,
        chartData,
        topProducts
    }
}
