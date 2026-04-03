'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export function CategoryNav({ categories }: { categories: any[] }) {
    const [activeId, setActiveId] = useState<string>(categories[0]?.id || '')

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                // If the section is intersecting our threshold
                if (entry.isIntersecting) {
                    const id = entry.target.id.replace('cat-', '')
                    setActiveId(id)
                }
            })
        }, {
            rootMargin: '-140px 0px -70% 0px' // Wait until the section gets close to the top
        })

        categories.forEach((cat) => {
            const el = document.getElementById(`cat-${cat.id}`)
            if (el) observer.observe(el)
        })

        return () => observer.disconnect()
    }, [categories])

    return (
        <div className="relative sticky top-[160px] z-40 bg-gradient-to-b from-[#080808]/95 to-[#080808]/80 backdrop-blur-xl border-b border-white/5 shadow-xl -mx-4 px-4 overflow-x-auto no-scrollbar py-4 mb-8">
            <div className="flex items-center gap-3 w-max">
            {categories?.map((cat) => {
                const hasEmoji = cat.name.match(/^([\p{Emoji}\p{Extended_Pictographic}])/u)
                const icon = hasEmoji ? hasEmoji[0] : null
                const label = hasEmoji ? cat.name.substring(icon!.length).trim() : cat.name
                const active = activeId === cat.id

                return (
                    <button
                        key={cat.id}
                        onClick={() => {
                            setActiveId(cat.id)
                            document.getElementById(`cat-${cat.id}`)?.scrollIntoView({ behavior: 'smooth' })
                        }}
                        className={cn(
                            "flex items-center gap-2.5 px-4 py-2 rounded-2xl transition-all duration-300 whitespace-nowrap border border-white/5",
                            active ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-[1.02]" : "bg-[#1A1A1A] text-slate-400 hover:bg-[#2A2A2A]"
                        )}
                    >
                        <div className="h-8 w-8 rounded-[0.6rem] bg-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                            {cat.icon_url ? (
                                <img src={cat.icon_url} alt={label} className="h-full w-full object-cover" />
                            ) : icon ? (
                                <span className="text-lg">{icon}</span>
                            ) : (
                                <div className="h-4 w-4 rounded bg-slate-700" />
                            )}
                        </div>
                        <span className="text-xs font-black tracking-widest uppercase">{label}</span>
                    </button>
                )
            })}
            </div>
        </div>
    )
}
