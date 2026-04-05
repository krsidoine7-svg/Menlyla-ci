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
    User,
    TrendingUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { RestaurantCRM } from "@/components/modules/super-admin/restaurant-crm"

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

    // Fetch all restaurants with CRM data from our centralized view
    const { data: restaurants, error } = await adminClient
        .from('admin_restaurants_crm')
        .select('*')
        .order('created_at', { ascending: false })

    const stats = {
        total: restaurants?.length || 0,
        pro: restaurants?.filter((r: any) => r.plan === 'pro').length || 0,
        solo: restaurants?.filter((r: any) => r.plan === 'solo' || !r.plan).length || 0,
        active: restaurants?.filter((r: any) => r.subscription_status === 'active').length || 0
    }

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
            {/* Header / Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-2 bg-red-600 p-10 rounded-[3rem] text-white relative overflow-hidden group shadow-2xl shadow-red-600/20">
                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:rotate-3 transition-transform duration-500 shadow-xl">
                                <Store className="h-7 w-7 text-white" />
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight italic">
                                CRM <span className="text-white/60">Gestion</span>
                            </h1>
                        </div>
                        <p className="text-white/70 font-medium text-sm max-w-sm leading-relaxed">
                            Contrôle 360° des établissements, revenus et performances de la plateforme Menlyla.
                        </p>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-8 rounded-[3rem] shadow-2xl flex flex-col justify-between group hover:bg-white/[0.07] transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <TrendingUp className="h-10 w-10 text-red-600 bg-red-600/10 p-2 rounded-2xl border border-red-600/20 group-hover:scale-105 transition-transform" />
                        <span className="text-[10px] font-bold text-red-600 bg-red-600/10 px-3 py-1.5 rounded-xl tracking-wider">Volume</span>
                    </div>
                    <div>
                        <div className="text-5xl font-bold italic text-white tracking-tight leading-none mb-2">
                            {Number(restaurants?.reduce((acc: number, curr: any) => acc + (Number(curr.total_revenue) || 0), 0) || 0).toLocaleString()}
                        </div>
                        <p className="text-[10px] font-medium text-white/30 uppercase tracking-wider">Revenu Global (F)</p>
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

            {/* The Main CRM Component handles all sorting, filtering and view toggles */}
            <RestaurantCRM initialData={restaurants || []} />
        </div>
    )
}
