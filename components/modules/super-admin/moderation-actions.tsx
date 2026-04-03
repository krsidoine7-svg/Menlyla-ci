
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
import { cn } from '@/lib/utils'
import { updateRestaurantStatus, updateRestaurantPlan, toggleRestaurantPayments } from '@/app/(super-admin)/admin/actions'
import { toast } from 'sonner'
import { 
    Zap,
    Shield,
    CreditCard
} from 'lucide-react'

export function RestaurantModerationActions({ restaurantId, currentStatus, currentPlan, currentPaymentEnabled }: { restaurantId: string, currentStatus: string, currentPlan?: string, currentPaymentEnabled?: boolean }) {
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

    const handleUpdatePlan = async (plan: 'solo' | 'pro') => {
        setIsLoading(true)
        const result = await updateRestaurantPlan(restaurantId, plan)
        
        if (result.success) {
            toast.success(result.message)
        } else {
            toast.error(result.error || 'Erreur lors de la mise à jour du forfait.')
        }
        setIsLoading(false)
    }

    const handleTogglePayments = async () => {
        setIsLoading(true)
        const next = !currentPaymentEnabled
        const result = await toggleRestaurantPayments(restaurantId, next)
        
        if (result.success) {
            toast.success(result.message)
        } else {
            toast.error(result.error || 'Erreur lors de la modification des paiements.')
        }
        setIsLoading(false)
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild disabled={isLoading}>
                <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-2xl hover:bg-white/10 border border-white/5 bg-white/5">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin text-white/40" /> : <MoreVertical className="h-4 w-4 text-white" />}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-3 rounded-[2rem] border-white/10 shadow-3xl bg-black backdrop-blur-3xl text-white">
                <DropdownMenuLabel className="text-[10px] font-medium uppercase tracking-wider text-white/20 px-4 py-3">Modération</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/5 mx-2" />
                
                <DropdownMenuItem 
                    onClick={() => handleUpdateStatus('active')}
                    disabled={currentStatus === 'active'}
                    className="flex items-center gap-4 px-4 py-3.5 cursor-pointer rounded-2xl font-medium text-xs tracking-wide group focus:bg-emerald-500/10 focus:text-emerald-500 transition-all"
                >
                    <ThumbsUp className="h-4 w-4 text-white/20 group-focus:text-emerald-500" />
                    Valider Établissement
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                    onClick={() => handleUpdateStatus('pending')}
                    disabled={currentStatus === 'pending'}
                    className="flex items-center gap-4 px-4 py-3.5 cursor-pointer rounded-2xl font-medium text-xs tracking-wide group focus:bg-orange-500/10 focus:text-orange-500 transition-all"
                >
                    <AlertCircle className="h-4 w-4 text-white/20 group-focus:text-orange-500" />
                    Mettre en attente
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                    onClick={() => handleUpdateStatus('cancelled')}
                    disabled={currentStatus === 'cancelled'}
                    className="flex items-center gap-4 px-4 py-3.5 cursor-pointer rounded-2xl font-medium text-xs tracking-wide group focus:bg-red-600/10 focus:text-red-600 transition-all"
                >
                    <ThumbsDown className="h-4 w-4 text-white/20 group-focus:text-red-500" />
                    Suspendre / Rejeter
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-white/5 mx-2" />
                <DropdownMenuLabel className="text-[10px] font-medium uppercase tracking-wider text-white/20 px-4 py-3">Forfait SaaS</DropdownMenuLabel>
                
                <DropdownMenuItem 
                    onClick={() => handleUpdatePlan('pro')}
                    disabled={currentPlan === 'pro'}
                    className="flex items-center gap-4 px-4 py-3.5 cursor-pointer rounded-2xl font-medium text-xs tracking-wide group focus:bg-red-600 focus:text-white transition-all"
                >
                    <Zap className={cn("h-4 w-4 text-white/20 group-focus:text-white", currentPlan === 'pro' && "text-red-600")} />
                    {currentPlan === 'pro' ? 'Forfait Pro Actif' : 'Passer en Pro'}
                </DropdownMenuItem>

                <DropdownMenuItem 
                    onClick={() => handleUpdatePlan('solo')}
                    disabled={currentPlan === 'solo'}
                    className="flex items-center gap-4 px-4 py-3.5 cursor-pointer rounded-2xl font-medium text-xs tracking-wide group focus:bg-white/10 focus:text-white transition-all"
                >
                    <Shield className="h-4 w-4 text-white/20 group-focus:text-white" />
                    {currentPlan === 'solo' ? 'Forfait Solo Actif' : 'Rétablir Solo'}
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-white/5 mx-2" />
                <DropdownMenuLabel className="text-[10px] font-medium uppercase tracking-wider text-white/20 px-4 py-3">Fonctionnalités</DropdownMenuLabel>
                
                <DropdownMenuItem 
                    onClick={handleTogglePayments}
                    className={cn(
                        "flex items-center gap-4 px-4 py-3.5 cursor-pointer rounded-2xl font-medium text-xs tracking-wide group transition-all",
                        currentPaymentEnabled ? "focus:bg-red-600/10 focus:text-red-600" : "focus:bg-emerald-500/10 focus:text-emerald-500"
                    )}
                >
                    <CreditCard className={cn("h-4 w-4 text-white/20", currentPaymentEnabled ? "group-focus:text-red-500" : "group-focus:text-emerald-500")} />
                    {currentPaymentEnabled ? 'Désactiver Paiements' : 'Activer Paiements'}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
