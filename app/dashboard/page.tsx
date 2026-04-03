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
import { DollarSign, ShoppingBag, Activity, TrendingUp, Trophy, ArrowUpRight, Zap, Target, Star } from 'lucide-react'
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
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header with Glass effect */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-black/5">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="h-6 w-1 bg-orange-600 rounded-full" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/20 italic">Dashboard Central</p>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter italic">Salut, {restaurant?.name || 'Chef'} ! 🍽️</h1>
                    <p className="text-muted-foreground font-medium mt-1">Voici la performance de votre restaurant aujourd'hui.</p>
                </div>
                <div className="bg-orange-600/10 border border-orange-600/20 rounded-3xl px-6 py-3 flex items-center gap-4">
                    <Zap className="h-5 w-5 text-orange-600 animate-pulse" />
                    <div>
                        <p className="text-[9px] font-black uppercase text-orange-600/40">Mode Live</p>
                        <p className="text-sm font-bold italic">Système Synchronisé</p>
                    </div>
                </div>
            </div>

            {onboardingStatus && (
                <div className="space-y-4">
                    <OnboardingNotifications status={onboardingStatus} />
                    <DashboardAlerts status={onboardingStatus} />
                    <OnboardingChecklist status={onboardingStatus} />
                </div>
            )}

            {/* Main Stats Grid */}
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                <Card className="rounded-[2.5rem] border-none bg-black text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute -right-10 -bottom-10 h-40 w-40 bg-orange-600/20 blur-[60px] rounded-full group-hover:bg-orange-600/30 transition-all duration-700" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 italic">Chiffre d'Affaire</CardTitle>
                        <div className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
                            <TrendingUp className="h-5 w-5 text-orange-500" />
                        </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <div className="text-3xl font-black tabular-nums tracking-tighter italic">
                            {stats.revenue.toLocaleString()} <span className="text-xs opacity-20 not-italic uppercase">{stats.currency}</span>
                        </div>
                        <p className="text-[10px] font-bold text-orange-500/60 mt-3 flex items-center gap-2 uppercase tracking-widest">
                            <ArrowUpRight className="h-3 w-3" /> Aujourd'hui
                        </p>
                    </CardContent>
                </Card>

                <Card className="rounded-[2.5rem] border-black/5 bg-white shadow-sm overflow-hidden relative group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-black/20 italic">Flux Commandes</CardTitle>
                        <div className="h-10 w-10 rounded-2xl bg-black/5 flex items-center justify-center border border-black/5">
                            <ShoppingBag className="h-5 w-5 text-black" />
                        </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <div className="text-3xl font-black tabular-nums tracking-tighter italic text-black">
                            {stats.count} <span className="text-xs opacity-20 not-italic uppercase lowercase font-bold">reçues</span>
                        </div>
                        <p className="text-[10px] font-bold text-black/40 mt-3 flex items-center gap-2 uppercase tracking-widest leading-none">
                             Performance stable
                        </p>
                    </CardContent>
                </Card>

                <Card className="rounded-[2.5rem] border-black/5 bg-white shadow-sm overflow-hidden relative group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-black/20 italic">Actuel Cuisine</CardTitle>
                        <div className={cn(
                            "h-10 w-10 rounded-2xl flex items-center justify-center border transition-all",
                            stats.preparing > 0 ? "bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/20" : "bg-black/5 text-black/20 border-black/5"
                        )}>
                            <Activity className="h-5 w-5" />
                        </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <div className="text-3xl font-black tabular-nums tracking-tighter italic text-black">
                            {stats.preparing} <span className="text-xs opacity-20 not-italic uppercase lowercase font-bold">à traiter</span>
                        </div>
                        <p className={cn(
                            "text-[10px] font-bold mt-3 uppercase tracking-widest",
                            stats.preparing > 5 ? "text-red-500 animate-pulse" : "text-black/40"
                        )}>
                             {stats.preparing > 5 ? "Charge élevée" : "Service fluide"}
                        </p>
                    </CardContent>
                </Card>

                <Card className="rounded-[2.5rem] border-black/5 bg-white shadow-sm overflow-hidden relative group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-black/20 italic">Satisfaction</CardTitle>
                        <div className="h-10 w-10 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                            <Star className="h-5 w-5 text-orange-500 fill-orange-500" />
                        </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <div className="text-3xl font-black tabular-nums tracking-tighter italic text-black">
                            {stats.avgRating || '5.0'} <span className="text-xs opacity-20 not-italic uppercase lowercase font-bold">/ 5 pts</span>
                        </div>
                        <p className="text-[10px] font-bold text-orange-500 mt-3 flex items-center gap-2 uppercase tracking-widest leading-none">
                             Avis clients live
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Best Sellers Section */}
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 italic">
                        <Trophy className="h-6 w-6 text-orange-500" />
                        <h2 className="text-2xl font-black tracking-tighter uppercase italic">Best-Sellers</h2>
                    </div>
                </div>
                
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3">
                    {stats.topDishes?.length > 0 ? (
                        stats.topDishes.map((dish: any, idx: number) => (
                            <div key={idx} className="group relative bg-white border border-black/5 rounded-[2.5rem] p-5 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden">
                                <div className="absolute top-4 left-4 z-20">
                                    <div className="bg-black text-white h-8 w-8 rounded-xl flex items-center justify-center font-black italic shadow-lg">#{idx + 1}</div>
                                </div>
                                <div className="aspect-[4/3] rounded-[2rem] overflow-hidden mb-6 relative">
                                    <img src={dish.image || '/placeholder-dish.jpg'} alt={dish.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                        <div className="flex items-center gap-1.5 text-white/80">
                                            <Star className="h-3 w-3 text-orange-500 fill-orange-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Incontournable</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-2">
                                    <h3 className="text-xl font-black italic tracking-tight mb-2 truncate">{dish.name}</h3>
                                    <div className="flex justify-between items-center bg-black/5 rounded-2xl p-3 border border-black/5">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-black/40">Total Ventes</span>
                                        <span className="text-lg font-black italic">{dish.count} <small className="text-[10px] opacity-40 uppercase not-italic">unités</small></span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-3 py-10 bg-black/5 rounded-[2.5rem] border border-dashed border-black/10 flex flex-col items-center justify-center text-black/20 italic">
                             Pas encore de best-sellers. Lancez vos premières commandes !
                        </div>
                    )}
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid gap-10 xl:grid-cols-7 border-t border-black/5 pt-10">
                <div className="xl:col-span-4 space-y-6">
                    <div className="flex items-center gap-3">
                        <Target className="h-6 w-6 text-black/20" />
                        <h2 className="text-2xl font-black tracking-tighter uppercase italic">Croissance</h2>
                    </div>
                    <Card className="rounded-[3rem] border-none bg-black/5 shadow-inner">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-black/20 italic text-center">Historique des 7 derniers jours</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2 pt-6">
                            <SalesChart data={weeklyRevenue} currency={stats?.currency || 'FCFA'} />
                        </CardContent>
                    </Card>
                </div>

                <div className="xl:col-span-3 space-y-6">
                    <div className="flex items-center gap-3">
                         <div className="h-2 w-2 rounded-full bg-orange-600 animate-ping" />
                         <h2 className="text-2xl font-black tracking-tighter uppercase italic">Live Flux</h2>
                    </div>
                    <RecentActivity
                        initialOrders={recentOrders}
                        currency={stats?.currency || 'FCFA'}
                        restaurantId={restaurant?.id}
                    />
                </div>
            </div>
        </div>
    )
}
