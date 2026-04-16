import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getDashboardStats, getRecentOrders, getWeeklyRevenue, getOnboardingStatus } from '@/components/modules/admin/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SalesChart } from '@/components/modules/analytics/components/sales-chart'
import { RecentActivity } from '@/components/modules/admin/recent-activity'
import { OnboardingChecklist } from '@/components/modules/admin/onboarding-checklist'
import { DashboardAlerts } from '@/components/modules/admin/dashboard-alerts'
import { OnboardingNotifications } from '@/components/modules/admin/onboarding-notifications'
import { DollarSign, ShoppingBag, Activity, TrendingUp, Trophy, ArrowRight, Zap, Target, Star, UtensilsCrossed, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const rawStats = await getDashboardStats()
    const stats = (rawStats as any) || { revenue: 0, count: 0, preparing: 0, currency: 'XOF', topDishes: [], avgRating: 5.0 }
    const recentOrders = await getRecentOrders()
    const weeklyRevenue = await getWeeklyRevenue()
    const onboardingStatus = await getOnboardingStatus()

    const { data: restaurant } = await supabase.from('restaurants').select('id, name').eq('owner_id', user.id).single()

    return (
        <div className="space-y-6 sm:space-y-10 animate-in fade-in duration-700 p-2 md:p-6 max-w-7xl mx-auto">
            {/* HERO HEADER */}
            <header className="relative flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-100">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <p className="text-[10px] sm:text-xs font-medium text-slate-600 uppercase tracking-wider">Service en cours</p>
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
                        Bonjour, {restaurant?.name || 'Chef'} 👋
                    </h1>
                    <p className="text-slate-500 text-base sm:text-lg">
                        Voici un aperçu de vos performances aujourd'hui.
                    </p>
                </div>
            </header>

            {onboardingStatus && (
                <div className="grid gap-6">
                    <OnboardingNotifications status={onboardingStatus} />
                    <DashboardAlerts status={onboardingStatus} />
                </div>
            )}

            {/* STATS GRID */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {/* Revenue Card */}
                <Card className="rounded-[2rem] border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-[10px] sm:text-sm font-bold uppercase tracking-widest text-slate-500">Chiffre d'affaires</CardTitle>
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0">
                        <div className="text-xl sm:text-3xl font-black tabular-nums text-slate-900">
                            {stats.revenue.toLocaleString()} <span className="text-[10px] sm:text-sm font-medium text-slate-400">{stats.currency}</span>
                        </div>
                        <div className="mt-2 sm:mt-4 text-[10px] font-bold text-emerald-600 flex items-center gap-1.5 uppercase tracking-wide">
                            <TrendingUp className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
                            <span>À jour</span>
                        </div>
                    </CardContent>
                </Card>
...

                {/* Orders Card */}
                <Card className="rounded-[2rem] border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4 flex flex-row items-center justify-between space-y-0">
                         <CardTitle className="text-[10px] sm:text-sm font-bold uppercase tracking-widest text-slate-500">Commandes</CardTitle>
                         <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-700">
                            <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0 text-slate-900">
                        <div className="text-xl sm:text-3xl font-black tabular-nums">
                             {stats.count}
                        </div>
                        <div className="mt-2 sm:mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                             Aujourd'hui
                        </div>
                    </CardContent>
                </Card>
 
                {/* Kitchen Activity Card */}
                <Card className="rounded-[2rem] border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                     <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4 flex flex-row items-center justify-between space-y-0">
                         <CardTitle className="text-[10px] sm:text-sm font-bold uppercase tracking-widest text-slate-500">En cuisine</CardTitle>
                         <div className={cn(
                            "h-8 w-8 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center transition-colors",
                            stats.preparing > 0 ? "bg-orange-100 text-orange-600" : "bg-slate-50 text-slate-400"
                         )}>
                            <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                     </CardHeader>
                     <CardContent className="p-4 sm:p-6 pt-0">
                        <div className="text-xl sm:text-3xl font-black tabular-nums text-slate-900">
                             {stats.preparing}
                        </div>
                        <div className="mt-2 sm:mt-4 flex items-center gap-2">
                             <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                                  <div className={cn("h-full rounded-full transition-all duration-500", stats.preparing > 5 ? "bg-orange-500 w-full" : "bg-emerald-500 w-1/3")} />
                             </div>
                             <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">{stats.preparing > 0 ? 'Actif' : 'Prêt'}</span>
                        </div>
                     </CardContent>
                </Card>
 
                {/* Satisfaction Card */}
                <Card className="rounded-[2rem] border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4 flex flex-row items-center justify-between space-y-0">
                         <CardTitle className="text-[10px] sm:text-sm font-bold uppercase tracking-widest text-slate-500">Satisfaction</CardTitle>
                         <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600">
                            <Star className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0">
                        <div className="text-xl sm:text-3xl font-black tabular-nums text-slate-900">
                             {stats.avgRating || '5.0'} <span className="text-[10px] sm:text-sm font-medium text-slate-400">/ 5</span>
                        </div>
                        <div className="mt-2 sm:mt-4 flex gap-0.5">
                             {[1,2,3,4,5].map(i => <Star key={i} className="h-2.5 sm:h-3.5 w-2.5 sm:w-3.5 fill-yellow-400 text-yellow-400" />)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* BEST SELLERS SECTION */}
            <div className="space-y-6 pt-6">
                <div className="flex items-center justify-between px-2">
                    <div className="space-y-1">
                         <h2 className="text-2xl font-bold tracking-tight text-slate-900">Meilleures ventes</h2>
                         <p className="text-slate-500 text-sm">Les plats les plus commandés récemment.</p>
                    </div>
                </div>
                
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                    {stats.topDishes?.length > 0 ? (
                        stats.topDishes.slice(0, 3).map((dish: any, idx: number) => (
                            <div key={idx} className="group flex flex-col bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
                                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                                    <img src={dish.image || '/placeholder-dish.jpg'} alt={dish.name} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl font-bold text-sm text-slate-900 shadow-sm border border-white/20">
                                        #{idx + 1}
                                    </div>
                                </div>
                                <div className="p-5 flex flex-col gap-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{dish.name}</h3>
                                    </div>
                                    <div className="flex items-center justify-between mt-auto">
                                         <div className="flex flex-col">
                                             <span className="text-xs text-slate-500 font-medium">Ventes</span>
                                             <span className="text-lg font-bold text-slate-900 tabular-nums">{dish.count}</span>
                                         </div>
                                         <div className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer">
                                            <ArrowRight className="h-4 w-4" />
                                         </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-3 h-48 bg-slate-50 rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                            <UtensilsCrossed className="h-8 w-8 mb-3 opacity-20" />
                            <p className="font-medium">Aucune donnée disponible</p>
                        </div>
                    )}
                </div>
            </div>

            {/* CHARTS & RECENT ACTIVITY */}
            <div className="grid gap-8 lg:grid-cols-7 pt-6">
                {/* Chart */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="px-2">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Revenus hebdomadaires</h2>
                        <p className="text-slate-500 text-sm mt-1">Évolution de votre chiffre d'affaires sur 7 jours.</p>
                    </div>
                    <Card className="rounded-3xl border-slate-100 shadow-sm">
                        <CardContent className="p-6 h-[400px]">
                            <SalesChart data={weeklyRevenue} currency={stats?.currency || 'FCFA'} />
                        </CardContent>
                    </Card>
                </div>

                {/* Activity */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="px-2 flex items-center justify-between">
                         <div>
                             <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                                 Activité récente
                                 <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                                 </span>
                             </h2>
                             <p className="text-slate-500 text-sm mt-1">Dernières commandes en direct.</p>
                         </div>
                    </div>
                    <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden bg-slate-50/50">
                        <div className="p-2">
                            <RecentActivity
                                initialOrders={recentOrders}
                                currency={stats?.currency || 'FCFA'}
                                restaurantId={restaurant?.id}
                            />
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}

