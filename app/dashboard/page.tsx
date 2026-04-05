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
import { DollarSign, ShoppingBag, Activity, TrendingUp, Trophy, ArrowUpRight, Zap, Target, Star, UtensilsCrossed, Sparkles, ChefHat } from 'lucide-react'
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
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000 p-2">
            {/* LUXURY HEADER GREETING */}
            <div className="relative group perspective-1000">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-indigo-600 rounded-[4rem] blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
                <header className="relative p-10 md:p-16 rounded-[3.5rem] bg-white/80 backdrop-blur-3xl border border-white/20 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] overflow-hidden transition-all duration-700">
                    {/* Background Decorative Element */}
                    <div className="absolute -top-20 -right-20 p-24 rotate-12 opacity-[0.04] text-slate-900 group-hover:scale-110 transition-transform duration-1000">
                        <ChefHat className="h-96 w-96" />
                    </div>
                    <div className="absolute -bottom-10 -left-10 h-64 w-64 bg-orange-500/10 blur-[100px] rounded-full"></div>
                    
                    <div className="relative z-10 space-y-6">
                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-orange-500/5 border border-orange-500/10 backdrop-blur-sm animate-bounce-slow">
                            <Sparkles className="h-4 w-4 text-orange-500" />
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-600">Excellence Digitalisée</p>
                        </div>
                        <div className="space-y-2">
                             <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 italic leading-[0.9]">
                                Salut, <br className="md:hidden" />
                                <span className="relative inline-block">
                                    <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500">{restaurant?.name || 'Chef'}</span>
                                    <span className="absolute bottom-4 left-0 w-full h-4 bg-orange-400/20 -rotate-1 rounded-full -z-10"></span>
                                </span> ! 🍽️
                             </h1>
                        </div>
                        <p className="text-slate-500 font-bold text-lg tracking-tight italic max-w-xl leading-relaxed">
                            Votre orchestre culinaire est prêt. Voici la partition de votre succès aujourd'hui.
                        </p>
                    </div>
                </header>
            </div>

            {onboardingStatus && (
                <div className="grid gap-6 animate-in slide-in-from-left-5 duration-700">
                    <OnboardingNotifications status={onboardingStatus} />
                    <DashboardAlerts status={onboardingStatus} />
                </div>
            )}

            {/* PREMIUM STATS GRID */}
            <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                {/* Revenue Card - Night Mode Luxury */}
                <div className="group relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-br from-orange-600 to-indigo-600 rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                    <Card className="relative rounded-[3rem] border-none bg-slate-900 text-white shadow-2xl h-full flex flex-col justify-between overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:scale-125 transition-transform duration-700">
                             <DollarSign className="h-32 w-32" />
                        </div>
                        <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between">
                            <div className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.3em] text-white/40 italic">Chiffre d'Affaire</div>
                            <div className="h-12 w-12 rounded-2xl bg-orange-600 shadow-[0_0_20px_rgba(234,88,12,0.3)] flex items-center justify-center animate-pulse">
                                <TrendingUp className="h-6 w-6 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 pt-6">
                            <div className="text-5xl font-black tabular-nums tracking-tighter italic flex items-baseline gap-2">
                                {stats.revenue.toLocaleString()} <span className="text-xs text-white/20 not-italic uppercase font-bold">{stats.currency}</span>
                            </div>
                            <div className="mt-8 flex items-center gap-3">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest italic">Performance Record</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Orders Card - Clean Glass */}
                <Card className="rounded-[3rem] border border-slate-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-500 group flex flex-col justify-between">
                    <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between">
                         <div className="px-3 py-1 rounded-xl bg-slate-50 border border-slate-100 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Commandes</div>
                         <div className="h-12 w-12 rounded-2xl bg-slate-900 group-hover:bg-orange-600 transition-colors duration-500 flex items-center justify-center shadow-lg shadow-slate-900/10">
                            <ShoppingBag className="h-6 w-6 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 pt-6 text-slate-900">
                        <div className="text-5xl font-black tabular-nums tracking-tighter italic">
                             {stats.count} <span className="text-[10px] text-slate-300 not-italic font-bold tracking-widest uppercase">Flux Live</span>
                        </div>
                        <div className="mt-8 flex items-center gap-3">
                             <div className="h-px flex-1 bg-slate-100" />
                             <span className="text-[9px] font-bold text-slate-400 italic uppercase">Service stable</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Kitchen Activity Card - Alert Style */}
                <Card className="rounded-[3rem] border border-slate-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-500 group flex flex-col justify-between">
                     <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between">
                         <div className="px-3 py-1 rounded-xl bg-slate-50 border border-slate-100 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 italic">En Cuisine</div>
                         <div className={cn(
                            "h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500",
                            stats.preparing > 0 ? "bg-red-600 text-white animate-bounce-slow" : "bg-slate-100 text-slate-400"
                         )}>
                            <Activity className="h-6 w-6" />
                        </div>
                     </CardHeader>
                     <CardContent className="p-8 pt-6 text-slate-900 font-black">
                        <div className="text-5xl italic tracking-tighter">
                             {stats.preparing} <span className="text-[10px] text-slate-300 not-italic font-bold tracking-widest uppercase ml-1">À Cuire</span>
                        </div>
                        <div className="mt-8 h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                             <div className={cn("h-full transition-all duration-1000", stats.preparing > 5 ? "bg-red-600 w-full" : "bg-emerald-500 w-1/3")} />
                        </div>
                     </CardContent>
                </Card>

                {/* Satisfaction Card - Luxury Gold */}
                <Card className="rounded-[3rem] border border-slate-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-500 group flex flex-col justify-between overflow-hidden">
                    <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between">
                         <div className="px-3 py-1 rounded-xl bg-orange-500/5 border border-orange-500/10 text-[9px] font-black uppercase tracking-[0.3em] text-orange-500 italic">Satisfaction</div>
                         <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                            <Star className="h-6 w-6 text-orange-500 fill-orange-500" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 pt-6">
                        <div className="text-5xl font-black tabular-nums tracking-tighter italic text-slate-900">
                             {stats.avgRating || '5.0'} <span className="text-xs text-orange-500/30 not-italic">/ 5</span>
                        </div>
                        <div className="mt-8 flex gap-1.5 opacity-40">
                             {[1,2,3,4,5].map(i => <Star key={i} className="h-3 w-3 fill-orange-500 text-orange-500" />)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* HIGH-END BEST SELLERS - NETFLIX STYLE */}
            <div className="space-y-10 py-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between px-4 gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                             <Trophy className="h-8 w-8 text-orange-500" />
                             <h2 className="text-4xl font-black tracking-tighter italic uppercase text-slate-900">Vos Plats <span className="text-orange-600 underline underline-offset-8 decoration-4 decoration-orange-100">Légendaires</span></h2>
                        </div>
                        <p className="text-slate-400 font-bold text-sm italic">Les créations culinaires les plus plébiscitées par vos clients.</p>
                    </div>
                </div>
                
                <div className="grid gap-10 sm:grid-cols-1 md:grid-cols-3">
                    {stats.topDishes?.length > 0 ? (
                        stats.topDishes.slice(0, 3).map((dish: any, idx: number) => (
                            <div key={idx} className="group relative h-[480px] rounded-[3.5rem] overflow-hidden shadow-2xl transition-all duration-700 hover:translate-y-[-10px] cursor-pointer">
                                <img src={dish.image || '/placeholder-dish.jpg'} alt={dish.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                                
                                <div className="absolute top-8 left-8">
                                    <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white h-12 w-12 rounded-2xl flex items-center justify-center font-black italic shadow-2xl">0{idx + 1}</div>
                                </div>

                                <div className="absolute bottom-8 left-8 right-8 space-y-6">
                                    <div className="space-y-2">
                                        <Badge className="bg-orange-600 text-white border-none font-black text-[9px] px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-orange-600/20">Incontournable</Badge>
                                        <h3 className="text-3xl font-black italic tracking-tight text-white leading-tight drop-shadow-lg">{dish.name}</h3>
                                    </div>
                                    <div className="flex items-center justify-between bg-white/10 backdrop-blur-xl rounded-[2rem] p-5 border border-white/10">
                                         <div>
                                             <p className="text-[9px] font-black uppercase text-white/40 tracking-[0.2em] mb-1">Total Ventes</p>
                                             <p className="text-2xl font-black italic text-white">{dish.count} <span className="text-xs text-white/40 not-italic uppercase font-bold">unités</span></p>
                                         </div>
                                         <div className="h-12 w-12 rounded-full border-2 border-white/50 flex items-center justify-center text-white font-black italic text-xs hover:bg-white hover:text-black transition-all">Go</div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-3 h-[400px] bg-slate-50 rounded-[4rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300 italic font-black text-2xl uppercase tracking-tighter">
                             Votre légende s'écrit ici... 🍜
                        </div>
                    )}
                </div>
            </div>

            {/* DATA ANALYTICS & ACTIVITY */}
            <div className="grid gap-10 xl:grid-cols-7 border-t-2 border-slate-50 pt-16">
                <div className="xl:col-span-4 space-y-10">
                    <div className="flex items-center justify-between px-4">
                        <div className="flex items-center gap-4">
                             <div className="h-10 w-10 rounded-2xl bg-slate-100 flex items-center justify-center">
                                <Target className="h-6 w-6 text-slate-900" />
                             </div>
                             <h2 className="text-3xl font-black tracking-tighter italic uppercase text-slate-900">Courbe de Vitalité</h2>
                        </div>
                    </div>
                    <Card className="rounded-[4rem] border-none bg-slate-50/70 p-10 shadow-inner">
                        <CardHeader className="pb-10">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 italic text-center">Rapport Semainier des Encaissements</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[400px]">
                            <SalesChart data={weeklyRevenue} currency={stats?.currency || 'FCFA'} />
                        </CardContent>
                    </Card>
                </div>

                <div className="xl:col-span-3 space-y-10">
                    <div className="flex items-center gap-3 px-4">
                         <div className="h-3 w-3 rounded-full bg-orange-600 animate-ping" />
                         <h2 className="text-3xl font-black tracking-tighter italic uppercase text-slate-900">Flux de Vie</h2>
                    </div>
                    <div className="bg-white border-2 border-slate-50 rounded-[4rem] p-6 shadow-xl shadow-slate-100/50">
                        <RecentActivity
                            initialOrders={recentOrders}
                            currency={stats?.currency || 'FCFA'}
                            restaurantId={restaurant?.id}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
