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

    // Recent Users
    const { data: recentUsers } = await adminClient.from('profiles').select('*').order('created_at', { ascending: false }).limit(5)

    const stats = [
        {
            title: "Utilisateurs Totaux",
            value: userCount || 0,
            description: "utilisateurs enregistrés",
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            title: "Restaurants / Boutiques",
            value: restaurantCount || 0,
            description: "entités créées",
            icon: Store,
            color: "text-purple-600",
            bg: "bg-purple-50"
        },
        {
            title: "Chiffre d'Affaire Global",
            value: `${(totalRevenue / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}`,
            description: "revenus générés",
            icon: TrendingUp,
            color: "text-emerald-600",
            bg: "bg-emerald-50"
        },
        {
            title: "Paiements récents",
            value: recentPayments?.length || 0,
            description: "sur les dernières 24h",
            icon: CreditCard,
            color: "text-orange-600",
            bg: "bg-orange-50"
        }
    ]

    return (
        <div className="space-y-8 pb-12">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">Administration Menlyla</h1>
                <p className="text-slate-500 mt-1 max-w-2xl font-medium">Bienvenue dans l'espace de gestion de votre plateforme SaaS. Pilotez vos utilisateurs, surveillez vos revenus et modérez les comptes.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{stat.title}</CardTitle>
                            <div className={cn("p-2 rounded-lg", stat.bg)}>
                                <stat.icon className={cn("h-4 w-4", stat.color)} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                            <p className="text-xs font-medium text-slate-500 mt-1">
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Users */}
                <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50 px-6 py-4">
                        <div className="space-y-0.5">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Users className="h-4 w-4 text-primary" />
                                Nouveaux inscrits
                            </CardTitle>
                            <CardDescription className="text-xs font-medium uppercase tracking-tighter">Les 5 derniers comptes créés sur la plateforme</CardDescription>
                        </div>
                        <Link href="/admin/users">
                            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/5 font-semibold">Voir tout <ChevronRight className="h-4 w-4 ml-1" /></Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {recentUsers?.map((user) => (
                                <div key={user.id} className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 uppercase">
                                            {user.full_name?.charAt(0) || user.username?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 leading-tight">{user.full_name || user.username || 'Utilisateur Anonyme'}</p>
                                            <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mt-0.5"><Mail className="h-3 w-3" /> {user.email || 'Email non fourni'}</p>
                                        </div>
                                    </div>
                                    <Link href={`/admin/users?q=${user.email || user.username}`}>
                                        <Button variant="outline" size="sm" className="h-8 text-xs font-bold border-slate-200 hover:bg-orange-50 hover:text-orange-600 transition-colors">Gérer</Button>
                                    </Link>
                                </div>
                            ))}
                            {(!recentUsers || recentUsers.length === 0) && (
                                <div className="p-8 text-center text-slate-400 font-medium italic">Aucun utilisateur trouvé</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions / Important Items */}
                <div className="space-y-6">
                    <Card className="border-none shadow-sm bg-slate-950 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <ShieldAlert className="h-24 w-24" />
                        </div>
                        <CardHeader className="pb-2 relative z-10">
                            <CardTitle className="text-lg font-bold text-orange-400">Moderation Rapide</CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3 group cursor-pointer">
                                    <div className="h-2 w-2 rounded-full bg-orange-500 group-hover:scale-125 transition-transform" />
                                    <span className="text-sm font-medium text-slate-300">Vérifier 3 nouveaux restaurants</span>
                                    <ArrowUpRight className="h-3 w-3 ml-auto opacity-40" />
                                </li>
                                <li className="flex items-center gap-3 group cursor-pointer">
                                    <div className="h-2 w-2 rounded-full bg-slate-700 group-hover:scale-125 transition-transform" />
                                    <span className="text-sm font-medium text-slate-400">Traiter 0 signalements en attente</span>
                                    <ArrowUpRight className="h-3 w-3 ml-auto opacity-0" />
                                </li>
                            </ul>
                            <Link href="/admin/moderation">
                                <Button className="w-full mt-6 bg-white text-slate-950 hover:bg-slate-100 font-bold shadow-lg shadow-orange-500/10">Accéder à la modération</Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-gradient-to-br from-indigo-50 to-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-bold text-indigo-900">Support Client</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm font-medium text-slate-600 leading-relaxed mb-4">Accédez à l'interface de support pour aider vos utilisateurs.</p>
                            <Button variant="outline" className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 font-bold border-2">Ouvrir le support</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
