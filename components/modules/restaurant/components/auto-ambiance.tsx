'use client'

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function AutoAmbiance() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Smooth transition effect for manual toggle
    useEffect(() => {
        const style = document.createElement('style')
        style.innerHTML = `
            body, .bg-background, .bg-card, .text-foreground {
                transition: background-color 0.5s ease, color 0.5s ease, border-color 0.5s ease;
            }
        `
        document.head.appendChild(style)
        return () => {
            document.head.removeChild(style)
        }
    }, [])

    if (!mounted) return null

    return (
        <div className="fixed bottom-6 left-6 z-40 animate-in fade-in zoom-in duration-500">
            <Button
                variant="outline"
                size="icon"
                className={cn(
                    "h-12 w-12 rounded-full shadow-2xl backdrop-blur-xl border transition-all duration-300 hover:scale-110",
                    theme === 'dark'
                        ? "bg-slate-900/80 border-slate-700 text-yellow-400 hover:bg-slate-800"
                        : "bg-white/80 border-white/40 text-orange-500 hover:bg-white"
                )}
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
                {theme === 'dark' ? (
                    <Moon className="h-6 w-6 fill-current" />
                ) : (
                    <Sun className="h-6 w-6 fill-current" />
                )}
                <span className="sr-only">Mode Ambiance</span>
            </Button>
        </div>
    )
}
