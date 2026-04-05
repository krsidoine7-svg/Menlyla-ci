import { getAdminClient } from '@/lib/supabase/admin'
import { verifyAdmin } from '@/app/(super-admin)/admin/actions'
import { canView } from '@/lib/admin-permissions'
import { redirect } from 'next/navigation'
import { Table2, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TablesList } from '@/components/modules/super-admin/tables-list'

export default async function AdminTablesPage() {
    const caller = await verifyAdmin()
    const adminClient = getAdminClient()

    const { data: adminRecord } = await adminClient
        .from('app_admins')
        .select('is_super_admin, permissions')
        .eq('id', caller.id)
        .maybeSingle()

    if (!adminRecord || !canView(adminRecord as any, 'tables')) {
        redirect('/admin')
    }

    const { data: tables } = await adminClient
        .from('tables')
        .select('*, restaurants(name, slug)')
        .order('created_at', { ascending: false })

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
            {/* Header Suite */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white p-12 rounded-[4rem] shadow-2xl shadow-slate-100/50 border border-slate-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-[0.02] -rotate-12">
                     <Table2 className="h-64 w-64" />
                </div>
                <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-[2rem] bg-orange-600 flex items-center justify-center shadow-2xl shadow-orange-600/20">
                            <Table2 className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter text-slate-900 italic uppercase leading-none">
                            Système <span className="text-orange-500">Tables</span>
                        </h1>
                    </div>
                    <p className="text-slate-400 font-bold max-w-lg uppercase tracking-widest text-[10px] leading-relaxed italic">
                        Monitoring global de l'infrastructure physique du réseau Menlyla.
                    </p>
                </div>

                <div className="flex gap-4 relative z-10">
                    <Button className="h-20 bg-slate-900 hover:bg-black text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] px-10 gap-4 shadow-3xl shadow-slate-900/20 active:scale-95 transition-all">
                        <QrCode className="h-6 w-6 text-orange-500" />
                        Exporter Tous les QR
                    </Button>
                </div>
            </div>

            {/* Interactive List with Advanced Filtering */}
            <TablesList initialTables={tables || []} />
        </div>
    )
}
