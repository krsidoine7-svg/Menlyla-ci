'use client'

import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
} from 'recharts'
import { CreditCard, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

type RevenueEntry = { month: string; revenue: number }

function exportCSV(data: RevenueEntry[]) {
    const header = 'Mois,Revenu (XOF)\n'
    const rows = data.map(d => `${d.month},${d.revenue}`).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `menlyla_revenus_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
}

export function RevenueChart({ data }: { data: RevenueEntry[] }) {
    if (data.length === 0 || data.every(d => d.revenue === 0)) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-slate-50 border-2 border-dashed border-slate-100 rounded-3xl p-8 text-center text-slate-400 italic font-bold">
                <CreditCard className="h-10 w-10 mb-4 opacity-50" />
                En attente des premières transactions...
            </div>
        )
    }

    return (
        <div className="space-y-3 h-full flex flex-col">
            <div className="flex justify-end">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportCSV(data)}
                    className="h-8 text-[10px] font-black uppercase tracking-widest border-slate-200 text-slate-600 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 gap-2"
                >
                    <Download className="h-3 w-3" /> Exporter CSV
                </Button>
            </div>
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                            dataKey="month" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 'bold' }} 
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 'bold' }}
                            tickFormatter={(v: number) => `${v} F`}
                        />
                        <Tooltip 
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                            formatter={(value: number | undefined) => [`${(value ?? 0).toLocaleString('fr-FR')} XOF`, 'Revenu']}
                        />
                        <Bar 
                            dataKey="revenue" 
                            fill="#4f46e5" 
                            radius={[8, 8, 8, 8]}
                            barSize={40}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
