"use client";

import { useState, useMemo, useEffect } from "react";
import { 
    TrendingUp, 
    TrendingDown, 
    Users, 
    Store, 
    CreditCard, 
    DollarSign,
    PieChart as PieChartIcon,
    BarChart3,
    LineChart as LineChartIcon,
    Calendar,
    Target,
    Activity,
    Search,
    ChevronRight,
    Download,
    BadgeCheck,
    Printer,
    Sparkles
} from "lucide-react";
import { 
    LineChart, 
    Line, 
    AreaChart, 
    Area, 
    BarChart, 
    Bar, 
    PieChart, 
    Pie, 
    Cell, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef'];

interface AnalyticsDashboardProps {
    restaurants: any[];
    payments: any[];
    totalUsers: number;
}

export function AnalyticsDashboard({ restaurants, payments, totalUsers }: AnalyticsDashboardProps) {
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState("saas");
    const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        setMounted(true);
    }, []);

    // --- SaaS Data Processing ---
    const saasStats = useMemo(() => {
        const totalRevenue = payments.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
        const activeSubscribers = restaurants.filter(r => r.subscription_status === 'active').length;
        const proUsers = restaurants.filter(r => r.plan === 'pro').length;
        const estimatedCosts = (restaurants.length * 1500) + 50000;
        const roi = totalRevenue > 0 ? ((totalRevenue - estimatedCosts) / estimatedCosts) * 100 : 0;
        return { totalRevenue, activeSubscribers, proUsers, roi, estimatedCosts };
    }, [restaurants, payments]);

    const revenueByMonth = useMemo(() => {
        const months: any = {};
        payments.forEach(p => {
            const m = new Date(p.created_at).toLocaleString('fr-FR', { month: 'short' });
            months[m] = (months[m] || 0) + Number(p.amount);
        });
        return Object.entries(months).map(([name, value]) => ({ name, value }));
    }, [payments]);

    const planDistribution = useMemo(() => {
        const pro = restaurants.filter(r => r.plan === 'pro').length;
        const solo = restaurants.length - pro;
        return [
            { name: 'Forfait PRO', value: pro },
            { name: 'Plan Solo', value: solo },
        ];
    }, [restaurants]);

    // --- Per-Restaurant Processing ---
    const restaurantData = useMemo(() => {
        if (!selectedRestaurant) return null;
        const r = restaurants.find(res => res.id === selectedRestaurant);
        if (!r) return null;

        const rPayments = payments.filter(p => p.restaurant_id === selectedRestaurant);
        const totalSales = rPayments.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
        const subCost = r.plan === 'pro' ? 25000 : 0;
        const roi = subCost > 0 ? ((totalSales - subCost) / subCost) * 100 : 100;

        const salesOverview = revenueByMonth.map(m => ({
            name: m.name,
            sales: rPayments.filter(p => new Date(p.created_at).toLocaleString('fr-FR', { month: 'short' }) === m.name)
                            .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)
        }));

        return { r, totalSales, roi, salesOverview, subCost };
    }, [selectedRestaurant, restaurants, payments, revenueByMonth]);

    const filteredRestaurants = restaurants.filter(r => 
        r.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!mounted) return null;

    return (
        <div className="space-y-12">
            <style jsx global>{`
                @media print {
                    body { background: white !important; color: black !important; }
                    .print\\:hidden, .TabsList, .lg\\:w-80, button, input { display: none !important; }
                    .bg-white\\/5, .bg-black\\/40 { background: white !important; border: 1px solid #eee !important; color: black !important; }
                    h1, h2, h3, h4, p, span { color: black !important; }
                    .shadow-3xl { box-shadow: none !important; }
                    .rounded-\\[4rem\\], .rounded-\\[3rem\\] { border-radius: 20px !important; border: 1px solid #eee !important; }
                    .max-h-\\[400px\\] { max-height: none !important; overflow: visible !important; }
                    .flex-1 { width: 100% !important; flex: none !important; }
                    .grid { display: block !important; }
                }
            `}</style>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                    <TabsList className="bg-white/5 p-1.5 h-16 rounded-[2rem] border border-white/10 gap-2 w-full lg:w-auto backdrop-blur-md">
                        <TabsTrigger value="saas" className="rounded-2xl font-black text-[10px] uppercase tracking-widest px-10 data-[state=active]:bg-red-600 data-[state=active]:text-white transition-all h-full gap-2 relative">
                            <Activity className="h-4 w-4" /> Plateforme SaaS
                        </TabsTrigger>
                        <TabsTrigger value="restaurants" className="rounded-2xl font-black text-[10px] uppercase tracking-widest px-10 data-[state=active]:bg-red-600 data-[state=active]:text-white transition-all h-full gap-2">
                            <Store className="h-4 w-4" /> Par Restaurant
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-4 print:hidden">
                        <Badge variant="outline" className="h-10 px-4 rounded-xl border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/40 italic">
                            Mise à jour: {mounted ? new Date().toLocaleTimeString() : "--:--"}
                        </Badge>
                        <Button 
                            onClick={() => window.print()}
                            className="bg-red-600 hover:bg-red-700 text-white font-black text-[9px] uppercase tracking-widest h-10 px-6 rounded-xl shadow-lg shadow-red-600/20 gap-2 active:scale-95 transition-all"
                        >
                            <Printer className="h-3 w-3" /> Exporter PDF
                        </Button>
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    {activeTab === "saas" ? (
                        <motion.div 
                            key="saas"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-8"
                        >
                            {/* SaaS KPIs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { label: "MRR (Estimation)", value: `${(saasStats.totalRevenue).toLocaleString()} F`, icon: CreditCard, color: "bg-indigo-600", trend: "+12.4%", sub: "Revenue mensuel estimé" },
                                    { label: "Utilisateurs Plateforme", value: totalUsers, icon: Users, color: "bg-white/5", trend: "En hausse", sub: "Audience globale" },
                                    { label: "ROI Global", value: `${saasStats.roi.toFixed(1)}%`, icon: Target, color: "bg-white/5", trend: "Rentable", sub: "Sur investissement" },
                                    { label: "Partenaires PRO", value: saasStats.proUsers, icon: BadgeCheck, color: "bg-white/5", trend: "Premium", sub: "Restaurants de luxe" }
                                ].map((kpi, i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                        className={cn("p-8 rounded-[3rem] border border-white/10 shadow-3xl relative overflow-hidden group hover:border-white/20 transition-all", kpi.color)}
                                    >
                                        <div className="relative z-10 space-y-4">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 italic">{kpi.label}</p>
                                            <h3 className="text-4xl font-black italic text-white leading-none tracking-tighter">{kpi.value}</h3>
                                            <div className="flex items-center gap-2 text-white/60 font-bold text-[10px] uppercase tracking-widest">
                                                <kpi.icon className="h-3.5 w-3.5 text-red-600" /> {kpi.trend}
                                            </div>
                                        </div>
                                        <kpi.icon className="absolute -right-4 -bottom-4 h-24 w-24 text-white/5 rotate-12 group-hover:scale-110 group-hover:rotate-0 transition-transform duration-700" />
                                    </motion.div>
                                ))}
                            </div>

                            {/* SaaS Charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <Card className="lg:col-span-2 bg-black/40 backdrop-blur-3xl border-white/10 rounded-[3rem] overflow-hidden shadow-3xl hover:border-white/20 transition-colors">
                                    <CardHeader className="p-10 pb-2">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-2">
                                                <CardTitle className="text-2xl font-black italic text-white tracking-tight uppercase flex items-center gap-3">
                                                    <LineChartIcon className="h-6 w-6 text-red-600" /> Flux de Revenus Mensuels
                                                </CardTitle>
                                                <CardDescription className="text-white/20 text-xs font-medium">Analyse comparative des revenus sur l'année fiscale en cours.</CardDescription>
                                            </div>
                                            <div className="flex gap-2">
                                                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/10 font-black text-[8px] px-3 py-1 italic tracking-widest">EN LIGNE</Badge>
                                                <Badge className="bg-red-600/10 text-red-600 border-red-600/10 font-black text-[8px] px-3 py-1 italic tracking-widest uppercase">Live</Badge>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-10 pt-10 h-[400px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={revenueByMonth}>
                                                <defs>
                                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#ffffff20', fontSize: 10, fontWeight: 'bold'}} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#ffffff20', fontSize: 10, fontWeight: 'bold'}} dx={-10} tickFormatter={(val) => `${val/1000}k`} />
                                                <Tooltip 
                                                    cursor={{ stroke: '#ef4444', strokeWidth: 1 }}
                                                    contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '15px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
                                                    labelStyle={{ color: '#ffffff40', fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase', marginBottom: '8px' }}
                                                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'black', fontStyle: 'italic' }}
                                                />
                                                <Area type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={5} fillOpacity={1} fill="url(#colorValue)" animationDuration={2000} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                <Card className="bg-black/40 backdrop-blur-3xl border-white/10 rounded-[3rem] overflow-hidden shadow-3xl hover:border-white/20 transition-colors">
                                    <CardHeader className="p-10 pb-2">
                                        <CardTitle className="text-xl font-black italic text-white tracking-tight uppercase text-center flex items-center justify-center gap-3">
                                            <PieChartIcon className="h-5 w-5 text-red-600" /> Répartition
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-10 flex flex-col items-center h-[400px]">
                                        <ResponsiveContainer width="100%" height="80%">
                                            <PieChart>
                                                <Pie
                                                    data={planDistribution}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={65}
                                                    outerRadius={100}
                                                    paddingAngle={8}
                                                    dataKey="value"
                                                    stroke="none"
                                                    animationBegin={500}
                                                    animationDuration={1500}
                                                >
                                                    {planDistribution.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : '#ffffff05'} />
                                                    ))}
                                                </Pie>
                                                <Tooltip contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '15px' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="space-y-4 w-full mt-6">
                                            {planDistribution.map((item, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn("h-3 w-3 rounded-full shadow-lg", i === 0 ? "bg-red-600 shadow-red-600/20" : "bg-white/10")} />
                                                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest italic">{item.name}</span>
                                                    </div>
                                                    <span className="text-sm font-black text-white italic">{((item.value / (restaurants.length || 1)) * 100).toFixed(0)}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="restaurants"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-12"
                        >
                            <div className="flex flex-col lg:flex-row items-start gap-8">
                                {/* Enhanced Sidebar List */}
                                <div className="w-full lg:w-96 space-y-6 shrink-0 h-[700px] flex flex-col">
                                    <div className="relative group">
                                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-red-600 transition-colors" />
                                        <Input 
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Trouver un partenaire..." 
                                            className="pl-16 h-18 bg-white/5 border-white/10 rounded-[2rem] text-sm font-bold text-white placeholder:text-white/10 focus-visible:ring-red-600/20 transition-all focus:bg-white/[0.08]"
                                        />
                                    </div>
                                    <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar scroll-smooth pr-1">
                                        {filteredRestaurants.map((r, i) => (
                                            <motion.button 
                                                key={r.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                onClick={() => setSelectedRestaurant(r.id)}
                                                className={cn(
                                                    "w-full p-6 h-24 rounded-[2rem] border flex items-center justify-between transition-all group relative overflow-hidden",
                                                    selectedRestaurant === r.id 
                                                        ? "bg-red-600 border-red-600 shadow-2xl shadow-red-600/30" 
                                                        : "bg-white/5 border-white/5 hover:bg-white/10 text-white/60 hover:text-white"
                                                )}
                                            >
                                                {selectedRestaurant === r.id && (
                                                    <motion.div layoutId="activeGlow" className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500" />
                                                )}
                                                <div className="relative z-10 flex items-center gap-5">
                                                    <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center font-black", selectedRestaurant === r.id ? "bg-white/20 text-white" : "bg-white/5 text-red-600")}>
                                                        {r.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="text-left space-y-1">
                                                        <span className={cn("font-black italic text-sm truncate uppercase tracking-tight block", selectedRestaurant === r.id ? "text-white" : "text-white/60")}>{r.name}</span>
                                                        <Badge variant="outline" className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-0 border-transparent", selectedRestaurant === r.id ? "bg-white/20 text-white" : "text-red-500")}>
                                                            {r.plan}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <ChevronRight className={cn("h-5 w-5 relative z-10 transition-transform", selectedRestaurant === r.id ? "text-white translate-x-1" : "text-white/5 group-hover:text-white/40")} />
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                {/* Dynamic Visual Analytics */}
                                <div className="flex-1 w-full min-h-[700px] bg-white/5 rounded-[4rem] border border-white/10 p-12 flex flex-col relative overflow-hidden">
                                    <AnimatePresence mode="wait">
                                        {!selectedRestaurant ? (
                                            <motion.div 
                                                key="empty"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="flex-1 flex flex-col items-center justify-center text-center space-y-8"
                                            >
                                                <div className="relative">
                                                    <div className="absolute inset-0 bg-red-600 rounded-full blur-[60px] opacity-20 animate-pulse" />
                                                    <div className="h-32 w-32 rounded-[3.5rem] bg-white/5 flex items-center justify-center text-white/10 border border-white/10 border-dashed relative z-10">
                                                        <Sparkles className="h-14 w-14" />
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <h3 className="text-3xl font-black italic text-white/20 uppercase tracking-tight">Vue Analytique Partenaire</h3>
                                                    <p className="text-white/10 font-medium text-sm max-w-sm mx-auto leading-relaxed">
                                                        Veuillez sélectionner un établissement dans la liste latérale pour explorer ses performances financières et son ROI.
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ) : restaurantData && (
                                            <motion.div 
                                                key={selectedRestaurant}
                                                initial={{ opacity: 0, scale: 0.98 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                 exit={{ opacity: 0, scale: 1.02 }}
                                                className="space-y-12 h-full"
                                            >
                                                {/* Header Stats */}
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-2">
                                                        <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter">{restaurantData.r.name}</h2>
                                                        <p className="text-red-500 font-black text-[10px] uppercase tracking-[0.3em] italic">Statistiques opérationnelles en temps réel</p>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                                            <span className="text-[10px] font-black uppercase text-white/20 tracking-widest">Connecté</span>
                                                        </div>
                                                        <Badge className="bg-red-600 text-white font-black text-[10px] px-4 py-2 italic tracking-widest rounded-full uppercase shadow-xl shadow-red-600/20">
                                                            Plan {restaurantData.r.plan}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                    {[
                                                        { label: "Volume de Vente", value: `${restaurantData.totalSales.toLocaleString()} F`, icon: DollarSign, color: "bg-white/5", trend: "+8% vs mois dernier" },
                                                        { label: "Indice de Rentabilité", value: `${restaurantData.roi.toFixed(0)}%`, icon: Target, color: "bg-white/5", trend: restaurantData.roi > 100 ? "Performance Élevée" : "À surveiller" },
                                                        { label: "Frais de Service", value: `${restaurantData.subCost.toLocaleString()} F`, icon: Calendar, color: "bg-white/5", trend: "Prélevé mensuellement" }
                                                    ].map((stat, i) => (
                                                        <motion.div 
                                                            key={i}
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: i * 0.1 }}
                                                            className="p-10 rounded-[3rem] bg-black/40 border border-white/5 space-y-4 hover:border-red-600/20 transition-all shadow-2xl group"
                                                        >
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/20 italic flex items-center gap-3">
                                                                <stat.icon className="h-4 w-4 text-red-600 group-hover:scale-125 transition-transform" /> {stat.label}
                                                            </p>
                                                            <h4 className="text-3xl font-black italic text-white tracking-tighter">{stat.value}</h4>
                                                            <p className="text-[9px] font-bold text-white/10 uppercase tracking-widest">{stat.trend}</p>
                                                        </motion.div>
                                                    ))}
                                                </div>

                                                {/* Bar Chart section */}
                                                <div className="flex-1 min-h-[350px] p-10 bg-black/40 rounded-[4rem] border border-white/5 relative group">
                                                    <div className="absolute top-8 left-10 flex items-center gap-3">
                                                        <BarChart3 className="h-5 w-5 text-red-600" />
                                                        <span className="text-xs font-black uppercase tracking-widest text-white/20 italic">Évolution des Commandes</span>
                                                    </div>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart data={restaurantData.salesOverview} margin={{ top: 60, right: 20, left: 20, bottom: 0 }}>
                                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#ffffff20', fontSize: 10, fontWeight: 'black'}} dy={15} />
                                                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#ffffff20', fontSize: 10, fontWeight: 'bold'}} dx={-15} />
                                                            <Tooltip 
                                                                cursor={{ fill: '#ffffff03' }}
                                                                contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '15px' }}
                                                                itemStyle={{ color: '#fff', fontWeight: 'black', fontSize: '13px', fontStyle: 'italic' }}
                                                            />
                                                            <Bar dataKey="sales" fill="#ef4444" radius={[15, 15, 15, 15]} barSize={60} animationDuration={2000} />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Tabs>
        </div>
    );
}
