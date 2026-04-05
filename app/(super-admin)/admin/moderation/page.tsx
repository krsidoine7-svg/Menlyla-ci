import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { RestaurantModerationActions } from '@/components/modules/super-admin/moderation-actions'
import { RestaurantModerationDrawer } from '@/components/modules/super-admin/restaurant-moderation-drawer'
import { getAllReviews } from '@/app/(super-admin)/admin/actions'
import { GlobalReviewModeration } from '@/components/modules/super-admin/global-review-moderation'
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
    Flag,
    MessageSquare
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
    
    // Fetch Global Reviews
    const reviews = await getAllReviews()
    
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

    // Fetch Restaurants
    const { data: restaurants } = await supabase
        .from('restaurants')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

    // Fetch Profiles
    const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

    return (
        <div className="space-y-12 pb-12 animate-in fade-in duration-700">
            {restaurantId && (
                <RestaurantModerationDrawer 
                    restaurantId={restaurantId} 
                    restaurantName={selectedRestaurantName} 
                    history={moderationHistory} 
                />
            )}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight text-white italic flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/20">
                            <ShieldAlert className="h-7 w-7 text-white" />
                        </div>
                        Modération <span className="text-red-500">.</span>
                    </h1>
                    <p className="text-white/40 font-medium text-sm max-w-2xl">Supervisez les comptes marchands et l'intégrité de la plateforme.</p>
                </div>
            </div>

            <Tabs defaultValue="restaurants" className="w-full space-y-8">
                <TabsList className="bg-white/5 p-1.5 h-14 rounded-2xl border border-white/10 gap-2">
                    <TabsTrigger value="restaurants" className="rounded-xl font-medium text-[10px] uppercase tracking-widest px-8 data-[state=active]:bg-white data-[state=active]:text-black transition-all duration-500 h-full">
                        <Store className="h-3.5 w-3.5 mr-2" /> Restaurants
                    </TabsTrigger>
                    <TabsTrigger value="profiles" className="rounded-xl font-medium text-[10px] uppercase tracking-widest px-8 data-[state=active]:bg-white data-[state=active]:text-black transition-all duration-500 h-full">
                        <User className="h-3.5 w-3.5 mr-2" /> Profils
                    </TabsTrigger>
                    <TabsTrigger value="reviews" className="rounded-xl font-medium text-[10px] uppercase tracking-widest px-8 data-[state=active]:bg-red-600 data-[state=active]:text-white transition-all duration-500 h-full flex items-center gap-2">
                        <MessageSquare className="h-3.5 w-3.5" /> Avis Clients
                    </TabsTrigger>
                    <TabsTrigger value="reports" className="rounded-xl font-medium text-[10px] uppercase tracking-widest px-8 data-[state=active]:bg-red-600 data-[state=active]:text-white transition-all duration-500 h-full flex items-center gap-2">
                        <Flag className="h-3.5 w-3.5" /> Signalements
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="restaurants" className="animate-in slide-in-from-bottom-4 duration-500">
                    <Card className="bg-white/5 border-white/10 rounded-[3rem] shadow-3xl overflow-hidden">
                        <CardHeader className="bg-white/[0.02] border-b border-white/5 px-10 py-8">
                            <CardTitle className="text-2xl font-bold italic text-white tracking-tight">Flux de vérification</CardTitle>
                            <CardDescription className="text-xs font-medium text-white/20">Établissements récemment inscrits sur Menlyla.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-y divide-white/5 bg-transparent border-b border-white/5">
                                {restaurants?.map((restaurant) => (
                                    <div key={restaurant.id} className="p-10 group hover:bg-white/[0.03] transition-all duration-500 relative">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-6">
                                                <div className="h-20 w-20 rounded-[2.5rem] bg-white/5 flex items-center justify-center border border-white/10 shadow-2xl relative overflow-hidden group-hover:rotate-3 transition-all duration-500">
                                                    {restaurant.logo_url ? (
                                                        <img src={restaurant.logo_url} alt={restaurant.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <Store className="h-10 w-10 text-white/10 transition-colors" />
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="font-bold text-white text-2xl italic tracking-tight">{restaurant.name}</h3>
                                                    <div className="text-[10px] font-medium text-white/20 tracking-wider uppercase">@{restaurant.slug}</div>
                                                    <div className="flex items-center gap-2 pt-3">
                                                        <Badge className="text-[8px] font-black tracking-widest border-white/10 bg-white/5 text-white/60 px-3 py-1 rounded-full uppercase italic">{restaurant.plan}</Badge>
                                                        <Badge variant="outline" className={cn(
                                                            "text-[8px] font-black tracking-widest px-3 py-1 rounded-full uppercase italic",
                                                            restaurant.subscription_status === 'active' ? "border-emerald-500/20 text-emerald-500" : "border-white/10 text-white/20"
                                                        )}>{restaurant.subscription_status}</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <RestaurantModerationActions 
                                                restaurantId={restaurant.id} 
                                                currentStatus={restaurant.subscription_status} 
                                                currentPlan={restaurant.plan} 
                                                currentPaymentEnabled={restaurant.settings?.payment_config?.enabled}
                                            />
                                        </div>
                                        <div className="mt-10 flex items-center gap-3">
                                            <Button asChild variant="outline" className="flex-1 h-12 rounded-2xl border-white/10 bg-white/5 font-bold text-[10px] uppercase tracking-widest text-white hover:bg-white/10 gap-3">
                                                <Link href={`/${restaurant.slug}`}>
                                                    <Eye className="h-3.5 w-3.5" /> Voir le menu
                                                </Link>
                                            </Button>
                                            <Button asChild variant="ghost" className="h-12 w-12 rounded-2xl text-white/20 hover:text-red-600 hover:bg-red-600/10 p-0 border border-transparent hover:border-red-600/20">
                                                <Link href={`/admin/moderation?restaurantId=${restaurant.id}`} scroll={false}>
                                                    <Info className="h-5 w-5" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="profiles" className="animate-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {profiles?.map((profile) => (
                            <Card key={profile.id} className="bg-white/5 border-white/10 rounded-[3rem] shadow-3xl overflow-hidden group relative">
                                <CardHeader className="text-center p-10 pb-6">
                                    <div className="relative mx-auto mb-6">
                                        <div className="h-24 w-24 rounded-[2.5rem] bg-white/5 text-white flex items-center justify-center font-bold text-3xl border border-white/10 shadow-3xl group-hover:rotate-3 transition-transform duration-500 overflow-hidden">
                                            {profile.profile_image ? (
                                                <img src={profile.profile_image} alt={profile.full_name} className="h-full w-full object-cover" />
                                            ) : (
                                                profile.full_name?.charAt(0) || profile.username?.charAt(0) || '?'
                                            )}
                                        </div>
                                    </div>
                                    <CardTitle className="font-bold text-2xl text-white italic tracking-tight line-clamp-1">{profile.full_name || 'Sans Nom'}</CardTitle>
                                    <CardDescription className="text-[10px] font-medium text-white/20 mt-2 uppercase tracking-widest">@{profile.username || 'user'}</CardDescription>
                                </CardHeader>
                                <CardContent className="px-10 pb-10">
                                    <div className="space-y-6">
                                        <p className="text-[10px] font-medium text-white/20 text-center line-clamp-2 italic h-10 leading-relaxed">
                                            {profile.bio || "Aucune biographie renseignée..."}
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <Button asChild variant="outline" className="flex-1 h-12 rounded-2xl border-white/10 bg-white/5 font-bold text-[10px] uppercase tracking-widest text-white hover:bg-white/10">
                                                <Link href={`/passport/${profile.username}`}>
                                                    Passport
                                                </Link>
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-12 w-12 p-0 rounded-2xl text-white/10 hover:text-red-600 hover:bg-red-600/10 transition-all border border-transparent hover:border-red-600/20">
                                                <ThumbsDown className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                                <div className="absolute top-0 right-0 h-32 w-32 bg-red-600/5 rounded-full blur-[100px] pointer-events-none" />
                            </Card>
                        ))}
                    </div>
                </TabsContent>
                
                <TabsContent value="reviews" className="animate-in slide-in-from-bottom-4 duration-500">
                    <GlobalReviewModeration initialReviews={reviews.data || []} />
                </TabsContent>
                
                <TabsContent value="reports" className="animate-in slide-in-from-bottom-4 duration-500">
                    <Card className="bg-white/5 border-red-600/10 rounded-[3rem] shadow-3xl overflow-hidden">
                        <CardContent className="p-20 flex flex-col items-center text-center space-y-8">
                            <div className="h-24 w-24 rounded-[2.5rem] bg-red-600 flex items-center justify-center text-white shadow-3xl shadow-red-600/20">
                                <Flag className="h-10 w-10" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-3xl font-bold text-white italic tracking-tight">Signalements</h3>
                                <p className="text-white/20 font-medium text-sm max-w-sm mx-auto">Aucun contenu n'a été signalé pour le moment. La plateforme est saine.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
