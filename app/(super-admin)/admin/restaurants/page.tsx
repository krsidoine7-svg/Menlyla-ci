import { getAdminClient } from '@/lib/supabase/admin'
import { verifyAdmin } from '@/app/(super-admin)/admin/actions'
import { canView } from '@/lib/admin-permissions'
import { redirect } from 'next/navigation'
import { 
    Store, 
    Search, 
    Filter, 
    Eye,
    Globe,
    Phone,
    Calendar,
    BadgeCheck,
    CreditCard,
    ArrowUpRight,
    SearchX,
    User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default async function AdminRestaurantsPage() {
    const caller = await verifyAdmin()
    const adminClient = getAdminClient()

    // Fetch caller permissions
    const { data: adminRecord } = await adminClient
        .from('app_admins')
        .select('is_super_admin, permissions')
        .eq('id', caller.id)
        .maybeSingle()

    if (!adminRecord || !canView(adminRecord as any, 'restaurants')) {
        redirect('/admin')
    }

    // Fetch all restaurants with owner info
    const { data: restaurants, error } = await adminClient
        .from('restaurants')
        .select(`
            *,
            profiles!owner_id (
                full_name,
                email
            )
        `)
        .order('created_at', { ascending: false })

    const stats = {
        total: restaurants?.length || 0,
        pro: restaurants?.filter(r => r.plan === 'pro').length || 0,
        solo: restaurants?.filter(r => r.plan === 'solo' || !r.plan).length || 0,
        active: restaurants?.filter(r => r.subscription_status === 'active').length || 0
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header / Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-2 bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden group shadow-2xl">
                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                                <Store className="h-6 w-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight italic uppercase">
                                Annuaire <span className="text-orange-400 underline decoration-4 underline-offset-4">Restaurants</span>
                            </h1>
                        </div>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest max-w-xs leading-relaxed">
                            Gestion centralisée des établissements, abonnements et modération Menlyla.
                        </p>
                    </div>
                    <div className="absolute top-0 right-0 h-40 w-40 bg-orange-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-orange-500/20 transition-all duration-700" />
                </div>

                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <BadgeCheck className="h-8 w-8 text-emerald-500 bg-emerald-50 p-1.5 rounded-xl border border-emerald-100" />
                        <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">Abonnements PRO</span>
                    </div>
                    <div>
                        <div className="text-4xl font-black italic text-slate-900 leading-none mb-1">{stats.pro}</div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Partenaires Premium</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <CreditCard className="h-8 w-8 text-indigo-500 bg-indigo-50 p-1.5 rounded-xl border border-indigo-100" />
                        <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg">Total Restaurants</span>
                    </div>
                    <div>
                        <div className="text-4xl font-black italic text-slate-900 leading-none mb-1">{stats.total}</div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inscrits sur la plateforme</p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                    <Input 
                        placeholder="Rechercher par nom, slug ou propriétaire..." 
                        className="pl-12 h-14 bg-white border-slate-200 rounded-2xl font-bold transition-all shadow-sm focus:ring-4 focus:ring-orange-100"
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="h-14 px-6 rounded-2xl border-slate-200 bg-white font-bold gap-2 hover:bg-slate-50">
                        <Filter className="h-5 w-5" /> Filtrer par Plan
                    </Button>
                </div>
            </div>

            {/* Restaurant List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(restaurants?.length === 0) ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                        <SearchX className="h-16 w-16 text-slate-200 mb-4" />
                        <p className="text-xl font-bold text-slate-400 uppercase italic tracking-widest">Aucun restaurant trouvé</p>
                    </div>
                ) : (
                    restaurants?.map((restaurant: any) => (
                        <Card key={restaurant.id} className="group overflow-hidden rounded-[2.5rem] border-none shadow-sm hover:shadow-2xl transition-all duration-300 bg-white">
                            <CardContent className="p-0">
                                {/* Top Plate */}
                                <div className="p-6 pb-4 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="h-16 w-16 rounded-[1.25rem] bg-slate-50 border-2 border-slate-100 flex items-center justify-center overflow-hidden shadow-inner group-hover:rotate-3 transition-transform">
                                            <Store className="h-8 w-8 text-slate-200" />
                                        </div>
                                        <Badge className={cn(
                                            "font-black uppercase tracking-widest border-2 py-1.5 px-3 rounded-xl",
                                            restaurant.plan === 'pro' 
                                                ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-200" 
                                                : "bg-white text-slate-500 border-slate-100"
                                        )}>
                                            {restaurant.plan === 'pro' ? 'Abonnement PRO' : 'Plan Solo / Gratuit'}
                                        </Badge>
                                    </div>

                                    <div>
                                        <h3 className="text-2xl font-black italic text-slate-900 group-hover:text-orange-500 transition-colors">{restaurant.name}</h3>
                                        <Link href={`/${restaurant.slug}`} target="_blank" className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 hover:text-indigo-600">
                                            <Globe className="h-3 w-3" /> menlyla.com/{restaurant.slug} <ArrowUpRight className="h-2 w-2" />
                                        </Link>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="h-px bg-slate-50 mx-6" />

                                {/* Info Plate */}
                                <div className="p-6 pt-4 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter flex items-center gap-1">
                                                <User className="h-3 w-3" /> Propriétaire
                                            </p>
                                            <p className="text-xs font-bold text-slate-700 truncate">{restaurant.profiles?.full_name || 'Inconnu'}</p>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter flex items-center gap-1 justify-end">
                                                Statut <div className={cn("h-1.5 w-1.5 rounded-full", restaurant.subscription_status === 'active' ? "bg-emerald-500" : "bg-rose-500")} />
                                            </p>
                                            <p className={cn("text-xs font-black uppercase italic", restaurant.subscription_status === 'active' ? "text-emerald-600" : "text-rose-500")}>
                                                {restaurant.subscription_status === 'active' ? 'Compte Actif' : 'Suspendu / Expiré'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase border-t border-slate-50 pt-4">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-3 w-3" /> Inscrit le {new Date(restaurant.created_at).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Phone className="h-3 w-3" /> {restaurant.phone || 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Footer */}
                                <div className="p-4 bg-slate-50 flex gap-2">
                                    <Button asChild variant="outline" className="flex-1 rounded-2xl border-slate-200 bg-white font-black uppercase text-[10px] h-10 hover:border-orange-500 hover:text-orange-500 transition-all">
                                        <Link href={`/${restaurant.slug}`} target="_blank">Voir en ligne</Link>
                                    </Button>
                                    <Button asChild className="flex-1 rounded-2xl bg-slate-900 border-none font-black uppercase text-[10px] h-10 hover:bg-black shadow-lg">
                                        <Link href={`/admin/moderation?restaurantId=${restaurant.id}`}>Gérer Accès</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
