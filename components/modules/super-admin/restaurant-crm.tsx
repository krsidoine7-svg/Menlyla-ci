"use client";

import { useState, useMemo } from "react";
import { 
    LayoutGrid, 
    List, 
    Search, 
    Filter, 
    ArrowUpDown, 
    ExternalLink, 
    MoreVertical, 
    Calendar, 
    TrendingUp, 
    CreditCard,
    ArrowUpRight,
    Store,
    Users,
    ChevronRight,
    SearchX,
    QrCode,
    ShoppingBag,
    UtensilsCrossed,
    Clock,
    Ban,
    BadgeCheck
} from "lucide-react";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface RestaurantCRMProps {
    initialData: any[];
}

export function RestaurantCRM({ initialData }: RestaurantCRMProps) {
    const [view, setView] = useState<"grid" | "table">("grid");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [planFilter, setPlanFilter] = useState<string>("all");
    const [sortField, setSortField] = useState("created_at");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

    // Filtering & Sorting Logic
    const filteredData = useMemo(() => {
        let result = initialData.filter(item => {
            const matchesSearch = 
                item.name?.toLowerCase().includes(search.toLowerCase()) || 
                item.slug?.toLowerCase().includes(search.toLowerCase()) ||
                item.owner_name?.toLowerCase().includes(search.toLowerCase());
            
            const matchesStatus = statusFilter === "all" || item.subscription_status === statusFilter;
            const matchesPlan = planFilter === "all" || item.plan === planFilter;

            return matchesSearch && matchesStatus && matchesPlan;
        });

        return result.sort((a, b) => {
            const valA = a[sortField];
            const valB = b[sortField];
            if (sortDirection === "asc") return valA > valB ? 1 : -1;
            return valA < valB ? 1 : -1;
        });
    }, [initialData, search, statusFilter, planFilter, sortField, sortDirection]);

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("desc");
        }
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Advanced Filters */}
            <div className="flex flex-col lg:flex-row items-center gap-6 bg-white/5 p-6 rounded-[2.5rem] border border-white/10 backdrop-blur-3xl shadow-3xl">
                <div className="flex-1 w-full relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-red-500 transition-colors" />
                    <Input 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher par restaurant, slug ou propriétaire..." 
                        className="pl-16 h-16 bg-black/40 border-white/5 rounded-3xl font-medium text-sm text-white placeholder:text-white/10 focus:border-red-600 transition-all shadow-inner"
                    />
                </div>
                
                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-black/40 border-white/5 text-white rounded-2xl h-16 px-6 font-bold text-[10px] uppercase tracking-widest outline-none focus:ring-2 focus:ring-red-600 cursor-pointer transition-all"
                    >
                        <option value="all">Tous les Statuts</option>
                        <option value="active">Actifs</option>
                        <option value="pending">En attente</option>
                        <option value="suspended">Suspendus</option>
                    </select>

                    <select 
                        value={planFilter}
                        onChange={(e) => setPlanFilter(e.target.value)}
                        className="bg-black/40 border-white/5 text-white rounded-2xl h-16 px-6 font-bold text-[10px] uppercase tracking-widest outline-none focus:ring-2 focus:ring-red-600 cursor-pointer transition-all"
                    >
                        <option value="all">Tous les Plans</option>
                        <option value="pro">Forfait PRO</option>
                        <option value="solo">Plan Solo</option>
                    </select>

                    <div className="flex items-center bg-black/40 p-2 rounded-2xl border border-white/5">
                        <Button 
                            onClick={() => setView("grid")}
                            variant="ghost" 
                            className={cn(
                                "h-12 w-12 p-0 rounded-xl transition-all",
                                view === "grid" ? "bg-red-600 text-white shadow-lg" : "text-white/20 hover:text-white"
                            )}
                        >
                            <LayoutGrid className="h-5 w-5" />
                        </Button>
                        <Button 
                            onClick={() => setView("table")}
                            variant="ghost" 
                            className={cn(
                                "h-12 w-12 p-0 rounded-xl transition-all",
                                view === "table" ? "bg-red-600 text-white shadow-lg" : "text-white/20 hover:text-white"
                            )}
                        >
                            <List className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* List Content */}
            {filteredData.length === 0 ? (
                <div className="py-32 flex flex-col items-center justify-center bg-white/5 rounded-[4rem] border-2 border-dashed border-white/10">
                    <SearchX className="h-20 w-20 text-white/5 mb-6" />
                    <p className="text-xl font-bold text-white/20 italic">Aucun résultat ne correspond à vos filtres</p>
                    <Button onClick={() => {setSearch(""); setStatusFilter("all"); setPlanFilter("all")}} variant="link" className="text-red-500 mt-4 font-black uppercase text-[10px] tracking-widest">Réinitialiser les filtres</Button>
                </div>
            ) : view === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
                    {filteredData.map((restaurant) => (
                        <Card key={restaurant.id} className="group overflow-hidden rounded-[3rem] border-white/10 shadow-3xl hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] transition-all duration-500 bg-black/40 backdrop-blur-xl hover:bg-black/60">
                            <CardContent className="p-0">
                                {/* Top Header */}
                                <div className="p-8 pb-6 space-y-6">
                                    <div className="flex items-start justify-between">
                                        <div className="h-20 w-20 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl group-hover:rotate-3 transition-all duration-500">
                                            <Store className="h-10 w-10 text-white/10 group-hover:text-red-600 transition-colors" />
                                        </div>
                                        <div className="flex flex-col items-end gap-3">
                                            <Badge className={cn(
                                                "font-bold text-[8px] py-1.5 px-3 rounded-xl border border-transparent",
                                                restaurant.plan === 'pro' 
                                                    ? "bg-red-600 text-white shadow-lg shadow-red-600/20" 
                                                    : "bg-white/5 text-white/40 border-white/10"
                                            )}>
                                                {restaurant.plan === 'pro' ? 'Forfait PRO' : 'Plan Solo'}
                                            </Badge>
                                            <div className={cn(
                                                "h-1.5 w-1.5 rounded-full",
                                                restaurant.subscription_status === 'active' ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" : "bg-red-600 shadow-[0_0_10px_#dc2626]"
                                            )} />
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-2xl font-bold italic text-white tracking-tight truncate">{restaurant.name}</h3>
                                        <div className="flex items-center gap-3 mt-4">
                                            <div className="flex items-center gap-2 text-[10px] font-medium text-white/20">
                                                <Users className="h-3.5 w-3.5 text-red-600" /> {restaurant.owner_name}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Stats Plate */}
                                <div className="mx-8 grid grid-cols-3 gap-1 p-1 bg-white/5 rounded-2xl border border-white/5 mb-8">
                                    <div className="flex flex-col items-center py-4 bg-black/20 rounded-xl">
                                        <ShoppingBag className="h-3.5 w-3.5 text-white/20 mb-2" />
                                        <p className="text-sm font-black text-white italic">{restaurant.total_orders}</p>
                                        <p className="text-[8px] font-medium text-white/10 uppercase tracking-widest mt-1">Ventes</p>
                                    </div>
                                    <div className="flex flex-col items-center py-4 bg-black/20 rounded-xl">
                                        <UtensilsCrossed className="h-3.5 w-3.5 text-white/20 mb-2" />
                                        <p className="text-sm font-black text-white italic">{restaurant.dish_count}</p>
                                        <p className="text-[8px] font-medium text-white/10 uppercase tracking-widest mt-1">Plats</p>
                                    </div>
                                    <div className="flex flex-col items-center py-4 bg-black/20 rounded-xl">
                                        <QrCode className="h-3.5 w-3.5 text-white/20 mb-2" />
                                        <p className="text-sm font-black text-white italic">{restaurant.qr_code_count}</p>
                                        <p className="text-[8px] font-medium text-white/10 uppercase tracking-widest mt-1">QR Tags</p>
                                    </div>
                                </div>

                                {/* Financial & Date Plate */}
                                <div className="p-8 pt-0 space-y-4">
                                    <div className="flex items-center justify-between p-5 rounded-[2rem] bg-red-600/5 border border-red-600/10 group-hover:bg-red-600/10 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/20">
                                                <TrendingUp className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-red-600 uppercase tracking-widest">Revenus Totaux</p>
                                                <p className="text-lg font-black text-white italic tracking-tighter">
                                                    {Number(restaurant.total_revenue).toLocaleString()} <span className="text-xs text-white/40">F</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6 pt-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-white/40 uppercase tracking-widest italic">
                                                <Calendar className="h-4 w-4 text-red-600" /> Début :
                                            </div>
                                            <span className="text-[11px] font-black text-white tracking-widest italic">
                                                {restaurant.subscription_started_at ? new Date(restaurant.subscription_started_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-white/40 uppercase tracking-widest italic">
                                                <Clock className="h-4 w-4 text-red-600" /> Fin :
                                            </div>
                                            <span className="text-[11px] font-black text-white tracking-widest italic flex items-center gap-2">
                                                {restaurant.subscription_expires_at ? new Date(restaurant.subscription_expires_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : 'INDÉFINIE'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Footer */}
                                <div className="p-6 bg-white/[0.03] border-t border-white/5 flex items-center gap-3">
                                    <Button asChild className="flex-1 rounded-2xl bg-white text-black border-none font-bold text-[10px] tracking-wide h-12 hover:bg-red-600 hover:text-white transition-all shadow-xl shadow-black/20">
                                        <Link href={`/admin/moderation?restaurantId=${restaurant.id}`}>
                                            Détail CRM
                                        </Link>
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-12 w-12 rounded-2xl border border-white/10 text-white/40 hover:text-white hover:bg-white/5">
                                                <MoreVertical className="h-5 w-5" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56 bg-black border-white/10 rounded-2xl p-2 text-white">
                                            <DropdownMenuItem className="rounded-xl gap-3 focus:bg-white/10 focus:text-white">
                                                <ArrowUpRight className="h-4 w-4 text-red-600" /> Ouvrir Boutique
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="rounded-xl gap-3 focus:bg-white/10 focus:text-white text-emerald-500">
                                                <BadgeCheck className="h-4 w-4" /> Passer en PRO
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="rounded-xl gap-3 focus:bg-white/10 focus:text-red-500 text-red-500">
                                                <Ban className="h-4 w-4" /> Suspendre
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                /* Advanced Table View */
                <div className="bg-white/5 rounded-[3rem] border border-white/10 overflow-hidden shadow-3xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-black/40 border-b border-white/5">
                                <tr>
                                    <th className="p-8 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Restaurant</th>
                                    <th onClick={() => handleSort("owner_name")} className="p-8 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] cursor-pointer hover:text-white transition-colors">
                                        Propriétaire <ArrowUpDown className="h-3 w-3 inline ml-2" />
                                    </th>
                                    <th onClick={() => handleSort("plan")} className="p-8 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] cursor-pointer hover:text-white transition-colors">
                                        Plan <ArrowUpDown className="h-3 w-3 inline ml-2" />
                                    </th>
                                    <th className="p-8 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">CA Global</th>
                                    <th onClick={() => handleSort("subscription_expires_at")} className="p-8 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] cursor-pointer hover:text-white transition-colors">
                                        Échéance <ArrowUpDown className="h-3 w-3 inline ml-2" />
                                    </th>
                                    <th className="p-8 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredData.map((restaurant) => (
                                    <tr key={restaurant.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="p-8">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 group-hover:text-red-600 transition-colors">
                                                    <Store className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white italic">{restaurant.name}</p>
                                                    <p className="text-[10px] text-white/20 mt-1 uppercase tracking-widest">{restaurant.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <p className="text-xs font-semibold text-white tracking-tight">{restaurant.owner_name}</p>
                                            <p className="text-[10px] text-emerald-500 font-bold mt-1 uppercase tracking-widest italic">{restaurant.owner_email}</p>
                                        </td>
                                        <td className="p-8">
                                            <Badge className={cn(
                                                "font-black text-[9px] py-1 px-3 rounded-xl border border-transparent italic tracking-widest",
                                                restaurant.plan === 'pro' 
                                                    ? "bg-red-600 text-white" 
                                                    : "bg-white/5 text-white/40 border-white/10"
                                            )}>
                                                {restaurant.plan === 'pro' ? 'PRO' : 'SOLO'}
                                            </Badge>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-white italic tracking-tighter">
                                                    {Number(restaurant.total_revenue).toLocaleString()} <span className="text-[10px] text-red-600 font-bold">F</span>
                                                </span>
                                                <span className="text-[9px] text-white/20 font-bold uppercase tracking-widest mt-1">
                                                    {restaurant.total_orders} commandes
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex items-center gap-3">
                                                <p className="text-[11px] font-black text-white tracking-widest italic">
                                                    {restaurant.subscription_expires_at ? new Date(restaurant.subscription_expires_at).toLocaleDateString() : '—'}
                                                </p>
                                                <div className={cn(
                                                    "h-2 w-2 rounded-full",
                                                    restaurant.subscription_status === 'active' ? "bg-emerald-500" : "bg-red-600"
                                                )} />
                                            </div>
                                        </td>
                                        <td className="p-8 text-right">
                                            <Button asChild variant="ghost" className="h-10 w-10 p-0 rounded-xl text-white/20 hover:text-white hover:bg-white/5">
                                                <Link href={`/admin/moderation?restaurantId=${restaurant.id}`}>
                                                    <ExternalLink className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

