import { getAdminClient } from '@/lib/supabase/admin'
import { verifyAdmin } from '@/app/(super-admin)/admin/actions'
import { canView } from '@/lib/admin-permissions'
import { redirect } from 'next/navigation'
import { 
    Table2, 
    Search, 
    QrCode, 
    Store,
    Users,
    ChevronRight,
    SearchX
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function AdminTablesPage() {
    const caller = await verifyAdmin()
    const adminClient = getAdminClient()

    // Fetch caller permissions
    const { data: adminRecord } = await adminClient
        .from('app_admins')
        .select('is_super_admin, permissions')
        .eq('id', caller.id)
        .maybeSingle()

    if (!adminRecord || !canView(adminRecord as any, 'tables')) {
        redirect('/admin')
    }

    // Fetch all tables with restaurant info
    const { data: tables, error } = await adminClient
        .from('tables')
        .select(`
            *,
            restaurants (
                name,
                slug
            )
        `)
        .order('created_at', { ascending: false })

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-200">
                            <Table2 className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-slate-900 italic uppercase">
                            Gestion des <span className="text-orange-500 underline decoration-8 decoration-orange-100 underline-offset-4">Tables</span>
                        </h1>
                    </div>
                    <p className="text-slate-500 font-bold max-w-md uppercase tracking-tight text-xs opacity-70">
                        Visualisez et gérez toutes les tables physiques et les zones de service créées par les restaurateurs.
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                    <div className="h-12 w-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center font-black text-slate-900 shadow-sm">
                        {tables?.length || 0}
                    </div>
                    <div className="pr-4">
                        <p className="text-[10px] font-black uppercase text-slate-400 leading-none mb-1">Total Tables</p>
                        <p className="text-sm font-bold text-slate-700 leading-none">Actives sur Menlyla</p>
                    </div>
                </div>
            </div>

            {/* Tables Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                    </div>
                    <Input 
                        placeholder="Rechercher une table, un restaurant..." 
                        className="pl-12 h-14 bg-white border-slate-200 rounded-2xl font-bold text-slate-700 focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all shadow-sm"
                    />
                </div>
                <Button className="h-14 bg-slate-900 hover:bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs gap-3 shadow-xl">
                    <QrCode className="h-5 w-5 text-orange-400" />
                    Exporter tous les QR
                </Button>
            </div>

            {/* Grid display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {tables?.length === 0 ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200 opacity-50">
                        <SearchX className="h-16 w-16 text-slate-300 mb-4" />
                        <p className="text-xl font-bold text-slate-400 uppercase italic">Aucune table trouvée</p>
                    </div>
                ) : (
                    tables?.map((table: any) => (
                        <Card key={table.id} className="group relative overflow-hidden border-none shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 rounded-[2rem] bg-white">
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-orange-50 text-orange-600 border border-orange-100">
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </div>
                            
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <Store className="h-3.5 w-3.5 text-orange-500" />
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest truncate max-w-[150px]">
                                        {table.restaurants?.name || 'Restaurant inconnu'}
                                    </span>
                                </div>
                                <CardTitle className="text-2xl font-black italic text-slate-900 group-hover:text-orange-600 transition-colors capitalize">
                                    {table.name}
                                </CardTitle>
                            </CardHeader>
                            
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                                        <Users className="h-4 w-4 text-slate-300" />
                                        Capacité: {table.capacity}
                                    </div>
                                    <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 font-bold text-[10px] uppercase rounded-lg">
                                        {table.zone_id ? 'Zone active' : 'Pas de zone'}
                                    </Badge>
                                </div>

                                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                    <div className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-tighter">
                                        ID: {table.id.split('-')[0]}...
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-400 italic">
                                        Créée le {new Date(table.created_at).toLocaleDateString('fr-FR')}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
