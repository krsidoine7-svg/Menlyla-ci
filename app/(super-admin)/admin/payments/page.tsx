import { createClient } from '@/lib/supabase/server'
import { getSystemSettings } from '@/app/(super-admin)/admin/actions'
import { PaymentControls } from '@/components/modules/super-admin/payment-controls'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { 
    CreditCard, 
    TrendingUp, 
    Search, 
    Filter, 
    CheckCircle2,
    Clock,
    Download,
    Receipt,
    Calendar,
    Coins,
    Wallet,
    Activity,
    Zap
} from 'lucide-react'

export default async function PaymentsManagement() {
    const supabase = await createClient()
    const systemSettings = await getSystemSettings()

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
    const totalRevenue = payments?.filter((p: any) => p.status === 'COMPLETED').reduce((acc: number, p: any) => acc + (p.amount || 0), 0) || 0
    const pendingRevenue = payments?.filter((p: any) => p.status === 'PENDING').reduce((acc: number, p: any) => acc + (p.amount || 0), 0) || 0
    const completedCount = payments?.filter((p: any) => p.status === 'COMPLETED').length || 0

    const stats = [
        {
            title: "Revenu Total Net",
            value: `${(totalRevenue / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}`,
            description: "depuis la création",
            icon: Coins
        },
        {
            title: "Transactions Réussies",
            value: completedCount,
            description: "paiements complétés",
            icon: CheckCircle2
        },
        {
            title: "Paiements En Attente",
            value: `${(pendingRevenue / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}`,
            description: "flux en cours",
            icon: Clock
        },
        {
            title: "Progression (30j)",
            value: "+12.5%",
            description: "vs mois précédent",
            icon: TrendingUp
        }
    ]

    return (
        <div className="space-y-12 pb-12 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight text-white italic flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/20">
                            <Wallet className="h-7 w-7 text-white" />
                        </div>
                        Flux Financier <span className="text-red-500">.</span>
                    </h1>
                    <p className="text-white/40 font-medium text-sm max-w-2xl">Suivez les revenus SaaS et les transactions traitées par la plateforme.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-12 border-white/10 bg-white/5 font-semibold text-xs text-white gap-3 rounded-2xl hover:bg-white/10 px-6">
                        <Download className="h-4 w-4 text-red-600" />
                        Exporter les rapports
                    </Button>
                </div>
            </div>

            {/* QUICK TOGGLES & PRICING - Using PaymentControls shared Client component */}
            <PaymentControls initialSettings={systemSettings} />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <Card key={i} className="bg-white/5 border-white/10 rounded-[2rem] shadow-2xl overflow-hidden group hover:bg-white/[0.07] transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-[10px] font-medium text-white/30 uppercase tracking-widest">{stat.title}</CardTitle>
                            <div className={cn("p-2.5 rounded-xl", "bg-white/5 border border-white/5 group-hover:border-red-600/20")}>
                                <stat.icon className={cn("h-4 w-4", "text-red-600")} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white tracking-tight italic">{stat.value}</div>
                            <p className="text-[10px] font-medium text-white/20 mt-2 flex items-center gap-2">
                                <Activity className="h-3 w-3" />
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="bg-white/5 border-white/10 rounded-[3rem] shadow-3xl overflow-hidden">
                <CardHeader className="bg-white/[0.02] border-b border-white/5 px-10 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-2">
                        <CardTitle className="text-2xl font-bold italic text-white tracking-tight">Journal des Transactions</CardTitle>
                        <CardDescription className="text-xs font-medium text-white/20">Flux global de {payments?.length || 0} opérations</CardDescription>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                            <Input placeholder="Rechercher..." className="pl-11 h-12 bg-white/5 border-white/10 rounded-2xl text-sm text-white placeholder:text-white/10 focus:border-red-600 transition-all" />
                        </div>
                        <Button variant="outline" className="h-12 w-12 p-0 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-white/[0.01] border-b border-white/5">
                                <th className="px-8 py-5 text-[10px] font-semibold text-white/30 uppercase tracking-widest text-center w-20">Type</th>
                                <th className="px-8 py-5 text-[10px] font-semibold text-white/30 uppercase tracking-widest text-left">Établissement</th>
                                <th className="px-8 py-5 text-[10px] font-semibold text-white/30 uppercase tracking-widest text-left">Montant</th>
                                <th className="px-8 py-5 text-[10px] font-semibold text-white/30 uppercase tracking-widest text-left">Statut</th>
                                <th className="px-8 py-5 text-[10px] font-semibold text-white/30 uppercase tracking-widest text-left">Date</th>
                                <th className="px-8 py-5 text-[10px] font-semibold text-white/30 uppercase tracking-widest text-right">Référence</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {payments?.map((payment: any) => (
                                <tr key={payment.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-6 whitespace-nowrap text-center">
                                        <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center mx-auto group-hover:border-red-600/30 transition-all">
                                            <Zap className="h-4 w-4 text-red-600" />
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="space-y-1">
                                            <div className="font-bold text-white text-sm">{payment.restaurants?.name || 'Inconnu'}</div>
                                            <div className="text-[10px] font-medium text-white/20 uppercase tracking-wider">Abonnement SaaS</div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="font-bold text-white text-base italic">
                                            {((payment.amount || 0) / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <Badge className={cn(
                                            "font-bold text-[9px] px-3 py-1 rounded-xl border uppercase tracking-wider",
                                            payment.status === 'COMPLETED' 
                                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                                                : payment.status === 'PENDING'
                                                ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                                : "bg-red-600/10 text-red-600 border-red-600/20"
                                        )}>
                                            {payment.status === 'COMPLETED' ? 'Réussi' : payment.status === 'PENDING' ? 'En attente' : 'Échoué'}
                                        </Badge>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="flex items-center gap-2 text-xs font-medium text-white/40">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {payment.created_at ? new Date(payment.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '---'}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-right text-right">
                                        <div className="text-[10px] font-mono font-medium text-white/10 uppercase group-hover:text-white/30 transition-colors">
                                            #{payment.id.slice(0, 12)}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {(!payments || payments.length === 0) && (
                                <tr>
                                    <td colSpan={6} className="p-24 text-center">
                                        <div className="h-16 w-16 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10">
                                            <Receipt className="h-8 w-8 text-white/10" />
                                        </div>
                                        <p className="text-white/20 font-medium italic">Aucune transaction enregistrée</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    )
}
