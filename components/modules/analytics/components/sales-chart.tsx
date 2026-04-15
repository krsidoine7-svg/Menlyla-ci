'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

type Props = {
    data: { name: string; total: number }[]
    currency: string
}

export function SalesChart({ data, currency }: Props) {
    if (!data || data.length === 0) {
        return <div className="flex h-[350px] items-center justify-center text-muted-foreground">Aucune donnée sur cette période</div>
    }

    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.4}/>
                    </linearGradient>
                </defs>
                <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                />
                <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                    tickMargin={10}
                />
                <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                    labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}
                    formatter={(value: any) => [`${value} ${currency}`, <span className="text-emerald-600 font-bold">Revenu Brillant</span>]}
                />
                <Bar
                    dataKey="total"
                    fill="url(#colorRevenue)"
                    radius={[6, 6, 0, 0]}
                    barSize={40}
                    animationDuration={1500}
                />
            </BarChart>
        </ResponsiveContainer>
    )
}
