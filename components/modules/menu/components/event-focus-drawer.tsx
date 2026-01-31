'use client'

import * as React from 'react'
import { X, Calendar, Share2, Info, ChevronRight, ExternalLink, MapPin, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerTrigger,
} from '@/components/ui/drawer'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'

type Props = {
    event: any
    children: React.ReactNode
}

export function EventFocusDrawer({ event, children }: Props) {
    const [open, setOpen] = React.useState(false)

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
            <DrawerContent className="max-h-[90vh] border-none bg-white md:max-w-[500px] md:mx-auto rounded-t-[3.5rem] shadow-[0_-20px_50px_-15px_rgba(0,0,0,0.3)]">
                <div className="mx-auto w-full h-full flex flex-col overflow-hidden relative">
                    {/* Decorative Top Handle */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-200/50 rounded-full z-50" />

                    <AnimatePresence>
                        {open && (
                            <div className="mx-auto w-full h-full flex flex-col overflow-hidden">
                                {/* Header Image for Event */}
                                <div className="relative w-full aspect-video overflow-hidden">
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
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                    <div className="absolute top-6 left-6 flex items-center gap-3 z-20">
                                        <DrawerClose asChild>
                                            <Button variant="secondary" size="icon" className="rounded-2xl bg-white/15 backdrop-blur-xl border border-white/20 text-white shadow-xl">
                                                <X className="h-5 w-5" />
                                            </Button>
                                        </DrawerClose>
                                    </div>

                                    <div className="absolute bottom-8 left-8 right-8 text-white z-20">
                                        <motion.div
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.3 }}
                                            className="flex gap-2 mb-3"
                                        >
                                            <Badge className="bg-orange-500 text-white border-none py-1.5 px-4 font-black text-[10px] uppercase tracking-wider rounded-xl">
                                                Événement
                                            </Badge>
                                        </motion.div>
                                        <motion.h2
                                            initial={{ y: 30, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.4 }}
                                            className="text-4xl font-black uppercase tracking-tight leading-tight"
                                        >
                                            {event.title}
                                        </motion.h2>
                                    </div>
                                </div>

                                {/* Content */}
                                <motion.div
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="flex-1 overflow-y-auto no-scrollbar px-8 py-10 space-y-8"
                                >
                                    {/* Date & Time Info */}
                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-3xl border border-slate-100 flex-1 min-w-[140px]">
                                            <div className="h-10 w-10 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
                                                <Calendar className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-slate-400">Date</p>
                                                <p className="font-bold text-slate-900">{formatDate(event.date)}</p>
                                            </div>
                                        </div>

                                        {event.time && (
                                            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-3xl border border-slate-100 flex-1 min-w-[140px]">
                                                <div className="h-10 w-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                                                    <Clock className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase text-slate-400">Heure</p>
                                                    <p className="font-bold text-slate-900">{event.time}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Full Description */}
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Détails de l'offre</h4>
                                        <p className="text-slate-600 font-medium leading-relaxed text-lg">
                                            {event.description || "Aucune description détaillée n'est disponible pour le moment."}
                                        </p>
                                    </div>

                                    {/* Action Button if link exists */}
                                    {event.link && (
                                        <Button
                                            onClick={() => window.open(event.link, '_blank')}
                                            className="w-full h-16 rounded-[2rem] bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest gap-3 shadow-xl"
                                        >
                                            En savoir plus
                                            <ExternalLink className="h-5 w-5" />
                                        </Button>
                                    )}
                                </motion.div>

                                <div className="p-8 bg-white border-t border-slate-50">
                                    <DrawerClose asChild>
                                        <Button variant="ghost" className="w-full font-black text-slate-400 uppercase tracking-widest text-[10px]">Fermer</Button>
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
