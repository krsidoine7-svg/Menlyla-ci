'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
    CreditCard,
    Settings,
    User,
    Store,
    ShieldAlert,
    BarChart3,
    Search,
    TrendingUp
} from 'lucide-react'

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from '@/components/ui/command'

export function CommandPalette() {
    const [open, setOpen] = React.useState(false)
    const router = useRouter()

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false)
        command()
    }, [])

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-500 transition-all border-none bg-slate-800/50 hover:bg-slate-800 hover:text-white rounded-xl focus:outline-none w-full shadow-inner"
            >
                <Search className="h-4 w-4 text-slate-400" />
                <span>Recherche globale...</span>
                <kbd className="hidden lg:inline-flex items-center gap-1 rounded bg-slate-900 border border-slate-700 px-1.5 font-mono text-[10px] font-black text-slate-400 ml-auto">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Rechercher une page, un utilisateur ou une action..." />
                <CommandList>
                    <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
                    <CommandGroup heading="Navigation Admin">
                        <CommandItem onSelect={() => runCommand(() => router.push('/admin'))}>
                            <BarChart3 className="mr-2 h-4 w-4" />
                            <span>Vue d'ensemble</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/admin/users'))}>
                            <User className="mr-2 h-4 w-4" />
                            <span>Gérer les Utilisateurs</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/admin/moderation'))}>
                            <ShieldAlert className="mr-2 h-4 w-4" />
                            <span>Espace Modération</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/admin/stats'))}>
                            <TrendingUp className="mr-2 h-4 w-4" />
                            <span>Statistiques Globales</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/admin/payments'))}>
                            <CreditCard className="mr-2 h-4 w-4" />
                            <span>Finances & SaaS</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Sécurité & Configuration">
                        <CommandItem onSelect={() => runCommand(() => router.push('/admin/compteAdmin'))}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Gérer l'équipe Admin</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/admin/settings'))}>
                            <Settings className="mr-2 h-4 w-4 text-indigo-500" />
                            <span className="text-indigo-600 font-bold">Paramètres du Système</span>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    )
}
