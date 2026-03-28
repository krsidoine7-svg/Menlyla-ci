import { createClient } from '@/lib/supabase/server'
import { 
    CreditCard, 
    TrendingUp, 
    Search, 
    Filter, 
    ArrowUpRight, 
    ArrowDownRight,
    CheckCircle2,
    Clock,
    XCircle,
    Download,
    Receipt,
    Calendar,
    Coins,
    Wallet
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default async function PaymentsManagement() {
    const supabase = await createClient()

    // Fetch Payments
    const { data: payments } = await supabase
        .from('payments')
        .select(`
            *,
            restaurants (
                name,
                owner_id
            )
        `)
        .order('created_at', { ascending: false })

    // Stats
    const totalRevenue = payments?.filter(p => p.status === 'COMPLETED').reduce((acc, p) => acc + (p.amount || 0), 0) || 0
    const pendingRevenue = payments?.filter(p => p.status === 'PENDING').reduce((acc, p) => acc + (p.amount || 0), 0) || 0
    const completedCount = payments?.filter(p => p.status === 'COMPLETED').length || 0

    const stats = [
        {
            title: "Revenu Total Net",
            value: `${(totalRevenue / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}`,
            description: "depuis la création",
            icon: Coins,
            color: "text-emerald-600",
            bg: "bg-emerald-50"
        },
        {
            title: "Paiements En Attente",
            value: `${(pendingRevenue / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}`,
            description: "transactions en cours",
            icon: Clock,
            color: "text-amber-600",
            bg: "bg-amber-50"
        },
        {
            title: "Transactions Réussies",
            value: completedCount,
            description: "paiements complétés",
            icon: CheckCircle2,
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            title: "Progression (30j)",
            value: "+12.5%",
            description: "vs mois précédent",
            icon: TrendingUp,
            color: "text-indigo-600",
            bg: "bg-indigo-50"
        }
    ]

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm flex items-center gap-3">
                        <Wallet className="h-8 w-8 text-orange-500" />
                        Gestion des Paiements
                    </h1>
                    <p className="text-slate-500 font-medium max-w-2xl">Suivez les revenus, les abonnements SaaS et les transactions de la plateforme.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-10 border-slate-200 bg-white font-bold text-slate-600 gap-2">
                        <Download className="h-4 w-4" />
                        Exporter
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-slate-500">
                            <CardTitle className="text-xs font-black uppercase tracking-widest">{stat.title}</CardTitle>
                            <div className={cn("p-2 rounded-lg", stat.bg)}>
                                <stat.icon className={cn("h-4 w-4", stat.color)} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                            <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-tighter">{stat.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/80 border-b px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="space-y-0.5">
                        <CardTitle className="text-lg font-bold">Historique des Transactions</CardTitle>
                        <CardDescription className="text-xs font-semibold uppercase tracking-widest text-slate-400">Total de {payments?.length || 0} transactions</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input placeholder="Rechercher une transaction..." className="pl-10 h-10 border-slate-200 bg-white shadow-sm focus-visible:ring-orange-500" />
                        </div>
                        <Button variant="outline" className="h-10 border-slate-200 bg-white font-bold text-slate-600">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Client / Restaurant</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Montant</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Statut</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">ID Transaction</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 italic font-medium text-slate-600">
                            {payments?.map((payment) => (
                                <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs border border-slate-200 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                                <Receipt className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <div className="font-bold not-italic text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{payment.restaurants?.name || 'Inconnu'}</div>
                                                <div className="text-[10px] font-black tracking-widest text-slate-400 uppercase leading-none mt-0.5">SaaS Subscription</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <div className="font-black not-italic text-slate-900 text-base">
                                            {((payment.amount || 0) / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <Badge variant="outline" className={cn(
                                            "capitalize font-black tracking-tighter px-3 py-1 border-2 select-none",
                                            payment.status === 'COMPLETED' 
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm shadow-emerald-500/10" 
                                                : payment.status === 'PENDING'
                                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                                : "bg-rose-50 text-rose-700 border-rose-200"
                                        )}>
                                            {payment.status === 'COMPLETED' ? (
                                                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3" /> Succès</span>
                                            ) : payment.status === 'PENDING' ? (
                                                <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> En attente</span>
                                            ) : (
                                                <span className="flex items-center gap-1.5"><XCircle className="h-3 w-3" /> Échec</span>
                                            )}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <div className="flex items-center gap-2 text-sm font-bold text-slate-500 not-italic">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {payment.created_at ? new Date(payment.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Indéterminé'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <div className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-tighter">
                                            #{payment.id.slice(0, 12)}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {(!payments || payments.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-slate-400 font-bold italic not-italic">Aucune transaction trouvée</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    )
}
