import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { RestaurantModerationActions } from '@/components/modules/super-admin/moderation-actions'
import { RestaurantModerationDrawer } from '@/components/modules/super-admin/restaurant-moderation-drawer'
import Link from 'next/link'
import { 
    ShieldAlert, 
    Store, 
    User, 
    Search, 
    Filter, 
    Eye,
    ThumbsDown,
    ThumbsUp,
    MoreVertical,
    CheckCircle2,
    XCircle,
    Info,
    AlertTriangle,
    Flag
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export default async function ModerationManagement(props: { searchParams?: Promise<{ [key: string]: string | undefined }> }) {
    const supabase = await createClient()
    const searchParams = await props.searchParams
    
    // Check if drawer should be open
    const restaurantId = searchParams?.restaurantId
    let moderationHistory: any[] = []
    let selectedRestaurantName = ''

    if (restaurantId) {
        const adminClient = getAdminClient()
        const { data: hist } = await adminClient
            .from('moderation_history')
            .select(`
                *,
                app_admins!admin_id(email)
            `)
            .eq('restaurant_id', restaurantId)
            .order('created_at', { ascending: false })
            
        moderationHistory = hist || []
        
        const { data: rest } = await supabase.from('restaurants').select('name').eq('id', restaurantId).maybeSingle()
        selectedRestaurantName = rest?.name || 'Restaurant Inconnu'
    }

    // Fetch Restaurants needing review (or just all for now)
    const { data: restaurants } = await supabase
        .from('restaurants')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

    // Fetch Profiles
    const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

    return (
        <div className="space-y-8 pb-12">
            {restaurantId && (
                <RestaurantModerationDrawer 
                    restaurantId={restaurantId} 
                    restaurantName={selectedRestaurantName} 
                    history={moderationHistory} 
                />
            )}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm flex items-center gap-3">
                        <ShieldAlert className="h-8 w-8 text-orange-500" />
                        Espace Modération
                    </h1>
                    <p className="text-slate-500 font-medium max-w-2xl">Surveillez le contenu de la plateforme pour garantir la sécurité et la qualité.</p>
                </div>
            </div>

            <Tabs defaultValue="restaurants" className="w-full space-y-6">
                <TabsList className="bg-slate-200/50 p-1.5 h-12 rounded-2xl border-none gap-2">
                    <TabsTrigger value="restaurants" className="rounded-xl font-bold px-6 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all duration-300">
                        <Store className="h-4 w-4 mr-2" /> Restaurants
                    </TabsTrigger>
                    <TabsTrigger value="profiles" className="rounded-xl font-bold px-6 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all duration-300">
                        <User className="h-4 w-4 mr-2" /> Profiles Publics
                    </TabsTrigger>
                    <TabsTrigger value="reports" className="rounded-xl font-bold px-6 data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-lg transition-all duration-300">
                        <Flag className="h-4 w-4 mr-2" /> Signalements
                        <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-rose-500 border-none shadow-md">3</Badge>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="restaurants">
                    <Card className="border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
                        <CardHeader className="bg-slate-50/80 border-b px-6 py-4 flex flex-row items-center justify-between">
                            <div className="space-y-0.5">
                                <CardTitle className="text-lg font-bold">Nouveaux Restaurants</CardTitle>
                                <CardDescription className="text-xs font-semibold uppercase tracking-widest text-slate-400">À valider ou modérer</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-100">
                                {restaurants?.map((restaurant) => (
                                    <div key={restaurant.id} className="bg-white p-6 group hover:bg-slate-50/50 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-4">
                                                <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center border-2 border-slate-200 shadow-sm overflow-hidden group-hover:rotate-3 transition-transform duration-300">
                                                    {restaurant.logo_url ? (
                                                        <img src={restaurant.logo_url} alt={restaurant.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <Store className="h-6 w-6 text-slate-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors text-lg">{restaurant.name}</h3>
                                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-2">@{restaurant.slug}</div>
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <Badge variant="outline" className="text-[10px] font-black tracking-widest border-slate-200 bg-white shadow-sm">{restaurant.plan}</Badge>
                                                        <Badge variant="outline" className={cn(
                                                            "text-[10px] font-black tracking-widest shadow-sm",
                                                            restaurant.subscription_status === 'active' ? "border-emerald-100 bg-emerald-50 text-emerald-600" : "border-slate-100 bg-slate-50 text-slate-400"
                                                        )}>{restaurant.subscription_status}</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <RestaurantModerationActions restaurantId={restaurant.id} currentStatus={restaurant.subscription_status} />
                                        </div>
                                        <div className="mt-6 flex items-center gap-2">
                                            <Button asChild variant="outline" size="sm" className="flex-1 h-9 rounded-xl border-slate-200 font-bold text-slate-600 hover:bg-slate-100 gap-2">
                                                <Link href={`/${restaurant.slug}`}>
                                                    <Eye className="h-3.5 w-3.5" /> Voir page
                                                </Link>
                                            </Button>
                                            <Button asChild variant="outline" size="sm" className="h-9 w-9 rounded-xl border-slate-200 p-0 hover:bg-primary/5 hover:text-primary transition-all">
                                                <Link href={`/admin/moderation?restaurantId=${restaurant.id}`} scroll={false}>
                                                    <Info className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {(!restaurants || restaurants.length === 0) && (
                                <div className="p-20 text-center bg-white">
                                    <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm">
                                        <Store className="h-8 w-8 text-slate-100" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2 italic">Aucun restaurant à modérer</h3>
                                    <p className="text-slate-500 font-medium">Tout est en ordre !</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="profiles">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {profiles?.map((profile) => (
                            <Card key={profile.id} className="border-none shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden bg-white/80">
                                <CardHeader className="text-center pt-8 pb-4">
                                    <div className="relative mx-auto mb-4">
                                        <div className="h-20 w-20 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-black text-3xl border-4 border-white shadow-xl group-hover:scale-110 transition-transform duration-300">
                                            {profile.profile_image ? (
                                                <img src={profile.profile_image} alt={profile.full_name} className="h-full w-full object-cover rounded-full" />
                                            ) : (
                                                profile.full_name?.charAt(0) || profile.username?.charAt(0) || '?'
                                            )}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-emerald-500 border-4 border-white shadow-lg animate-pulse" />
                                    </div>
                                    <CardTitle className="font-extrabold text-xl text-slate-900 line-clamp-1">{profile.full_name || 'Sans Nom'}</CardTitle>
                                    <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-400">@{profile.username || 'user'}</CardDescription>
                                </CardHeader>
                                <CardContent className="px-6 pb-6">
                                    <div className="space-y-4">
                                        <p className="text-xs font-medium text-slate-600 text-center line-clamp-2 italic h-8 leading-relaxed">
                                            {profile.bio || "Aucune biographie renseignée..."}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Button asChild variant="outline" size="sm" className="flex-1 h-9 rounded-xl border-slate-200 font-bold text-slate-600 hover:bg-slate-100 transition-all uppercase tracking-tighter text-[10px]">
                                                <Link href={`/passport/${profile.username}`}>
                                                    Review Passport
                                                </Link>
                                            </Button>
                                            <Button variant="destructive" size="sm" className="h-9 w-9 p-0 rounded-xl shadow-lg shadow-rose-500/10 transition-all hover:rotate-12">
                                                <ThumbsDown className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                                <div className="h-1.5 w-full bg-slate-100">
                                    <div className="h-full bg-orange-500 w-full opacity-5 group-hover:opacity-20 transition-opacity" />
                                </div>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
                
                <TabsContent value="reports">
                    <Card className="border-none shadow-sm overflow-hidden bg-white/50 border-2 border-rose-50">
                        <CardHeader className="bg-rose-50/50 border-b border-rose-100 px-6 py-4 flex flex-row items-center justify-between">
                            <div className="space-y-0.5">
                                <CardTitle className="text-lg font-bold text-rose-900 flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-rose-500" /> Signalements Actifs
                                </CardTitle>
                                <CardDescription className="text-xs font-semibold uppercase tracking-widest text-rose-400">Contenu signalé par les utilisateurs</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="flex flex-col items-center justify-center p-12 text-center bg-rose-50/20 rounded-3xl border-2 border-dashed border-rose-200">
                                <div className="h-16 w-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4 shadow-inner">
                                    <ShieldAlert className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-bold text-rose-900">Module de signalements actif</h3>
                                <p className="text-slate-500 font-medium max-w-sm mt-2">Ici apparaîtront les contenus signalés par la communauté Menlyla via le bouton "Signaler" public.</p>
                                <Button asChild className="mt-6 bg-rose-600 hover:bg-rose-700 font-bold px-8 rounded-xl shadow-lg shadow-rose-600/20">
                                    <Link href="/admin/settings">
                                        Configurer Alertes Email
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
