'use server'

import { createClient } from '@/lib/supabase/server'

export async function getAnalyticsData(range: '7d' | '30d' = '7d') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Get Restaurant
    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id, currency, settings')
        .eq('owner_id', user.id)
        .single()

    if (!restaurant) return null

    // Calculate start date
    const now = new Date()
    const startDate = new Date()
    startDate.setDate(now.getDate() - (range === '7d' ? 7 : 30))

    // Fetch Orders within range
    const { data: orders, error: ordersError } = await supabase
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

    if (ordersError) {
        console.error("Analytics fetch error:", ordersError)
    }

    const safeOrders = orders || []

    // Process Data
    const dailyRevenue: Record<string, number> = {}

    // Product Stats: { [name]: { ordered: 0, refused: 0, served: 0, revenue: 0 } }
    const dishPerformance: Record<string, { name: string, ordered: number, refused: number, served: number, revenue: number }> = {}

    let totalRevenue = 0
    let totalOrders = safeOrders.length

    safeOrders.forEach(order => {
        const isRevenueStatus = ['delivered', 'completed', 'paid'].includes(order.status)
        const isRefused = order.status === 'cancelled'
        const isServed = ['delivered', 'completed'].includes(order.status)

        if (isRevenueStatus) {
            totalRevenue += Number(order.total_amount)
            const day = new Date(order.created_at).toLocaleDateString('fr-FR', { weekday: 'short' })
            dailyRevenue[day] = (dailyRevenue[day] || 0) + Number(order.total_amount)
        }

        order.order_items?.forEach((item: any) => {
            const dishName = item.dishes?.name || 'Inconnu'
            if (!dishPerformance[dishName]) {
                dishPerformance[dishName] = { name: dishName, ordered: 0, refused: 0, served: 0, revenue: 0 }
            }

            const stats = dishPerformance[dishName]
            stats.ordered += item.quantity

            if (isRefused) stats.refused += item.quantity
            if (isServed) stats.served += item.quantity
            if (isRevenueStatus) stats.revenue += Number(item.total_price)
        })
    })

    // Format for Recharts
    const chartData = Object.keys(dailyRevenue).map(day => ({
        name: day,
        total: dailyRevenue[day]
    }))

    // Sort to find best sellers
    const performanceList = Object.values(dishPerformance).sort((a, b) => b.ordered - a.ordered)

    return {
        revenue: totalRevenue,
        ordersCount: totalOrders,
        averageBasket: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        currency: restaurant.currency,
        chartData,
        topProducts: performanceList.slice(0, 5).map(p => ({ name: p.name, count: p.ordered })),
        dishPerformance: performanceList, // Full list for detailed table
        settings: restaurant.settings
    }
}

export async function syncToGoogleSheets(stats: any) {
    const webhookUrl = stats?.settings?.gsheet_webhook

    if (!webhookUrl) {
        return { success: false, message: "URL du Webhook non configurée dans les paramètres." }
    }

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                restaurant_id: stats.restaurant_id,
                sync_date: new Date().toISOString(),
                summary: {
                    revenue: stats.revenue,
                    orders: stats.ordersCount,
                    avg_basket: stats.averageBasket,
                    currency: stats.currency
                },
                top_products: stats.topProducts,
                dish_performance: stats.dishPerformance
            })
        })

        if (!response.ok) throw new Error("Erreur lors de l'envoi au webhook")

        return { success: true, message: "Synchronisation réussie !" }
    } catch (error: any) {
        console.error("Sync error:", error)
        return { success: false, message: `Échec de la synchronisation: ${error.message}` }
    }
}
