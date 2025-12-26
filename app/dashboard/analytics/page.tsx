import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAnalyticsData } from '@/components/modules/analytics/actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SalesChart } from '@/components/modules/analytics/components/sales-chart'
import { DishComparisonChart } from '@/components/modules/analytics/components/dish-comparison-chart'
import { DollarSign, ShoppingBag, TrendingUp, CreditCard, BarChart3 } from 'lucide-react'

export default async function AnalyticsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const stats = await getAnalyticsData('7d')

    if (!stats) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <BarChart3 className="h-12 w-12 text-muted-foreground opacity-20" />
                <h2 className="text-xl font-semibold">Restaurant non configuré</h2>
                <p className="text-muted-foreground text-center max-w-sm">
                    Nous n'avons pas trouvé de restaurant associé à votre compte.
                    Assurez-vous d'avoir configuré votre établissement dans les paramètres.
                </p>
            </div>
        )
    }

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
                        <CardTitle>Top Produits ⭐</CardTitle>
                        <CardDescription>Vos plats les plus "Aimés" (les plus commandés).</CardDescription>
                    </CardHeader>
                    <CardContent drop-shadow-sm>
                        <div className="space-y-6">
                            {stats.topProducts.map((product, index) => (
                                <div key={index} className="flex items-center gap-4">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-orange-600 font-bold">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">{product.name}</p>
                                        <p className="text-xs text-muted-foreground">{product.count} commandes au total</p>
                                    </div>
                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* NEW: DISH COMPARISON CHART */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-orange-500" />
                        Comparaison de Performance des Plats
                    </CardTitle>
                    <CardDescription>Volume de commandes vs Plats servis vs Refusés (Top 10)</CardDescription>
                </CardHeader>
                <CardContent>
                    <DishComparisonChart data={stats.dishPerformance} />
                </CardContent>
            </Card>

            {/* PRODUCT PERFORMANCE TABLE */}
            <Card>
                <CardHeader>
                    <CardTitle>Détails de Performance des Plats</CardTitle>
                    <CardDescription>Analyse précise des plats commandés, servis et refusés.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Plat</th>
                                    <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">Commandés</th>
                                    <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground text-green-600">Servis (Payés)</th>
                                    <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground text-red-600">Refusés</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Revenue Total</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {stats.dishPerformance.map((p: any, i: number) => (
                                    <tr key={i} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle font-semibold">{p.name}</td>
                                        <td className="p-4 align-middle text-center">{p.ordered}</td>
                                        <td className="p-4 align-middle text-center font-bold text-green-600">{p.served}</td>
                                        <td className="p-4 align-middle text-center font-bold text-red-600">{p.refused}</td>
                                        <td className="p-4 align-middle text-right font-bold">{p.revenue.toLocaleString()} {stats.currency}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {stats.dishPerformance.length === 0 && (
                            <div className="py-10 text-center text-muted-foreground">
                                Aucune donnée de performance disponible.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

        </div>
    )
}
