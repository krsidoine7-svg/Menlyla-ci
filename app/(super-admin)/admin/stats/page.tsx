import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { BarChart3 } from 'lucide-react'
import { AnalyticsDashboard } from '@/components/modules/super-admin/analytics-dashboard'

export default async function AdminStatsPage() {
    const supabase = await createClient()
    const adminClient = getAdminClient()

    // 1. Fetch Global Users Count
    const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
    
    // 2. Fetch All Restaurants (for counts & plans)
    const { data: restaurants } = await adminClient
        .from('restaurants')
        .select('*')
        .order('created_at', { ascending: false })
    
    // 3. Fetch All Successful Payments (for SaaS and Restaurant ROI)
    const { data: payments } = await adminClient
        .from('payments')
        .select('*')
        .or('status.eq.COMPLETED,status.eq.success')
        .order('created_at', { ascending: true })

    return (
        <div className="space-y-12 pb-20 animate-in fade-in duration-700">
            <div className="bg-red-600 p-12 rounded-[4rem] text-white overflow-hidden relative shadow-3xl shadow-red-600/20">
                <div className="relative z-10 space-y-4">
                    <h1 className="text-5xl font-black italic uppercase tracking-tighter flex items-center gap-4">
                        <BarChart3 className="h-12 w-12" /> Intelligence <span className="text-white/40">SaaS</span>
                    </h1>
                    <p className="max-w-2xl text-red-100 font-medium text-lg leading-relaxed italic">
                        Tableau de bord financier et analytique global. Suivez la croissance de Menlyla et la rentabilité de vos partenaires en temps réel.
                    </p>
                </div>
            </div>

            {/* The Main Analytics Dashboard handles all charts and ROI logic */}
            <AnalyticsDashboard 
                restaurants={restaurants || []} 
                payments={payments || []} 
                totalUsers={userCount || 0} 
            />
        </div>
    )
}
