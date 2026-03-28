
'use client'

import { useState } from 'react'
import { 
    ThumbsUp, 
    ThumbsDown, 
    MoreVertical,
    Loader2,
    CheckCircle2,
    AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { updateRestaurantStatus } from '@/app/(super-admin)/admin/actions'
import { toast } from 'sonner'

export function RestaurantModerationActions({ restaurantId, currentStatus }: { restaurantId: string, currentStatus: string }) {
    const [isLoading, setIsLoading] = useState(false)

    const handleUpdateStatus = async (status: 'active' | 'pending' | 'expired' | 'cancelled') => {
        setIsLoading(true)
        const result = await updateRestaurantStatus(restaurantId, status)
        
        if (result.success) {
            toast.success(result.message)
        } else {
            toast.error(result.error || 'Erreur lors de la mise à jour.')
        }
        setIsLoading(false)
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild disabled={isLoading}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-xl hover:bg-slate-100">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" /> : <MoreVertical className="h-4 w-4 text-slate-400" />}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-none shadow-2xl bg-white">
                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-2">Modération</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-50" />
                
                <DropdownMenuItem 
                    onClick={() => handleUpdateStatus('active')}
                    disabled={currentStatus === 'active'}
                    className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-xl font-bold group focus:bg-emerald-50 focus:text-emerald-600 transition-all"
                >
                    <ThumbsUp className="h-4 w-4 text-slate-400 group-focus:text-emerald-500" />
                    Valider le restaurant
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                    onClick={() => handleUpdateStatus('pending')}
                    disabled={currentStatus === 'pending'}
                    className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-xl font-bold group focus:bg-orange-50 focus:text-orange-600 transition-all"
                >
                    <AlertCircle className="h-4 w-4 text-slate-400 group-focus:text-orange-500" />
                    Mettre en attente
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                    onClick={() => handleUpdateStatus('cancelled')}
                    disabled={currentStatus === 'cancelled'}
                    className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-xl font-bold group focus:bg-rose-50 focus:text-rose-600 transition-all"
                >
                    <ThumbsDown className="h-4 w-4 text-slate-400 group-focus:text-rose-500" />
                    Suspendre / Rejeter
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
