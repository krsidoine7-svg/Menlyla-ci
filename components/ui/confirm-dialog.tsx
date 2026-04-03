'use client'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

type ConfirmDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: string
    confirmLabel?: string
    cancelLabel?: string
    variant?: 'destructive' | 'warning' | 'default'
    onConfirm: () => void
}

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = 'Confirmer',
    cancelLabel = 'Annuler',
    variant = 'destructive',
    onConfirm,
}: ConfirmDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="rounded-[2rem] border-none bg-[#1A1A1A] shadow-2xl max-w-sm">
                <AlertDialogHeader className="text-left">
                    <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center mb-3 text-2xl",
                        variant === 'destructive' ? 'bg-red-500/10' : variant === 'warning' ? 'bg-orange-500/10' : 'bg-blue-500/10'
                    )}>
                        {variant === 'destructive' ? '🗑️' : variant === 'warning' ? '⚡' : '✅'}
                    </div>
                    <AlertDialogTitle className="text-white font-black text-lg">
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-400 text-sm leading-relaxed">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col gap-2 sm:flex-col mt-2">
                    <AlertDialogAction
                        onClick={onConfirm}
                        className={cn(
                            "w-full h-12 rounded-2xl font-black uppercase tracking-widest text-sm transition-all active:scale-95",
                            variant === 'destructive'
                                ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                                : variant === 'warning'
                                    ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-[0_0_20px_rgba(234,88,12,0.2)]'
                                    : 'bg-green-600 hover:bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.2)]'
                        )}
                    >
                        {confirmLabel}
                    </AlertDialogAction>
                    <AlertDialogCancel className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-sm bg-white/10 border-white/10 text-white hover:bg-white/20 hover:text-white mt-0 transition-all">
                        {cancelLabel}
                    </AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
