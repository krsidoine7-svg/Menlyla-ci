'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import { DashboardSidebar } from './sidebar'

export function MobileHeader({ restaurantSlug }: { restaurantSlug?: string | null }) {
    const [open, setOpen] = useState(false)

    return (
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col p-0">
                    <div className="sr-only">
                        <SheetTitle>Navigation</SheetTitle>
                        <SheetDescription>Menu de navigation pour mobile</SheetDescription>
                    </div>
                    <DashboardSidebar
                        className="w-full border-none"
                        onItemClick={() => setOpen(false)}
                        restaurantSlug={restaurantSlug}
                    />
                </SheetContent>
            </Sheet>
            <span className="font-bold">MANLY</span>
        </header>
    )
}
