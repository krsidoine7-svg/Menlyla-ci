'use client'

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronDown, Check } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"

export function AnalyticsFilter() {
    const router = useRouter()
    const searchParams = useSearchParams()
    
    const currentRange = searchParams.get('range') || '7d'
    const queryStart = searchParams.get('start') || ''
    const queryEnd = searchParams.get('end') || ''

    const [isCustom, setIsCustom] = useState(currentRange === 'custom')
    const [localStart, setLocalStart] = useState(queryStart)
    const [localEnd, setLocalEnd] = useState(queryEnd)

    const handleSelect = (range: string) => {
        setIsCustom(range === 'custom')
        if (range !== 'custom') {
            const params = new URLSearchParams(window.location.search)
            params.set('range', range)
            params.delete('start')
            params.delete('end')
            router.push(`?${params.toString()}`)
        }
    }

    const applyCustomRange = () => {
        if (!localStart || !localEnd) return
        const params = new URLSearchParams(window.location.search)
        params.set('range', 'custom')
        params.set('start', localStart)
        params.set('end', localEnd)
        router.push(`?${params.toString()}`)
    }

    const getLabel = () => {
        if (currentRange === 'today') return "Aujourd'hui"
        if (currentRange === '30d') return "30 derniers jours"
        if (currentRange === 'year') return "Cette année"
        if (currentRange === 'custom') return "Période personnalisée"
        return "7 derniers jours"
    }

    return (
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
            {isCustom && (
                <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-right-4 duration-300">
                    <input 
                        type="date" 
                        value={localStart} 
                        onChange={e => setLocalStart(e.target.value)} 
                        className="h-11 w-32 sm:w-36 px-2 sm:px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white shadow-sm focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                    <span className="text-slate-400 font-medium text-xs">au</span>
                    <input 
                        type="date" 
                        value={localEnd} 
                        onChange={e => setLocalEnd(e.target.value)} 
                        className="h-11 w-32 sm:w-36 px-2 sm:px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white shadow-sm focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                    <Button onClick={applyCustomRange} size="icon" className="h-11 w-11 sm:w-auto rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-medium sm:px-4 shadow-sm">
                        <Check className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Appliquer</span>
                    </Button>
                </div>
            )}
            
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-11 rounded-xl bg-white border border-slate-200 px-4 gap-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        {getLabel()}
                        <ChevronDown className="h-4 w-4 text-slate-400 ml-1" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white rounded-xl border-slate-100 shadow-lg min-w-[200px]" align="end">
                    <DropdownMenuItem onClick={() => handleSelect('today')} className="rounded-lg h-10 px-3 text-sm font-medium cursor-pointer !text-slate-700 data-[highlighted]:!bg-slate-50 data-[highlighted]:!text-slate-900 border-none outline-none focus:outline-none">Aujourd'hui</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSelect('7d')} className="rounded-lg h-10 px-3 text-sm font-medium cursor-pointer !text-slate-700 data-[highlighted]:!bg-slate-50 data-[highlighted]:!text-slate-900 border-none outline-none focus:outline-none">7 derniers jours</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSelect('30d')} className="rounded-lg h-10 px-3 text-sm font-medium cursor-pointer !text-slate-700 data-[highlighted]:!bg-slate-50 data-[highlighted]:!text-slate-900 border-none outline-none focus:outline-none">30 derniers jours</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSelect('year')} className="rounded-lg h-10 px-3 text-sm font-medium cursor-pointer !text-slate-700 data-[highlighted]:!bg-slate-50 data-[highlighted]:!text-slate-900 border-none outline-none focus:outline-none">Cette année</DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-100 my-1" />
                    <DropdownMenuItem onClick={() => handleSelect('custom')} className="rounded-lg h-10 px-3 text-sm font-medium cursor-pointer !text-blue-700 data-[highlighted]:!bg-blue-50 data-[highlighted]:!text-blue-800 border-none outline-none focus:outline-none">Période personnalisée...</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
