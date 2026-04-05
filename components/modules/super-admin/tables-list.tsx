'use client'

import { useState, useMemo } from 'react'
import { 
    Search, 
    QrCode, 
    Store,
    Users,
    ChevronRight,
    SearchX,
    Filter,
    ArrowUpDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface TablesListProps {
    initialTables: any[]
}

export function TablesList({ initialTables }: TablesListProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [minCapacity, setMinCapacity] = useState<number>(0)
    const [hasZoneOnly, setHasZoneOnly] = useState(false)
    const [sortBy, setSortBy] = useState<'date' | 'capacity' | 'name'>('date')

    const filteredTables = useMemo(() => {
        let result = [...initialTables]

        // Search Filter
        if (searchTerm) {
            const lowSearch = searchTerm.toLowerCase()
            result = result.filter(table => 
                table.name?.toLowerCase().includes(lowSearch) || 
                table.restaurants?.name?.toLowerCase().includes(lowSearch)
            )
        }

        // Capacity Filter
        if (minCapacity > 0) {
            result = result.filter(table => table.capacity >= minCapacity)
        }

        // Zone Filter
        if (hasZoneOnly) {
            result = result.filter(table => table.zone_id !== null)
        }

        // Sorting
        result.sort((a, b) => {
            if (sortBy === 'capacity') return b.capacity - a.capacity
            if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '')
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })

        return result
    }, [initialTables, searchTerm, minCapacity, hasZoneOnly, sortBy])

    return (
        <div className="space-y-8">
            {/* Controls Bar */}
            <div className="flex flex-col xl:flex-row gap-6">
                <div className="flex-1 relative group">
                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                        <Search className={cn(
                            "h-5 w-5 transition-colors",
                            searchTerm ? "text-orange-500" : "text-slate-400"
                        )} />
                    </div>
                    <Input 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Rechercher une table, un restaurant..." 
                        className="pl-16 h-16 bg-white border-slate-200 rounded-[2rem] font-bold text-slate-700 focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all shadow-sm"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-1">
                        {[0, 2, 4, 6].map((cap) => (
                            <Button
                                key={cap}
                                variant={minCapacity === cap ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setMinCapacity(cap)}
                                className={cn(
                                    "rounded-xl font-black text-[10px] uppercase tracking-widest px-4",
                                    minCapacity === cap ? "bg-orange-600 text-white" : "text-slate-500 hovr:bg-slate-50"
                                )}
                            >
                                {cap === 0 ? 'Toutes' : `${cap}+ pers`}
                            </Button>
                        ))}
                    </div>

                    <Button
                        variant={hasZoneOnly ? 'default' : 'outline'}
                        onClick={() => setHasZoneOnly(!hasZoneOnly)}
                        className={cn(
                            "h-12 border-slate-100 rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 shadow-sm",
                            hasZoneOnly ? "bg-slate-900 text-white" : "bg-white text-slate-600"
                        )}
                    >
                        <Filter className={cn("h-3.5 w-3.5", hasZoneOnly ? "text-orange-400" : "text-slate-400")} />
                        Zones Uniquement
                    </Button>

                    <div className="h-12 w-12 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-xl shadow-orange-600/20">
                        <Badge variant="outline" className="border-none text-white font-black">{filteredTables.length}</Badge>
                    </div>
                </div>
            </div>

            {/* Grid display with AnimatePresence */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredTables.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200"
                        >
                            <SearchX className="h-16 w-16 text-slate-200 mb-4" />
                            <p className="text-xl font-black text-slate-300 uppercase italic">Aucune table ne correspond</p>
                            <Button variant="link" onClick={() => { setSearchTerm(''); setMinCapacity(0); setHasZoneOnly(false); }} className="text-orange-500 font-bold uppercase text-[10px] tracking-widest mt-4">Réinitialiser les filtres</Button>
                        </motion.div>
                    ) : (
                        filteredTables.map((table: any, i) => (
                            <motion.div
                                key={table.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: Math.min(i * 0.05, 0.5) }}
                            >
                                <Card className="group relative h-full overflow-hidden border-none shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 rounded-[2.5rem] bg-white">
                                    <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all">
                                        <div className="h-12 w-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-xl shadow-orange-600/30">
                                            <ChevronRight className="h-6 w-6" />
                                        </div>
                                    </div>
                                    
                                    <CardHeader className="p-8 pb-4">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="h-8 w-8 rounded-xl bg-orange-50 flex items-center justify-center">
                                                <Store className="h-4 w-4 text-orange-500" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest truncate max-w-[150px] italic">
                                                {table.restaurants?.name || 'Restaurant inconnu'}
                                            </span>
                                        </div>
                                        <CardTitle className="text-3xl font-black italic text-slate-900 group-hover:text-orange-600 transition-colors capitalize leading-none mb-2">
                                            {table.name}
                                        </CardTitle>
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Zone: {table.zone_id ? 'Secteur Alpha' : 'Hors Zone'}</p>
                                    </CardHeader>
                                    
                                    <CardContent className="p-8 pt-4 space-y-6">
                                        <div className="flex items-center justify-between bg-slate-50/50 p-4 rounded-2xl border border-slate-100 group-hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-3 text-slate-600 font-black text-sm italic">
                                                <Users className="h-5 w-5 text-orange-500" />
                                                {table.capacity} COUVERTS
                                            </div>
                                            <QrCode className="h-5 w-5 text-slate-200 group-hover:text-orange-300 transition-colors" />
                                        </div>

                                        <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                            <div className="text-[10px] font-mono font-black text-slate-200 uppercase tracking-tighter">
                                                UID: {table.id.split('-')[0].toUpperCase()}
                                            </div>
                                            <Badge className="bg-slate-900 text-white font-black text-[8px] px-3 py-1 italic uppercase rounded-lg">
                                                {new Date(table.created_at).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
