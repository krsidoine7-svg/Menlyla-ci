'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
    Search, 
    ShoppingBag, 
    CheckCircle2, 
    FileText, 
    Wallet, 
    Store,
    Calendar,
    LayoutGrid,
    List as ListIcon,
    AlertCircle,
    ChevronDown
} from 'lucide-react'
import { cn, formatOrderId } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ArchiveList({ orders, onPrint }: { orders: any[], onPrint: (order: any) => void }) {
    const [searchTerm, setSearchTerm] = useState('')
    const [paymentFilter, setPaymentFilter] = useState('all') 
    const [typeFilter, setTypeFilter] = useState('all') 
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchesSearch = formatOrderId(order.id, order.created_at).toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 (order.tables?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
            
            const isPaid = order.payment_status === 'paid' || order.payments?.some((p: any) => p.status === 'success')
            const matchesPayment = paymentFilter === 'all' || 
                                  (paymentFilter === 'paid' && isPaid) ||
                                  (paymentFilter === 'unpaid' && !isPaid)
            
            const matchesType = typeFilter === 'all' || order.dining_type === typeFilter

            return matchesSearch && matchesPayment && matchesType
        })
    }, [orders, searchTerm, paymentFilter, typeFilter])

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Filters Bar - Refined */}
            <div className="bg-white p-4 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-1 items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                            placeholder="Chercher une commande ou table..." 
                            className="h-10 pl-11 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-0 focus:border-slate-400 transition-all text-slate-700 shadow-none border-dashed"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-10 rounded-2xl bg-slate-50 border border-slate-200 px-4 gap-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all">
                                {paymentFilter === 'all' ? 'Tous les paiements' : paymentFilter === 'paid' ? 'Payé ✅' : 'À régler ❌'}
                                <ChevronDown className="h-3 w-3 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="rounded-2xl border border-slate-100 shadow-xl p-2 min-w-[200px]">
                            <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 px-4 py-2">Statut du règlement</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setPaymentFilter('all')} className="rounded-xl h-10 px-4 font-semibold cursor-pointer hover:bg-slate-50">Tout voir</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setPaymentFilter('paid')} className="rounded-xl h-10 px-4 font-semibold cursor-pointer text-emerald-600">Déjà Payé</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setPaymentFilter('unpaid')} className="rounded-xl h-10 px-4 font-semibold cursor-pointer text-red-600">À Encaisser</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="flex bg-slate-100/50 p-1 rounded-2xl border border-slate-200">
                        <Button variant="ghost" size="sm" onClick={() => setViewMode('grid')} className={cn("h-8 rounded-xl px-3 transition-all", viewMode === 'grid' ? "bg-white shadow-sm text-slate-900" : "text-slate-400")}><LayoutGrid className="h-3.5 w-3.5 mr-2" /> <span className="text-[10px] font-bold">Grille</span></Button>
                        <Button variant="ghost" size="sm" onClick={() => setViewMode('list')} className={cn("h-8 rounded-xl px-3 transition-all", viewMode === 'list' ? "bg-white shadow-sm text-slate-900" : "text-slate-400")}><ListIcon className="h-3.5 w-3.5 mr-2" /> <span className="text-[10px] font-bold">Liste</span></Button>
                    </div>
                </div>
            </div>

            {/* Results Grid/List - Cleaner Borders */}
            {filteredOrders.length > 0 ? (
                <div className={cn("grid gap-5", viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1")}>
                    {filteredOrders.map((order) => (
                        <ArchiveCard key={order.id} order={order} onPrint={() => onPrint(order)} mode={viewMode} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-40 border border-slate-100 rounded-[2.5rem] bg-slate-50/30">
                    <AlertCircle className="h-10 w-10 text-slate-200 mb-4" />
                    <h3 className="text-sm font-bold text-slate-400">Aucun résultat trouvé</h3>
                </div>
            )}
        </div>
    )
}

function ArchiveCard({ order, onPrint, mode }: { order: any, onPrint: () => void, mode: 'grid' | 'list' }) {
    const isPaid = order.payment_status === 'paid' || order.payments?.some((p: any) => p.status === 'success')
    const isTakeAway = order.dining_type === 'take_away'

    if (mode === 'list') {
        return (
            <Card className="rounded-3xl border border-slate-100 shadow-sm hover:border-slate-300 transition-all duration-300 bg-white p-5 flex flex-col md:flex-row md:items-center gap-6 group scale-[0.99] hover:scale-100">
                <div className="flex items-center gap-6 flex-1">
                    <div className="text-xl font-bold tracking-tight text-slate-900 w-28">#{formatOrderId(order.id, order.created_at)}</div>
                    <div className="flex items-center gap-3 flex-1">
                         <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] font-bold text-slate-600 flex items-center gap-2">
                            {isTakeAway ? <ShoppingBag className="h-3.5 w-3.5 text-slate-400" /> : <Store className="h-3.5 w-3.5 text-slate-400" />}
                            {isTakeAway ? 'À emporter' : (order.tables?.name || 'Vente directe')}
                        </div>
                         <div className={cn("px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-2", isPaid ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-red-50 border-red-100 text-red-700")}>
                            {isPaid ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5 text-red-400" />}
                            {isPaid ? 'Règlement payé' : 'À encaisser'}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-8">
                    <div className="text-lg font-bold text-slate-900">{order.total_amount.toLocaleString()} <span className="text-[10px] text-slate-400">FCFA</span></div>
                    <Button variant="ghost" size="icon" onClick={onPrint} className="h-10 w-10 rounded-xl hover:bg-slate-900 hover:text-white transition-all text-slate-400 border border-slate-100">
                        <FileText className="h-5 w-5" />
                    </Button>
                </div>
            </Card>
        )
    }

    return (
        <Card className="rounded-[2.5rem] border border-slate-100 shadow-sm hover:border-slate-300 hover:shadow-lg transition-all duration-300 bg-white flex flex-col min-h-[400px] overflow-hidden">
            <CardHeader className="p-8 pb-5 flex flex-row justify-between items-center bg-slate-50/10">
                <div className="space-y-1">
                    <div className="text-2xl font-bold tracking-tighter text-slate-900">#{formatOrderId(order.id, order.created_at)}</div>
                    <div className="flex items-center gap-2 text-slate-400">
                         <Calendar className="h-3.5 w-3.5" />
                         <span className="text-[11px] font-medium">{new Date(order.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                </div>
                <Badge variant="outline" className={cn("rounded-full px-3 py-1 text-[10px] font-bold border", isPaid ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-red-50 border-red-100 text-red-700")}>
                    {isPaid ? 'Payé' : 'Non payé'}
                </Badge>
            </CardHeader>
            <CardContent className="p-8 pt-0 flex-1">
                <div className="space-y-5">
                     <div className="space-y-3 px-1">
                         {order.order_items?.slice(0, 4).map((item: any, idx: number) => (
                             <div key={idx} className="flex justify-between items-center text-xs">
                                 <span className="text-slate-600 font-medium">{item.quantity} × {item.dishes?.name}</span>
                                 <span className="text-slate-400 font-medium">{(item.quantity * item.unit_price).toLocaleString()}</span>
                             </div>
                         ))}
                         {order.order_items?.length > 4 && <p className="text-[10px] text-orange-500 font-bold italic pt-1">+ {order.order_items.length - 4} autres articles</p>}
                     </div>
                     <div className="h-px bg-slate-100 w-full" />
                     <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 space-y-3">
                        <div className="flex justify-between items-center">
                             <div className="flex items-center gap-2">
                                  <Wallet className={cn("h-4 w-4", isPaid ? "text-emerald-500" : "text-red-400")} />
                                  <span className="text-[10px] font-bold text-slate-500">{isPaid ? 'Encaissement reçu' : 'Mode en attente'}</span>
                             </div>
                             <span className="text-lg font-bold text-slate-900">{order.total_amount.toLocaleString()} <span className="text-[10px] text-slate-400">FCFA</span></span>
                        </div>
                     </div>
                </div>
            </CardContent>
            <CardFooter className="p-8 pt-0">
                 <Button onClick={onPrint} className="w-full h-11 rounded-2xl bg-white text-slate-900 border border-slate-200 hover:bg-slate-900 hover:text-white transition-all font-bold text-xs gap-2 shadow-sm">
                    <FileText className="h-4 w-4" />
                    Générer la facture
                </Button>
            </CardFooter>
        </Card>
    )
}
