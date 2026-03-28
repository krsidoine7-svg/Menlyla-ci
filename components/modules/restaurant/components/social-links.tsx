'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    MessageCircle,
    Instagram,
    Facebook,
    Video,
    Share2,
    X,
    Heart
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Props = {
    socialLinks: Record<string, string>
    restaurantName: string
}

const PLATFORM_ICONS: Record<string, any> = {
    whatsapp: { icon: MessageCircle, color: 'bg-[#25D366]', prefix: 'https://wa.me/' },
    instagram: { icon: Instagram, color: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]', prefix: 'https://instagram.com/' },
    facebook: { icon: Facebook, color: 'bg-[#1877F2]', prefix: 'https://facebook.com/' },
    tiktok: { icon: Video, color: 'bg-[#000000]', prefix: 'https://tiktok.com/@' },
}

export function SocialLinks({ socialLinks, restaurantName }: Props) {
    const [isOpen, setIsOpen] = useState(false)

    if (!socialLinks || Object.keys(socialLinks).length === 0) return null

    return (
        <div className="fixed bottom-32 left-0 right-0 z-[40] md:max-w-[430px] md:mx-auto pointer-events-none h-0">
            <div className="absolute right-4 bottom-0 pointer-events-auto animate-in slide-in-from-right-10 fade-in duration-500">
                <DropdownMenu onOpenChange={setIsOpen}>
                    <DropdownMenuTrigger asChild>
                        <Button
                            size="icon"
                            className={cn(
                                "h-12 w-12 rounded-full shadow-2xl transition-all duration-300 border-2 border-white",
                                isOpen ? "bg-slate-900 rotate-90" : "bg-orange-600 scale-100"
                            )}
                        >
                            {isOpen ? <X className="h-6 w-6 text-white" /> : <Heart className="h-6 w-6 text-white fill-current animate-pulse" />}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px] rounded-[2rem] p-3 border-none bg-white/80 backdrop-blur-xl shadow-2xl mb-4">
                        <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b mb-2">
                            Suivez-nous !
                        </div>
                        {Object.entries(socialLinks).map(([id, username]) => {
                            const platform = PLATFORM_ICONS[id]
                            if (!platform) return null

                            return (
                                <DropdownMenuItem key={id} asChild>
                                    <a
                                        href={`${platform.prefix}${username}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 rounded-2xl hover:bg-orange-50 cursor-pointer group transition-all"
                                    >
                                        <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform", platform.color)}>
                                            <platform.icon className="h-4 w-4" />
                                        </div>
                                        <span className="font-black text-xs uppercase tracking-tight text-slate-900">{id}</span>
                                    </a>
                                </DropdownMenuItem>
                            )
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}
