import { getAdminClient } from '@/lib/supabase/admin'
import { 
    Users, 
    Store, 
    CreditCard, 
    TrendingUp, 
    Activity, 
    ShieldAlert, 
    Search, 
    MoreHorizontal,
    ChevronRight,
    ArrowUpRight,
    Mail
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default async function AdminDashboard() {
    const adminClient = getAdminClient()

    // Fetch Stats using admin client to bypass RLS
    const { count: userCount } = await adminClient.from('profiles').select('*', { count: 'exact', head: true })
    const { count: restaurantCount } = await adminClient.from('restaurants').select('*', { count: 'exact', head: true })
    const { data: recentPayments } = await adminClient.from('payments').select('*').order('created_at', { ascending: false }).limit(5)
    const { data: totalRevenueArr } = await adminClient.from('payments').select('amount').eq('status', 'COMPLETED')
    
    const totalRevenue = totalRevenueArr?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0
    
    // Fetch subscriptions expiring soon (next 7 days)
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
    
    const { count: expiringCount } = await adminClient
        .from('restaurants')
        .select('*', { count: 'exact', head: true })
        .lte('subscription_expires_at', sevenDaysFromNow.toISOString())
        .gt('subscription_expires_at', new Date().toISOString())

    // Recent Users
    const { data: recentUsers } = await adminClient.from('profiles').select('*').order('created_at', { ascending: false }).limit(5)

    const stats = [
        {
            title: "Utilisateurs Totaux",
            value: userCount || 0,
            description: "utilisateurs enregistrés",
            icon: Users,
            color: "text-red-500",
            bg: "bg-red-500/10"
        },
        {
            title: "Restaurants / Boutiques",
            value: restaurantCount || 0,
            description: "entités créées",
            icon: Store,
            color: "text-white",
            bg: "bg-white/10"
        },
        {
            title: "Chiffre d'Affaire Global",
            value: `${(totalRevenue / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}`,
            description: "revenus générés",
            icon: TrendingUp,
            color: "text-red-600",
            bg: "bg-red-600/10"
        },
        {
            title: "Paiements récents",
            value: recentPayments?.length || 0,
            description: "sur les dernières 24h",
            icon: CreditCard,
            color: "text-white",
            bg: "bg-white/10"
        }
    ]

    return (
        <div className="space-y-12 pb-12 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-white italic">Administration <span className="text-red-500">.</span></h1>
                    <p className="text-white/40 mt-2 max-w-2xl font-medium text-sm">Bienvenue dans l'espace de gestion de votre plateforme SaaS.</p>
                </div>
                <div className="flex items-center gap-2 bg-white/5 p-2 px-4 rounded-2xl border border-white/10">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
                    <span className="text-[10px] font-medium tracking-wider text-white/60">Système Live</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <Card key={i} className="bg-white/5 border-white/10 shadow-2xl hover:bg-white/[0.07] transition-all duration-300 rounded-[2rem] group">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-[10px] font-medium text-white/30 uppercase tracking-widest">{stat.title}</CardTitle>
                            <div className={cn("p-2.5 rounded-xl transition-transform group-hover:scale-110 duration-500", stat.bg)}>
                                <stat.icon className={cn("h-4 w-4", stat.color)} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-semibold text-white tracking-tight">{stat.value}</div>
                            <p className="text-[10px] font-medium text-white/20 tracking-wider mt-2 flex items-center gap-2">
                                <Activity className="h-3 w-3" />
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Users */}
                <Card className="lg:col-span-2 bg-white/5 border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 bg-white/[0.02] px-8 py-6">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-bold flex items-center gap-3">
                                <Users className="h-5 w-5 text-red-600" />
                                Nouveaux inscrits
                            </CardTitle>
                            <CardDescription className="text-xs font-medium text-white/20">Les 5 derniers comptes créés</CardDescription>
                        </div>
                        <Link href="/admin/users">
                            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 font-medium text-xs tracking-wide px-4 rounded-xl border border-white/10 h-10">Voir tout <ChevronRight className="h-4 w-4 ml-2" /></Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-white/5">
                            {recentUsers?.map((user) => (
                                <div key={user.id} className="flex items-center justify-between p-6 hover:bg-white/[0.03] transition-colors group">
                                    <div className="flex items-center gap-5">
                                        <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-white/40 uppercase group-hover:border-red-600/50 transition-colors">
                                            {user.full_name?.charAt(0) || user.username?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white leading-none tracking-tight">{user.full_name || user.username || 'Utilisateur Anonyme'}</p>
                                            <p className="text-[10px] font-medium text-white/40 flex items-center gap-2 mt-2 tracking-wide"><Mail className="h-3.3 w-3.5 text-red-600/50" /> {user.email || 'Email non fourni'}</p>
                                        </div>
                                    </div>
                                    <Link href={`/admin/users?q=${user.email || user.username}`}>
                                        <Button variant="outline" size="sm" className="h-10 px-4 text-xs font-medium tracking-wide border-white/10 bg-transparent hover:bg-red-600 hover:text-white hover:border-red-600 transition-all rounded-xl">Gérer</Button>
                                    </Link>
                                </div>
                            ))}
                            {(!recentUsers || recentUsers.length === 0) && (
                                <div className="p-12 text-center text-white/20 font-medium tracking-wide italic text-xs">Aucun utilisateur trouvé</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Financial Overview & Quick Links */}
                <div className="space-y-6">
                    <Card className="bg-white/5 border-white/10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-xl font-bold italic text-white flex items-center gap-3">
                                <CreditCard className="h-5 w-5 text-red-600" />
                                Flux Financiers
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-4">
                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/5 transition-all cursor-pointer group/link">
                                <Link href="/admin/payments" className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-white tracking-tight">SaaS & Abonnements</p>
                                        <p className="text-[10px] font-medium text-white/20">Progression des revenus directs</p>
                                    </div>
                                    <ArrowUpRight className="h-4 w-4 text-white/20 group-hover/link:text-red-500 transition-colors" />
                                </Link>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/5 transition-all cursor-pointer group/link">
                                <Link href="/admin/restaurants" className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-white tracking-tight">Paiements Commandes</p>
                                        <p className="text-[10px] font-medium text-white/20">Flux restaurants (QR Code)</p>
                                    </div>
                                    <ArrowUpRight className="h-4 w-4 text-white/20 group-hover/link:text-red-500 transition-colors" />
                                </Link>
                            </div>
                            <Link href="/admin/settings?tab=plateforme">
                                <Button className="w-full mt-4 bg-white text-black hover:bg-red-600 hover:text-white font-bold text-[10px] tracking-widest h-12 rounded-2xl shadow-xl transition-all uppercase">Configuration Gateway</Button>
                            </Link>
                        </CardContent>
                        {/* Decorative element */}
                        <div className="absolute -bottom-10 -right-10 h-32 w-32 bg-red-600/10 rounded-full blur-3xl group-hover:bg-red-600/20 transition-all duration-700" />
                    </Card>

                    <Card className="bg-red-600 border-none rounded-[2.5rem] text-white overflow-hidden relative group shadow-2xl shadow-red-600/20">
                        <div className="absolute top-0 right-0 p-8 opacity-20 transition-transform group-hover:scale-110 duration-700">
                            <ShieldAlert className="h-40 w-40" />
                        </div>
                        <CardHeader className="pb-2 relative z-10 p-8">
                            <CardTitle className="text-2xl font-bold italic tracking-tight">Modération <br/> Prioritaire</CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10 p-8 pt-0">
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3 group/item cursor-pointer">
                                    <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                                    <span className="text-xs font-medium text-white">{expiringCount || 0} Abonnements à expirer (7j)</span>
                                    <Link href="/admin/restaurants" className="ml-auto opacity-40 group-hover/item:translate-x-1 group-hover/item:-translate-y-1 transition-transform">
                                        <ArrowUpRight className="h-3 w-3" />
                                    </Link>
                                </li>
                                <li className="flex items-center gap-3 group/item cursor-pointer">
                                    <div className="h-1.5 w-1.5 rounded-full bg-white opacity-40" />
                                    <span className="text-xs font-medium text-white">3 Restaurants à vérifier</span>
                                    <ArrowUpRight className="h-3 w-3 ml-auto opacity-40 group-hover/item:translate-x-1 group-hover/item:-translate-y-1 transition-transform" />
                                </li>
                                <li className="flex items-center gap-3 group/item cursor-pointer opacity-50">
                                    <div className="h-1.5 w-1.5 rounded-full bg-white/30" />
                                    <span className="text-xs font-medium text-white">0 Signalements</span>
                                </li>
                            </ul>
                            <Link href="/admin/moderation">
                                <Button className="w-full mt-8 bg-white text-black hover:bg-white/90 font-bold text-xs tracking-wide h-12 rounded-2xl shadow-xl shadow-black/10">Accéder aux contrôles</Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
