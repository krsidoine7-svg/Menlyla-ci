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
            <BarChart data={data}>
                <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value} ${currency}`}
                />
                <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [`${value} ${currency}`, 'Revenu'] as [any, any]}
                />
                <Bar
                    dataKey="total"
                    fill="#f97316" // Orange-500
                    radius={[4, 4, 0, 0]}
                />
            </BarChart>
        </ResponsiveContainer>
    )
}
