'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
    Search, ShoppingBag, CheckCircle2, FileText, Wallet, Store, Calendar, LayoutGrid, List as ListIcon, AlertCircle, ChevronDown, ArrowUpDown
} from 'lucide-react'
import { cn, formatOrderId } from '@/lib/utils'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function ArchiveList({ orders, onPrint }: { orders: any[], onPrint: (order: any) => void }) {
    const [searchTerm, setSearchTerm] = useState('')
    const [paymentFilter, setPaymentFilter] = useState('all') 
    const [dateFilter, setDateFilter] = useState('all')
    const [exactDate, setExactDate] = useState('')
    const [sortOrder, setSortOrder] = useState('desc')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    const filteredOrders = useMemo(() => {
        let result = orders.filter(order => {
            const matchesSearch = formatOrderId(order.id, order.created_at).toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 (order.tables?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
            
            const isPaid = order.payment_status === 'paid' || order.payments?.some((p: any) => p.status === 'success')
            const matchesPayment = paymentFilter === 'all' || 
                                  (paymentFilter === 'paid' && isPaid) ||
                                  (paymentFilter === 'unpaid' && !isPaid)
            
            let matchesDate = true
            const orderDate = new Date(order.created_at)
            const today = new Date()
            
            if (dateFilter === 'exact' && exactDate) {
                const targetDate = new Date(exactDate)
                matchesDate = orderDate.getFullYear() === targetDate.getFullYear() && 
                              orderDate.getMonth() === targetDate.getMonth() && 
                              orderDate.getDate() === targetDate.getDate()
            } else if (dateFilter === 'today') {
                matchesDate = orderDate.toDateString() === today.toDateString()
            } else if (dateFilter === 'week') {
                const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
                matchesDate = orderDate >= oneWeekAgo
            } else if (dateFilter === 'month') {
                const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
                matchesDate = orderDate >= oneMonthAgo
            }

            return matchesSearch && matchesPayment && matchesDate
        })

        result.sort((a, b) => {
            const dateA = new Date(a.created_at).getTime()
            const dateB = new Date(b.created_at).getTime()
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
        })

        return result
    }, [orders, searchTerm, paymentFilter, dateFilter, exactDate, sortOrder])

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Barre de Recherche et Filtres Repensée - Style SaaS Premium */}
            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center gap-3">
                <div className="flex-1 px-2 relative flex items-center">
                    <Search className="absolute left-4 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Input 
                        placeholder="Rechercher par n° de commande ou table..." 
                        className="h-10 pl-9 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none placeholder:text-slate-400 text-slate-900 text-sm font-medium w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="hidden lg:block h-8 w-px bg-slate-100" />

                <div className="flex flex-wrap items-center gap-2 px-2 pb-2 lg:px-0 lg:pb-0 lg:pr-2">
                    {/* Selecteur de Date */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-9 rounded-xl px-3 gap-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200 focus:ring-0">
                                <Calendar className="h-3.5 w-3.5 opacity-70" />
                                {dateFilter === 'all' ? 'Toutes les dates' : 
                                 dateFilter === 'today' ? "Aujourd'hui" : 
                                 dateFilter === 'week' ? '7 derniers jours' : 
                                 dateFilter === 'month' ? '30 derniers jours' : 'Date spécifique'}
                                <ChevronDown className="h-3 w-3 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-white rounded-xl border-slate-100 shadow-lg min-w-[200px]" align="end">
                            <DropdownMenuItem onClick={() => setDateFilter('all')} className="rounded-lg h-9 px-3 text-xs font-medium cursor-pointer !text-slate-700 data-[highlighted]:!bg-slate-50 data-[highlighted]:!text-slate-900 hover:!bg-slate-50 hover:!text-slate-900">Toutes les dates</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDateFilter('today')} className="rounded-lg h-9 px-3 text-xs font-medium cursor-pointer !text-slate-700 data-[highlighted]:!bg-slate-50 data-[highlighted]:!text-slate-900 hover:!bg-slate-50 hover:!text-slate-900">Aujourd'hui</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDateFilter('week')} className="rounded-lg h-9 px-3 text-xs font-medium cursor-pointer !text-slate-700 data-[highlighted]:!bg-slate-50 data-[highlighted]:!text-slate-900 hover:!bg-slate-50 hover:!text-slate-900">7 derniers jours</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDateFilter('month')} className="rounded-lg h-9 px-3 text-xs font-medium cursor-pointer !text-slate-700 data-[highlighted]:!bg-slate-50 data-[highlighted]:!text-slate-900 hover:!bg-slate-50 hover:!text-slate-900">30 derniers jours</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDateFilter('exact')} className="rounded-lg h-9 px-3 text-xs font-medium cursor-pointer !text-violet-700 data-[highlighted]:!bg-violet-50 data-[highlighted]:!text-violet-800 hover:!bg-violet-50 hover:!text-violet-800 font-bold border-t border-slate-50 mt-1 rounded-t-none">Choisir une date...</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Input Date Spécifique si sélectionnée */}
                    {dateFilter === 'exact' && (
                        <div className="flex items-center">
                            <Input 
                                type="date"
                                value={exactDate}
                                onChange={(e) => setExactDate(e.target.value)}
                                className="h-9 w-[130px] rounded-xl border border-violet-200 bg-violet-50/30 text-xs font-semibold text-violet-800 focus-visible:ring-1 focus-visible:ring-violet-500 shadow-sm px-3"
                            />
                        </div>
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-9 rounded-xl px-3 gap-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200 focus:ring-0">
                                <Wallet className="h-3.5 w-3.5 opacity-70" />
                                {paymentFilter === 'all' ? 'Tous les paiements' : paymentFilter === 'paid' ? 'Payé' : 'À régler'}
                                <ChevronDown className="h-3 w-3 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-white rounded-xl border-slate-100 shadow-lg min-w-[200px]" align="end">
                            <DropdownMenuItem onClick={() => setPaymentFilter('all')} className="rounded-lg h-9 px-3 text-xs font-medium cursor-pointer !text-slate-700 data-[highlighted]:!bg-slate-50 data-[highlighted]:!text-slate-900 hover:!bg-slate-50 hover:!text-slate-900">Tous les paiements</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setPaymentFilter('paid')} className="rounded-lg h-9 px-3 text-xs font-bold cursor-pointer !text-emerald-700 data-[highlighted]:!bg-emerald-50 data-[highlighted]:!text-emerald-800 hover:!bg-emerald-50 hover:!text-emerald-800">Déjà Payé</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setPaymentFilter('unpaid')} className="rounded-lg h-9 px-3 text-xs font-bold cursor-pointer !text-red-700 data-[highlighted]:!bg-red-50 data-[highlighted]:!text-red-800 hover:!bg-red-50 hover:!text-red-800">À Encaisser</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-9 rounded-xl px-3 gap-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200 focus:ring-0">
                                <ArrowUpDown className="h-3.5 w-3.5 opacity-70" />
                                {sortOrder === 'desc' ? 'Plus récentes' : 'Plus anciennes'}
                                <ChevronDown className="h-3 w-3 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-white rounded-xl border-slate-100 shadow-lg min-w-[180px]" align="end">
                            <DropdownMenuItem onClick={() => setSortOrder('desc')} className="rounded-lg h-9 px-3 text-xs font-medium cursor-pointer !text-slate-700 data-[highlighted]:!bg-slate-50 data-[highlighted]:!text-slate-900 hover:!bg-slate-50 hover:!text-slate-900">Plus récentes d'abord</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortOrder('asc')} className="rounded-lg h-9 px-3 text-xs font-medium cursor-pointer !text-slate-700 data-[highlighted]:!bg-slate-50 data-[highlighted]:!text-slate-900 hover:!bg-slate-50 hover:!text-slate-900">Plus anciennes d'abord</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="hidden sm:block h-6 w-px bg-slate-100 mx-1" />

                    <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 ml-auto lg:ml-0">
                        <Button variant="ghost" size="icon" onClick={() => setViewMode('grid')} className={cn("h-7 w-8 rounded-lg transition-colors shadow-none", viewMode === 'grid' ? "bg-white shadow-sm text-slate-900 border border-slate-200" : "text-slate-400 hover:text-slate-600")}><LayoutGrid className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setViewMode('list')} className={cn("h-7 w-8 rounded-lg transition-colors shadow-none", viewMode === 'list' ? "bg-white shadow-sm text-slate-900 border border-slate-200" : "text-slate-400 hover:text-slate-600")}><ListIcon className="h-3.5 w-3.5" /></Button>
                    </div>
                </div>
            </div>

            {/* Barre d'Informations */}
            <div className="flex items-center justify-between px-2">
                <span className="text-xs font-medium text-slate-500">
                    {filteredOrders.length} résultat{filteredOrders.length > 1 ? 's' : ''} trouvé{filteredOrders.length > 1 ? 's' : ''}
                    {dateFilter === 'exact' && exactDate && ` le ${new Date(exactDate).toLocaleDateString('fr-FR')}`}
                </span>
            </div>

            {filteredOrders.length > 0 ? (
                <div className={cn("grid gap-5", viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1 max-w-4xl")}>
                    {filteredOrders.map((order) => (
                        <ArchiveCard key={order.id} order={order} onPrint={() => onPrint(order)} mode={viewMode} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 border border-slate-100 rounded-3xl bg-slate-50/50">
                    <AlertCircle className="h-8 w-8 text-slate-300 mb-3" />
                    <h3 className="text-sm font-medium text-slate-500">Aucun résultat trouvé</h3>
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
            <Card className="rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-4 flex-1">
                    <div className="text-lg font-bold text-slate-900 min-w-[100px]">#{formatOrderId(order.id, order.created_at)}</div>
                    <div className="flex flex-wrap items-center gap-2 flex-1">
                         <div className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 flex items-center gap-1.5">
                            {isTakeAway ? <ShoppingBag className="h-3.5 w-3.5 text-slate-400" /> : <Store className="h-3.5 w-3.5 text-slate-400" />}
                            {isTakeAway ? 'À emporter' : (order.tables?.name || 'Vente directe')}
                        </div>
                         <div className={cn("px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5", isPaid ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800")}>
                            {isPaid ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <AlertCircle className="h-3.5 w-3.5 text-red-600" />}
                            {isPaid ? 'Payé' : 'À encaisser'}
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                    <div className="text-lg font-bold text-slate-900">{order.total_amount.toLocaleString()} <span className="text-xs text-slate-500 font-medium">FCFA</span></div>
                    <Button variant="ghost" size="icon" onClick={onPrint} className="h-9 w-9 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors border border-slate-200">
                        <FileText className="h-4 w-4" />
                    </Button>
                </div>
            </Card>
        )
    }

    return (
        <Card className="rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col h-[380px] overflow-hidden">
            <CardHeader className="p-5 flex flex-row justify-between items-start bg-slate-50/50 border-b border-slate-50">
                <div className="space-y-1.5">
                    <div className="text-xl font-bold tracking-tight text-slate-900">#{formatOrderId(order.id, order.created_at)}</div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                         <Calendar className="h-3.5 w-3.5" />
                         <span className="text-xs font-medium">{new Date(order.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                </div>
                <Badge variant="outline" className={cn("rounded-lg px-2.5 py-0.5 text-xs font-bold border", isPaid ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700")}>
                    {isPaid ? 'Payé' : 'À régler'}
                </Badge>
            </CardHeader>
            <CardContent className="p-5 flex-1 flex flex-col">
                <div className="flex-1 space-y-4">
                     <div className="space-y-2.5">
                         {order.order_items?.slice(0, 4).map((item: any, idx: number) => (
                             <div key={idx} className="flex justify-between items-center text-sm">
                                 <span className="text-slate-700 font-medium truncate pr-2 max-w-[180px] leading-tight">{item.quantity} × {item.dishes?.name}</span>
                                 <span className="text-slate-500 font-medium break-keep opacity-80">{(item.quantity * item.unit_price).toLocaleString()}</span>
                             </div>
                         ))}
                         {order.order_items?.length > 4 && <p className="text-xs text-slate-500 font-medium pt-1">et {order.order_items.length - 4} autres articles...</p>}
                     </div>
                </div>
                <div className="mt-auto space-y-4 pt-4">
                     <div className="h-px bg-slate-100 w-full" />
                     <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                        <div className="flex justify-between items-center">
                             <div className="flex items-center gap-2">
                                  <Wallet className={cn("h-4 w-4", isPaid ? "text-emerald-600" : "text-red-500")} />
                                  <span className="text-xs font-medium text-slate-600">{isPaid ? 'Encaissement reçu' : 'En attente'}</span>
                             </div>
                             <span className="text-lg font-bold text-slate-900">{order.total_amount.toLocaleString()} <span className="text-xs font-medium text-slate-500">FCFA</span></span>
                        </div>
                     </div>
                </div>
            </CardContent>
            <CardFooter className="p-5 pt-0 mt-auto">
                 <Button onClick={onPrint} className="w-full h-11 rounded-xl bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 font-medium text-sm gap-2 shadow-sm transition-colors">
                    <FileText className="h-4 w-4" />
                    Générer la facture
                </Button>
            </CardFooter>
        </Card>
    )
}
