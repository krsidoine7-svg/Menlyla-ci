import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAnalyticsData } from '@/components/modules/analytics/actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SalesChart } from '@/components/modules/analytics/components/sales-chart'
import { DollarSign, ShoppingBag, TrendingUp, CreditCard } from 'lucide-react'

export default async function AnalyticsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const stats = await getAnalyticsData('7d')

    if (!stats) return <div>Chargement...</div>

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>

            {/* KPI GRID */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Revenu (7j)</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.revenue.toLocaleString()} {stats.currency}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Panier Moyen</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Math.round(stats.averageBasket).toLocaleString()} {stats.currency}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Commandes (7j)</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.ordersCount}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* CHART */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Aperçu des Ventes</CardTitle>
                        <CardDescription>Revenu quotidien sur les 7 derniers jours.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <SalesChart data={stats.chartData} currency={stats.currency} />
                    </CardContent>
                </Card>

                {/* TOP PRODUCTS */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Top Produits</CardTitle>
                        <CardDescription>Vos meilleures ventes cette semaine.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {stats.topProducts.map((product, index) => (
                                <div key={index} className="flex items-center">
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{product.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {product.count} ventes
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium">#{index + 1}</div>
                                </div>
                            ))}
                            {stats.topProducts.length === 0 && (
                                <div className="text-sm text-muted-foreground">Aucune vente enregistrée.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
