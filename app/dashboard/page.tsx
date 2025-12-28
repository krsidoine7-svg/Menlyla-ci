import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getDashboardStats, getRecentOrders, getWeeklyRevenue, getOnboardingStatus } from '@/components/modules/admin/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SalesChart } from '@/components/modules/analytics/components/sales-chart'
import { RecentActivity } from '@/components/modules/admin/recent-activity'
import { OnboardingChecklist } from '@/components/modules/admin/onboarding-checklist'
import { DollarSign, ShoppingBag, Activity } from 'lucide-react'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const stats = await getDashboardStats()
    const recentOrders = await getRecentOrders()
    const weeklyRevenue = await getWeeklyRevenue()
    const onboardingStatus = await getOnboardingStatus()

    const { data: restaurant } = await supabase.from('restaurants').select('id').eq('owner_id', user.id).single()

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Vue d'ensemble</h1>

            {onboardingStatus && <OnboardingChecklist status={onboardingStatus} />}

            {stats ? (
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Revenu du Jour</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.revenue.toLocaleString()} {stats.currency}</div>
                            <p className="text-xs text-muted-foreground">Commandes payées/livrées</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Commandes (Jour)</CardTitle>
                            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.count}</div>
                            <p className="text-xs text-muted-foreground">Total commandes</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">En cours</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.preparing}</div>
                            <p className="text-xs text-muted-foreground">À traiter</p>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="text-muted-foreground">Chargement des statistiques...</div>
            )}

            {/* Charts Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Revenus (7 jours)</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <SalesChart data={weeklyRevenue} currency={stats?.currency || 'FCFA'} />
                    </CardContent>
                </Card>

                <div className="col-span-3">
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
