'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

type Props = {
    data: { name: string; count: number }[]
}

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#a855f7', '#eab308']

export function TopProductsChart({ data }: Props) {
    if (!data || data.length === 0) {
        return <div className="flex h-[300px] items-center justify-center text-muted-foreground italic">Pas assez de données pour le graphique</div>
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" />
            </PieChart>
        </ResponsiveContainer>
    )
}
