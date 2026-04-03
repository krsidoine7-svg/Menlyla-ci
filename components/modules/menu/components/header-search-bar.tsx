'use client'

import { Search, X } from 'lucide-react'
import { useUIStore } from '@/lib/store/ui-store'

export function HeaderSearchBar() {
    const { activeTab, searchQuery, setSearchQuery } = useUIStore()

    // Only visible on the Home tab (activeTab === null)
    if (activeTab !== null) return null

    return (
        <div className="relative mt-3 mb-1 animate-in fade-in slide-in-from-top-2 duration-300">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
                type="text"
                id="header-search-bar"
                placeholder="Rechercher un plat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-10 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/30 transition-all"
            />
            {searchQuery && (
                <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/20 transition-all"
                >
                    <X className="h-3 w-3" />
                </button>
            )}
        </div>
    )
}
