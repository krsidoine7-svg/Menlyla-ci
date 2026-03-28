'use client'

import { useState } from 'react'
import { Bell, Hand, Receipt, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/store/cart'
import { callWaiter } from '../actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function WaiterFAB({ restaurantId }: { restaurantId: string }) {
    const [isLoading, setIsLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const tableId = useCartStore((state) => state.tableId)

    const handleCall = async (type: 'waiter' | 'bill') => {
        if (!tableId) {
            toast.error("Veuillez scanner le QR code de votre table pour appeler un serveur.")
            return
        }

        setIsLoading(true)
        const result = await callWaiter(restaurantId, tableId, type)
        setIsLoading(false)
        setIsOpen(false)

        if (result.success) {
            toast.success(
                type === 'bill'
                    ? "Demande d'addition envoyée ! Le serveur arrive."
                    : "Appel envoyé ! Un serveur va s'occuper de vous.",
                { icon: '🔔' }
            )
        } else {
            toast.error("Erreur lors de l'appel. Veuillez réessayer.")
        }
    }

    // Don't show if no tableId? Or show but inform? 
    // Usually, better to show so they know the feature exists.

    return (
        <div className="fixed bottom-48 left-0 right-0 z-40 md:max-w-[430px] md:mx-auto pointer-events-none h-0">
            <div className="absolute right-4 bottom-0 pointer-events-auto">
                <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                    <DropdownMenuTrigger asChild>
                        <Button
                            size="icon"
                            className={cn(
                                "h-14 w-14 rounded-full shadow-2xl transition-all duration-300 active:scale-90",
                                isOpen ? "bg-slate-900 rotate-90" : "bg-orange-600 hover:bg-orange-700"
                            )}
                        >
                            {isLoading ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                            ) : isOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Bell className="h-6 w-6 animate-bounce" />
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="mb-4 p-2 rounded-[2rem] w-64 shadow-2xl border-none bg-white/90 backdrop-blur-xl">
                        <div className="px-4 py-3 mb-2 border-b border-slate-100">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Service à table</p>
                            <p className="text-sm font-bold text-slate-800">Besoin d'aide ?</p>
                        </div>

                        <DropdownMenuItem
                            onClick={() => handleCall('waiter')}
                            className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer hover:bg-orange-50 focus:bg-orange-100 transition-colors group"
                        >
                            <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 transition-transform group-hover:scale-110">
                                <Hand className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-black text-xs uppercase tracking-tight">Appeler un serveur</span>
                                <span className="text-[10px] text-slate-500 font-medium">Pour une commande ou question</span>
                            </div>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onClick={() => handleCall('bill')}
                            className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer hover:bg-blue-50 focus:bg-blue-100 transition-colors group mt-1"
                        >
                            <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 transition-transform group-hover:scale-110">
                                <Receipt className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-black text-xs uppercase tracking-tight">Demander l'addition</span>
                                <span className="text-[10px] text-slate-500 font-medium">Préparez votre moyen de paiement</span>
                            </div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}
