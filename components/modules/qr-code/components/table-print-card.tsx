'use client'

import QRCode from 'react-qr-code'
import { QrCode as QrIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
    tableName: string
    qrUrl: string
    restaurantName?: string
    restaurantLogo?: string | null
    qrId?: string
}

export function TablePrintCard({ tableName, qrUrl, restaurantName, restaurantLogo, qrId }: Props) {
    const isLongName = tableName.length > 3
    const isVeryLongName = tableName.length > 8

    return (
        <div className="flex flex-col items-center bg-white p-6 rounded-2xl shadow-sm border-2 border-orange-100 w-full min-h-[420px] justify-between relative overflow-hidden group">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />

            <div className="text-center z-10 w-full mb-2">
                {restaurantLogo ? (
                    <img src={restaurantLogo} alt={restaurantName} className="h-10 w-auto mx-auto mb-2 object-contain" />
                ) : (
                    <div className="inline-flex items-center justify-center p-2.5 bg-orange-100 rounded-full mb-2">
                        <QrIcon className="h-5 w-5 text-orange-600" />
                    </div>
                )}
                {restaurantName && (
                    <h2 className="text-[11px] font-black text-orange-900 tracking-[0.15em] uppercase mb-1 truncate px-2 opacity-80">
                        {restaurantName}
                    </h2>
                )}
                <div className="flex flex-col items-center justify-center -space-y-1">
                    <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em]">Table</span>
                    <span className={cn(
                        "font-black text-orange-600 tabular-nums leading-none tracking-tighter truncate w-full px-1",
                        isVeryLongName ? "text-2xl" : isLongName ? "text-4xl" : "text-7xl"
                    )}>
                        {tableName}
                    </span>
                    <div className="pt-2 px-4 w-full">
                        <p className="text-[8px] font-medium text-muted-foreground/40 break-all line-clamp-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            {qrUrl}
                        </p>
                    </div>
                </div>
            </div>

            <div className="relative p-3 bg-white rounded-3xl border-2 border-dashed border-orange-100 group-hover:border-orange-200 transition-colors w-full aspect-square flex items-center justify-center overflow-hidden">
                <div className="w-full h-full flex items-center justify-center p-1 bg-white relative">
                    <QRCode
                        id={qrId}
                        value={qrUrl}
                        size={256}
                        level="H"
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        viewBox={`0 0 256 256`}
                    />
                    {restaurantLogo && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-white p-1 rounded-lg shadow-sm border border-orange-50">
                                <img
                                    src={restaurantLogo}
                                    className="h-10 w-10 object-contain rounded-md"
                                    alt="Logo overlay"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="text-center z-10 w-full mt-2">
                <p className="text-[9px] font-black text-orange-900/50 uppercase tracking-[0.2em] mb-1">
                    Scannez & Commandez
                </p>
                <div className="h-1 w-10 bg-orange-100 mx-auto rounded-full" />
            </div>
        </div>
    )
}
