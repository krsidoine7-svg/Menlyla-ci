'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts"

type Props = {
    data: { name: string, ordered: number, refused: number, served: number }[]
}

export function DishComparisonChart({ data }: Props) {
    if (!data || data.length === 0) {
        return <div className="flex h-[350px] items-center justify-center text-muted-foreground">Aucune donnée sur cette période</div>
    }

    // Limit to top 10 for readability
    const chartData = data.slice(0, 10)

    return (
        <ResponsiveContainer width="100%" height={400}>
            <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.3} />
                <XAxis type="number" hide />
                <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                />
                <Tooltip
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar
                    name="Commandés"
                    dataKey="ordered"
                    fill="#94a3b8"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                />
                <Bar
                    name="Servis"
                    dataKey="served"
                    fill="#22c55e"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                />
                <Bar
                    name="Refusés"
                    dataKey="refused"
                    fill="#ef4444"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                />
            </BarChart>
        </ResponsiveContainer>
    )
}
