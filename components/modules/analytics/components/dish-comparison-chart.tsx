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
                barGap={4}
            >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.2} />
                <XAxis type="number" hide />
                <YAxis
                    dataKey="name"
                    type="category"
                    width={110}
                    fontSize={12}
                    fontWeight={500}
                    stroke="#475569"
                    tickLine={false}
                    axisLine={false}
                />
                <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                    labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: '500' }} />
                <Bar
                    name="Commandés"
                    dataKey="ordered"
                    fill="#cbd5e1"
                    radius={[0, 4, 4, 0]}
                    barSize={12}
                    animationDuration={1500}
                />
                <Bar
                    name="Servis (ROI)"
                    dataKey="served"
                    fill="#10b981"
                    radius={[0, 4, 4, 0]}
                    barSize={12}
                    animationDuration={1500}
                />
                <Bar
                    name="Perte (Annulés)"
                    dataKey="refused"
                    fill="#ef4444"
                    radius={[0, 4, 4, 0]}
                    barSize={12}
                    animationDuration={1500}
                />
            </BarChart>
        </ResponsiveContainer>
    )
}
