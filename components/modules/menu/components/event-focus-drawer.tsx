'use client'

import * as React from 'react'
import { X, Calendar, Share2, Info, ChevronRight, ExternalLink, MapPin, Clock, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerTrigger,
} from '@/components/ui/drawer'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type Props = {
    event: any
    children: React.ReactNode
}

export function EventFocusDrawer({ event, children }: Props) {
    const [open, setOpen] = React.useState(false)
    const [liked, setLiked] = React.useState(false)

    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'À venir'
        try {
            const date = new Date(dateStr)
            if (isNaN(date.getTime())) return dateStr
            return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
        } catch {
            return dateStr
        }
    }

    return (
        <Drawer open={open} onOpenChange={setOpen} shouldScaleBackground>
            <DrawerTrigger asChild>
                {children}
            </DrawerTrigger>
            <DrawerContent className="max-h-[85vh] border-t border-white/10 bg-[#121212] md:max-w-[430px] md:mx-auto rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] z-[150] inset-x-0 bottom-0 md:bottom-auto outline-none">
                <div className="mx-auto w-full h-full flex flex-col overflow-hidden relative">
                    {/* Decorative Top Handle */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/20 rounded-full z-50" />

                    <AnimatePresence>
                        {open && (
                            <div className="mx-auto w-full h-full flex flex-col overflow-hidden">
                                {/* Header Image for Event */}
                                <div className="relative w-full aspect-[4/3] sm:aspect-video overflow-hidden shrink-0">
                                    <motion.div
                                        initial={{ scale: 1.2, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.8 }}
                                        className="w-full h-full"
                                    >
                                        <img
                                            src={event.image_url || "https://images.unsplash.com/photo-1514525253361-bee8a187499b?q=80&w=1000"}
                                            alt={event.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </motion.div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/40 to-black/60" />

                                    <div className="absolute top-6 left-6 flex items-center gap-3 z-20">
                                        <DrawerClose asChild>
                                            <Button variant="secondary" size="icon" className="rounded-xl bg-white/10 backdrop-blur-xl border border-white/10 text-white shadow-xl hover:bg-white/20 h-10 w-10">
                                                <X className="h-5 w-5" />
                                            </Button>
                                        </DrawerClose>
                                    </div>

                                    <div className="absolute top-6 right-6 flex items-center gap-2 z-20">
                                        <Button 
                                            variant="secondary" 
                                            size="icon" 
                                            onClick={() => setLiked(!liked)}
                                            className={cn(
                                                "rounded-xl backdrop-blur-xl border shadow-xl transition-all h-10 w-10 active:scale-95",
                                                liked ? "bg-orange-500/20 text-orange-500 border-orange-500/50" : "bg-white/10 text-white hover:bg-white/20 border-white/10"
                                            )}
                                        >
                                            <Heart className={cn("h-4 w-4", liked && "fill-orange-500")} />
                                        </Button>
                                        <Button 
                                            variant="secondary" 
                                            size="icon" 
                                            onClick={() => {
                                                if (navigator.share) {
                                                    navigator.share({ title: event.title, text: event.description || "Regarde cet événement génial !", url: window.location.href }).catch(() => {})
                                                }
                                            }}
                                            className="rounded-xl bg-white/10 backdrop-blur-xl border border-white/10 text-white shadow-xl hover:bg-white/20 h-10 w-10 active:scale-95 transition-transform"
                                        >
                                            <Share2 className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="absolute bottom-6 left-6 right-6 text-white z-20">
                                        <motion.div
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.3 }}
                                            className="flex gap-2 mb-3"
                                        >
                                            <Badge className="bg-orange-500 text-white border-none py-1.5 px-4 font-black text-[10px] uppercase tracking-wider rounded-lg shadow-lg shadow-orange-500/20">
                                                Événement
                                            </Badge>
                                        </motion.div>
                                        <motion.h2
                                            initial={{ y: 30, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.4 }}
                                            className="text-3xl sm:text-4xl font-black uppercase tracking-tight leading-tight"
                                        >
                                            {event.title}
                                        </motion.h2>
                                    </div>
                                </div>

                                {/* Content */}
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="flex-1 overflow-y-auto no-scrollbar px-6 sm:px-8 py-8 space-y-8 bg-[#121212]"
                                >
                                    {/* Date & Time Info */}
                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex items-center gap-3 bg-[#1A1A1A] p-4 rounded-3xl border border-white/5 flex-1 min-w-[140px] shadow-sm">
                                            <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0 border border-orange-500/20">
                                                <Calendar className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest truncate">Date</p>
                                                <p className="font-bold text-white text-sm truncate">{formatDate(event.date)}</p>
                                            </div>
                                        </div>

                                        {event.time && (
                                            <div className="flex items-center gap-3 bg-[#1A1A1A] p-4 rounded-3xl border border-white/5 flex-1 min-w-[140px] shadow-sm">
                                                <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0 border border-blue-500/20">
                                                    <Clock className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest truncate">Heure</p>
                                                    <p className="font-bold text-white text-sm truncate">{event.time}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Full Description */}
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Détails de l'offre</h4>
                                        <p className="text-slate-300 font-medium leading-relaxed text-sm sm:text-base">
                                            {event.description || "Aucune description détaillée n'est disponible pour le moment."}
                                        </p>
                                    </div>

                                    {/* Action Button if link exists */}
                                    {event.link && (
                                        <Button
                                            onClick={() => window.open(event.link, '_blank')}
                                            className="w-full h-16 rounded-[2rem] bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-widest gap-3 shadow-[0_0_20px_#ea580c30] transition-colors"
                                        >
                                            En savoir plus
                                            <ExternalLink className="h-5 w-5" />
                                        </Button>
                                    )}
                                </motion.div>

                                <div className="p-6 bg-[#121212] border-t border-white/5">
                                    <DrawerClose asChild>
                                        <Button variant="ghost" className="w-full font-black text-slate-500 hover:text-white hover:bg-white/5 uppercase tracking-widest text-[10px] h-12 rounded-2xl">
                                            Fermer
                                        </Button>
                                    </DrawerClose>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </DrawerContent>
        </Drawer>
    )
}
