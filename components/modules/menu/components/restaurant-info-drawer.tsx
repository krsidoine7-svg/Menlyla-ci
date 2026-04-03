'use client'

import { MapPin, Clock3, Share2, Instagram, Facebook, MessageCircle, ChevronDown, CheckCircle2, Navigation } from 'lucide-react'
import {
    Drawer,
    DrawerContent,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

export function RestaurantInfoDrawer({ restaurant }: { restaurant: any }) {
    const defaultHours = restaurant.settings?.hours?.schedule || {}
    const social = restaurant.social_links || {}

    const DAYS_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const

    const formatDay = (day: string) => {
        const daysFr: Record<string, string> = {
            monday: 'Lundi', tuesday: 'Mardi', wednesday: 'Mercredi',
            thursday: 'Jeudi', friday: 'Vendredi', saturday: 'Samedi', sunday: 'Dimanche'
        }
        return daysFr[day] || day
    }

    return (
        <Drawer>
            <DrawerTrigger asChild>
                <div className="flex flex-col cursor-pointer group active:scale-95 transition-transform w-fit">
                    <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                        {restaurant.name}
                        <ChevronDown className="h-4 w-4 text-orange-500 group-hover:translate-y-0.5 transition-transform" />
                    </h1>
                </div>
            </DrawerTrigger>
            <DrawerContent className="bg-[#121212] border-t border-white/10 rounded-t-[2.5rem] mx-auto w-full max-w-md">
                <div className="p-6 pb-12 overflow-y-auto max-h-[85vh] no-scrollbar">
                    
                    {/* Header */}
                    <div className="flex gap-4 mb-8 pt-4 items-start">
                        <div className="h-16 w-16 rounded-[1.2rem] overflow-hidden bg-[#1A1A1A] border border-white/5 shadow-inner shrink-0 flex items-center justify-center">
                            {restaurant.logo_url ? (
                                <img src={restaurant.logo_url} className="h-full w-full object-cover" alt="Logo" />
                            ) : (
                                <div className="text-orange-500 font-black text-2xl">
                                    {restaurant.name?.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col flex-1">
                            <h2 className="text-xl font-black tracking-tight text-white mb-1">{restaurant.name}</h2>
                            <p className="text-xs font-medium text-slate-400 leading-snug">{restaurant.description || "L'excellence au quotidien."}</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        
                        {/* Status (Ouvert ou Fermé) - Approximated for UI */}
                        <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-3xl flex items-center gap-3">
                            <div className="flex h-3 w-3 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-orange-500">Actuellement</p>
                                <p className="text-sm font-bold text-orange-100/90 tracking-tight">Veuillez vérifier nos horaires</p>
                            </div>
                        </div>

                        {/* Emplacement */}
                        {(restaurant.address || restaurant.city) && (
                            <div className="space-y-3">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Emplacement</h3>
                                <Card className="bg-[#1A1A1A] border-white/5 rounded-3xl p-4 flex gap-4">
                                    <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                                        <MapPin className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <div className="flex flex-col pt-1 w-full">
                                        <p className="text-sm font-bold text-white leading-snug">{restaurant.address}</p>
                                        <p className="text-xs font-medium text-slate-400">{restaurant.city}</p>
                                        <button className="mt-3 bg-white/5 rounded-xl border border-white/5 w-full py-2 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-slate-300 hover:text-white hover:bg-white/10 transition-colors">
                                            <Navigation className="h-3 w-3" /> Y ALLER
                                        </button>
                                    </div>
                                </Card>
                            </div>
                        )}

                        {/* Horaires */}
                        <div className="space-y-3">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Horaires d'ouverture</h3>
                            <Card className="bg-[#1A1A1A] border-white/5 rounded-3xl p-5 space-y-3">
                                {DAYS_ORDER.map(day => {
                                    const schedule = defaultHours[day]
                                    if (!schedule) return null
                                    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
                                    const isToday = today === day
                                    
                                    return (
                                        <div key={day} className={cn(
                                            "flex items-center justify-between py-1",
                                            isToday && "text-orange-500"
                                        )}>
                                            <span className={cn(
                                                "text-xs font-bold w-24",
                                                isToday ? "text-orange-500" : "text-slate-400"
                                            )}>
                                                {formatDay(day)} {isToday && '•'}
                                            </span>
                                            <span className={cn(
                                                "text-sm font-medium",
                                                schedule.closed ? "text-slate-600 italic" : "text-white"
                                            )}>
                                                {schedule.closed ? 'Fermé' : `${schedule.open} - ${schedule.close}`}
                                            </span>
                                        </div>
                                    )
                                })}
                            </Card>
                        </div>

                        {/* Réseaux et Contacts */}
                        <div className="space-y-3 pb-8">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Contact & Réseaux</h3>
                            <div className="grid grid-cols-4 gap-3">
                                {restaurant.phone && (
                                    <a href={`tel:${restaurant.phone}`} className="aspect-square bg-[#1A1A1A] rounded-2xl border border-white/5 flex flex-col justify-center items-center gap-2 hover:bg-[#222] transition-colors">
                                        <MessageCircle className="h-5 w-5 text-white" />
                                        <span className="text-[9px] font-black uppercase text-slate-400">APPELER</span>
                                    </a>
                                )}
                                {social.whatsapp && (
                                    <a href={`https://wa.me/${social.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="aspect-square bg-green-500/10 rounded-2xl border border-green-500/20 flex flex-col justify-center items-center gap-2 hover:bg-green-500/20 transition-colors">
                                        <MessageCircle className="h-5 w-5 text-green-500" />
                                        <span className="text-[9px] font-black uppercase text-green-500/80">WHATSAPP</span>
                                    </a>
                                )}
                                {social.instagram && (
                                    <a href={`https://instagram.com/${social.instagram}`} target="_blank" rel="noreferrer" className="aspect-square bg-[#1A1A1A] rounded-2xl border border-white/5 flex flex-col justify-center items-center gap-2 hover:bg-[#222] transition-colors">
                                        <Instagram className="h-5 w-5 text-white" />
                                        <span className="text-[9px] font-black uppercase text-slate-400">INSTA</span>
                                    </a>
                                )}
                                {social.facebook && (
                                    <a href={`https://facebook.com/${social.facebook}`} target="_blank" rel="noreferrer" className="aspect-square bg-[#1A1A1A] rounded-2xl border border-white/5 flex flex-col justify-center items-center gap-2 hover:bg-[#222] transition-colors">
                                        <Facebook className="h-5 w-5 text-white" />
                                        <span className="text-[9px] font-black uppercase text-slate-400">FACEBOOK</span>
                                    </a>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    )
}
