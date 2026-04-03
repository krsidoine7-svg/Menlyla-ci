import { getAdminClient } from '@/lib/supabase/admin'
import { verifyAdmin } from '@/app/(super-admin)/admin/actions'
import { RestaurantModerationActions } from '@/components/modules/super-admin/moderation-actions'
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
        <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
            {/* Header / Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-2 bg-red-600 p-10 rounded-[3rem] text-white relative overflow-hidden group shadow-2xl shadow-red-600/20">
                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:rotate-3 transition-transform duration-500">
                                <Store className="h-7 w-7 text-white" />
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight italic">
                                Restaurants <span className="text-white/60">&</span> Boutiques
                            </h1>
                        </div>
                        <p className="text-white/70 font-medium text-sm max-w-sm leading-relaxed">
                            Gestion centralisée des établissements, abonnements et modération Menlyla.
                        </p>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-8 rounded-[3rem] shadow-2xl flex flex-col justify-between group hover:bg-white/[0.07] transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <BadgeCheck className="h-10 w-10 text-red-600 bg-red-600/10 p-2 rounded-2xl border border-red-600/20 group-hover:scale-105 transition-transform" />
                        <span className="text-[10px] font-bold text-red-600 bg-red-600/10 px-3 py-1.5 rounded-xl tracking-wider">Premium</span>
                    </div>
                    <div>
                        <div className="text-5xl font-bold italic text-white tracking-tight leading-none mb-2">{stats.pro}</div>
                        <p className="text-[10px] font-medium text-white/30 uppercase tracking-wider">Partenaires Actifs</p>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-8 rounded-[3rem] shadow-2xl flex flex-col justify-between group hover:bg-white/[0.07] transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <Globe className="h-10 w-10 text-white bg-white/10 p-2 rounded-2xl border border-white/20 group-hover:scale-105 transition-transform" />
                        <span className="text-[10px] font-bold text-white/40 bg-white/10 px-3 py-1.5 rounded-xl tracking-wider">Plateforme</span>
                    </div>
                    <div>
                        <div className="text-5xl font-bold italic text-white tracking-tight leading-none mb-2">{stats.total}</div>
                        <p className="text-[10px] font-medium text-white/30 uppercase tracking-wider">Inscrits au total</p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-red-600 transition-colors" />
                    <Input 
                        placeholder="Rechercher par nom, slug ou propriétaire..." 
                        className="pl-14 h-16 bg-white/5 border-white/10 rounded-2xl font-medium text-sm text-white transition-all shadow-2xl focus:ring-4 focus:ring-red-600/10 focus:border-red-600 placeholder:text-white/10"
                    />
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="h-16 px-8 rounded-2xl border-white/10 bg-white/5 text-white font-semibold text-xs tracking-wide gap-3 hover:bg-white/10 hover:border-white/20 transition-all">
                        <Filter className="h-5 w-5 text-red-600" /> Filtrer
                    </Button>
                </div>
            </div>

            {/* Restaurant List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                {(restaurants?.length === 0) ? (
                    <div className="col-span-full py-32 flex flex-col items-center justify-center bg-white/5 rounded-[4rem] border-2 border-dashed border-white/10">
                        <SearchX className="h-20 w-20 text-white/5 mb-6" />
                        <p className="text-xl font-bold text-white/20 italic">Aucun restaurant trouvé</p>
                    </div>
                ) : (
                    restaurants?.map((restaurant: any) => (
                        <Card key={restaurant.id} className="group overflow-hidden rounded-[3rem] border-white/10 shadow-3xl hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] transition-all duration-500 bg-black/40 backdrop-blur-xl">
                            <CardContent className="p-0">
                                {/* Top Plate */}
                                <div className="p-8 pb-6 space-y-6">
                                    <div className="flex items-start justify-between">
                                        <div className="h-20 w-20 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl group-hover:rotate-3 transition-all duration-500">
                                            <Store className="h-10 w-10 text-white/10 group-hover:text-red-600 transition-colors" />
                                        </div>
                                        <div className="flex flex-col items-end gap-3">
                                            <Badge className={cn(
                                                "font-bold text-[8px] py-1.5 px-3 rounded-xl border border-transparent",
                                                restaurant.plan === 'pro' 
                                                    ? "bg-red-600 text-white shadow-lg shadow-red-600/20" 
                                                    : "bg-white/5 text-white/40 border-white/10"
                                            )}>
                                                {restaurant.plan === 'pro' ? 'Forfait PRO' : 'Plan Solo'}
                                            </Badge>
                                            {restaurant.settings?.payment_config?.enabled && (
                                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold px-2 py-1 text-[8px] tracking-wide rounded-lg uppercase">
                                                    Paiements ON
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-2xl font-bold italic text-white tracking-tight truncate">{restaurant.name}</h3>
                                        <Link href={`/${restaurant.slug}`} target="_blank" className="text-[10px] font-medium text-white/20 tracking-wider flex items-center gap-2 mt-2 hover:text-red-500 transition-colors uppercase">
                                            <Globe className="h-3 w-3" /> menlyla.com/{restaurant.slug}
                                        </Link>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="h-px bg-white/5 mx-8" />

                                {/* Info Plate */}
                                <div className="p-8 pt-6 space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <p className="text-[9px] font-medium uppercase text-white/20 tracking-wider flex items-center gap-2">
                                                <User className="h-3 w-3" /> Propriétaire
                                            </p>
                                            <p className="text-xs font-semibold text-white truncate tracking-tight">{restaurant.profiles?.full_name || 'Inconnu'}</p>
                                        </div>
                                        <div className="space-y-2 text-right">
                                            <p className="text-[9px] font-medium uppercase text-white/20 tracking-wider flex items-center gap-2 justify-end">
                                                Statut <div className={cn("h-1 w-1 rounded-full animate-pulse", restaurant.subscription_status === 'active' ? "bg-emerald-500" : "bg-red-600")} />
                                            </p>
                                            <p className={cn("text-[10px] font-bold tracking-wider italic", restaurant.subscription_status === 'active' ? "text-emerald-500" : "text-red-600")}>
                                                {restaurant.subscription_status === 'active' ? 'ACTIF' : 'SUSPENDU'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-[9px] font-medium text-white/20 tracking-wider pt-6 border-t border-white/5 uppercase">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-3 w-3" /> {new Date(restaurant.created_at).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-3 w-3" /> {restaurant.phone || 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-white/[0.03] border-t border-white/5 flex items-center gap-3">
                                    <Button asChild variant="outline" className="flex-1 rounded-2xl border-white/10 bg-white/5 font-semibold text-[10px] tracking-wide h-12 text-white hover:bg-white/10 transition-all">
                                        <Link href={`/${restaurant.slug}`} target="_blank">Aperçu</Link>
                                    </Button>
                                    <Button asChild className="flex-[2] rounded-2xl bg-white text-black border-none font-bold text-[10px] tracking-wide h-12 hover:bg-red-600 hover:text-white transition-all shadow-xl shadow-black/20">
                                        <Link href={`/admin/moderation?restaurantId=${restaurant.id}`}>Paramètres d'accès</Link>
                                    </Button>
                                    <RestaurantModerationActions 
                                        restaurantId={restaurant.id} 
                                        currentStatus={restaurant.subscription_status} 
                                        currentPlan={restaurant.plan} 
                                        currentPaymentEnabled={restaurant.settings?.payment_config?.enabled} 
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
