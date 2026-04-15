import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAnalyticsData } from '@/components/modules/analytics/actions'
import { NoRestaurantState } from '@/components/modules/admin/no-restaurant'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SalesChart } from '@/components/modules/analytics/components/sales-chart'
import { DishComparisonChart } from '@/components/modules/analytics/components/dish-comparison-chart'
import { TopProductsChart } from '@/components/modules/analytics/components/top-products-chart'
import { ExportButton } from '@/components/modules/analytics/components/export-button'
import { AnalyticsFilter } from '@/components/modules/analytics/components/analytics-filter'
import { DollarSign, ShoppingBag, TrendingUp, CreditCard, BarChart3 } from 'lucide-react'

export default async function AnalyticsPage(props: { searchParams?: Promise<{ range?: string }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    let searchParams: any = {}
    if (props.searchParams) {
        searchParams = await props.searchParams
    }
    const rangeParam = searchParams?.range || '7d'
    const range = ['today', '7d', '30d', 'year', 'custom'].includes(rangeParam) ? rangeParam : '7d'
    const startParam = searchParams?.start
    const endParam = searchParams?.end

    if (!user) {
        redirect('/login')
    }

    const { data: restaurant } = await supabase.from('restaurants').select('id').eq('owner_id', user?.id).single()

    if (!restaurant) return <NoRestaurantState />

    const stats = await getAnalyticsData(range, startParam, endParam)

    if (!stats) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <BarChart3 className="h-12 w-12 text-slate-200" />
                <h2 className="text-xl font-semibold text-slate-700">Données non disponibles</h2>
                <p className="text-slate-500 text-center max-w-sm">
                    Aucune statistique n'a été générée pour le moment. Attendez les premières commandes !
                </p>
            </div>
        )
    }

    const totalServed = stats.dishPerformance.reduce((acc: number, p: any) => acc + p.served, 0)
    const totalOrdered = stats.dishPerformance.reduce((acc: number, p: any) => acc + p.ordered, 0)
    const roiPercentage = totalOrdered > 0 ? Math.round((totalServed / totalOrdered) * 100) : 0

    return (
        <div className="flex flex-col gap-8 p-2 md:p-6 max-w-[1600px] mx-auto animate-in fade-in duration-700">
            <header className="relative flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="space-y-3">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
                        Analytics
                    </h1>
                    <p className="text-slate-500 text-lg max-w-xl">
                        Suivez vos performances, analysez vos ventes et découvrez vos meilleurs plats.
                    </p>
                </div>
                
                <div className="flex flex-col sm:flex-row flex-wrap xl:flex-nowrap items-end sm:items-center justify-end gap-3 w-full xl:w-auto">
                    <AnalyticsFilter />
                    <ExportButton stats={stats} restaurantId={restaurant.id} />
                </div>
            </header>

            {/* KPI GRID */}
            <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-4">
                <Card className="rounded-3xl border border-slate-100 shadow-sm bg-white p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-row items-center justify-between space-y-0 mb-4">
                        <h3 className="text-sm font-semibold text-slate-500">Revenu Net</h3>
                        <div className="h-10 w-10 bg-emerald-50 rounded-2xl flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-emerald-600" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-slate-900">{stats.revenue.toLocaleString()} <span className="text-base font-medium text-slate-400">{stats.currency}</span></div>
                </Card>

                <Card className="rounded-3xl border border-slate-100 shadow-sm bg-white p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-row items-center justify-between space-y-0 mb-4">
                        <h3 className="text-sm font-semibold text-slate-500">Performance ROI</h3>
                        <div className="h-10 w-10 bg-orange-50 rounded-2xl flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-orange-600" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-slate-900">{roiPercentage}% <span className="text-xs font-medium text-slate-500 block mt-1">Taux de conversion</span></div>
                </Card>

                <Card className="rounded-3xl border border-slate-100 shadow-sm bg-white p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-row items-center justify-between space-y-0 mb-4">
                        <h3 className="text-sm font-semibold text-slate-500">Panier Moyen</h3>
                        <div className="h-10 w-10 bg-blue-50 rounded-2xl flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-blue-600" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-slate-900">{Math.round(stats.averageBasket).toLocaleString()} <span className="text-base font-medium text-slate-400">{stats.currency}</span></div>
                </Card>

                <Card className="rounded-3xl border border-slate-100 shadow-sm bg-white p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-row items-center justify-between space-y-0 mb-4">
                        <h3 className="text-sm font-semibold text-slate-500">Commandes Totales</h3>
                        <div className="h-10 w-10 bg-violet-50 rounded-2xl flex items-center justify-center">
                            <ShoppingBag className="h-5 w-5 text-violet-600" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-slate-900">{stats.ordersCount}</div>
                </Card>
            </div>

            <div className="grid gap-5 lg:grid-cols-7">
                {/* CHART */}
                <Card className="lg:col-span-4 rounded-3xl border border-slate-100 shadow-sm bg-white overflow-hidden flex flex-col">
                    <CardHeader className="p-6 pb-2 border-b border-slate-50 bg-slate-50/30">
                        <CardTitle className="text-lg font-bold text-slate-900">Aperçu des Ventes</CardTitle>
                        <CardDescription className="text-sm font-medium text-slate-500">Revenu quotidien sur les 7 derniers jours.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 flex-1">
                        <SalesChart data={stats.chartData} currency={stats.currency} />
                    </CardContent>
                </Card>

                {/* TOP PRODUCTS */}
                <Card className="lg:col-span-3 rounded-3xl border border-slate-100 shadow-sm bg-white overflow-hidden flex flex-col">
                    <CardHeader className="p-6 pb-2 border-b border-slate-50 bg-slate-50/30">
                        <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">Top Produits ⭐</CardTitle>
                        <CardDescription className="text-sm font-medium text-slate-500">Vos plats les plus "Aimés" (les plus commandés).</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-8 flex-1">
                        <TopProductsChart data={stats.topProducts} />
                        <div className="space-y-4">
                            {stats.topProducts.slice(0, 5).map((product, index) => (
                                <div key={index} className="flex items-center gap-4 bg-slate-50/50 p-3 rounded-2xl border border-slate-50 hover:border-slate-100 transition-colors">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 text-slate-700 font-bold text-sm">
                                        #{index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-slate-800 leading-tight">{product.name}</p>
                                        <p className="text-xs text-slate-500 font-medium mt-0.5">{product.count} commandes</p>
                                    </div>
                                    <div className="bg-emerald-50 p-2.5 rounded-xl">
                                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* NEW: DISH COMPARISON CHART */}
            <Card className="rounded-3xl border border-slate-100 shadow-sm bg-white overflow-hidden">
                <CardHeader className="p-6 pb-4 border-b border-slate-50 bg-slate-50/30">
                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-slate-400" />
                        Performance Détaillée par Plat
                    </CardTitle>
                    <CardDescription className="text-sm font-medium text-slate-500">Volume de commandes vs Plats servis vs Refusés (Top 10)</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <DishComparisonChart data={stats.dishPerformance} />
                </CardContent>
            </Card>

            {/* PRODUCT PERFORMANCE TABLE */}
            <Card className="rounded-3xl border border-slate-100 shadow-sm bg-white overflow-hidden">
                <CardHeader className="p-6 pb-4 border-b border-slate-50 bg-slate-50/30">
                    <CardTitle className="text-lg font-bold text-slate-900">Historique des Plats</CardTitle>
                    <CardDescription className="text-sm font-medium text-slate-500">Analyse précise des plats commandés, servis et refusés.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="hidden md:block">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50/80 border-b border-slate-100">
                                <tr>
                                    <th className="h-12 px-6 text-left align-middle font-semibold text-slate-500">Plat</th>
                                    <th className="h-12 px-6 text-center align-middle font-semibold text-slate-500">Commandés</th>
                                    <th className="h-12 px-6 text-center align-middle font-semibold text-emerald-600">Servis (Payés)</th>
                                    <th className="h-12 px-6 text-center align-middle font-semibold text-red-500">Refusés</th>
                                    <th className="h-12 px-6 text-right align-middle font-semibold text-slate-500">Revenu Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.dishPerformance.map((p: any, i: number) => (
                                    <tr key={i} className="border-b border-slate-50 transition-colors hover:bg-slate-50/50">
                                        <td className="p-4 px-6 align-middle font-semibold text-slate-800">{p.name}</td>
                                        <td className="p-4 px-6 align-middle text-center text-slate-600 font-medium">{p.ordered}</td>
                                        <td className="p-4 px-6 align-middle text-center font-bold text-emerald-600">{p.served}</td>
                                        <td className="p-4 px-6 align-middle text-center font-bold text-red-500">{p.refused}</td>
                                        <td className="p-4 px-6 align-middle text-right font-bold text-slate-900">{p.revenue.toLocaleString()} <span className="text-xs font-medium text-slate-400">{stats.currency}</span></td>
                                    </tr>
                                ))}
                                {stats.dishPerformance.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-sm text-slate-400 font-medium">
                                            Aucune donnée de performance disponible.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="space-y-4 md:hidden p-4">
                        {stats.dishPerformance.map((p: any, i: number) => (
                            <div key={i} className="rounded-2xl border border-slate-100 bg-white shadow-sm p-4">
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <p className="font-semibold text-slate-800 leading-tight">{p.name}</p>
                                    <span className="text-sm font-bold text-slate-900">
                                        {p.revenue.toLocaleString()} <span className="text-[10px] font-medium text-slate-400">{stats.currency}</span>
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl text-center text-xs">
                                    <div>
                                        <p className="text-slate-500 font-medium mb-1">Cmd</p>
                                        <p className="font-bold text-slate-700">{p.ordered}</p>
                                    </div>
                                    <div className="border-l border-r border-slate-200">
                                        <p className="text-emerald-600 font-medium mb-1">Servis</p>
                                        <p className="font-bold text-emerald-600">{p.served}</p>
                                    </div>
                                    <div>
                                        <p className="text-red-500 font-medium mb-1">Refusés</p>
                                        <p className="font-bold text-red-500">{p.refused}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {stats.dishPerformance.length === 0 && (
                            <div className="py-8 text-center text-sm text-slate-400 font-medium">
                                Aucune donnée de performance disponible.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

        </div>
    )
}
