'use client'

import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { syncToGoogleSheets } from "@/components/modules/analytics/actions"
import { createGoogleSheet, disconnectGoogle } from "@/components/modules/analytics/google-actions"
import { useState } from "react"
import {
    Download as DownloadIcon,
    Table as TableIcon,
    Link as LinkIcon,
    Unlink as UnlinkIcon,
    ExternalLink as ExternalLinkIcon,
    CheckCircle2 as CheckIcon,
    Loader2 as LoaderIcon,
    EllipsisVertical as EllipsisIcon,
    Printer as PrinterIcon
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

type Props = {
    stats: any
    restaurantId: string
}

export function ExportButton({ stats, restaurantId }: Props) {
    const [isSyncing, setIsSyncing] = useState(false)
    const [isConnecting, setIsConnecting] = useState(false)

    const isGoogleConnected = !!stats?.settings?.google_auth?.tokens
    const hasSheet = !!stats?.settings?.google_sheet_id
    const sheetUrl = stats?.settings?.google_sheet_url

    const handleExportCSV = () => {
        try {
            const headers = ["Plat", "Commandés", "Servis", "Refusés", "Revenue Total"]
            const rows = stats.dishPerformance.map((p: any) => [
                p.name,
                p.ordered,
                p.served,
                p.refused,
                p.revenue
            ])
            const csvContent = [headers.join(","), ...rows.map((row: any) => row.join(","))].join("\n")
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.setAttribute("href", url)
            link.setAttribute("download", `analytics-export-${new Date().toISOString().split('T')[0]}.csv`)
            link.style.visibility = 'hidden'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            toast.success("Export CSV réussi !")
        } catch (error) {
            toast.error("Échec de l'export CSV")
        }
    }

    const handleGoogleConnect = () => {
        setIsConnecting(true)
        window.location.href = '/api/auth/google'
    }

    const handleSync = async () => {
        if (!hasSheet) {
            setIsSyncing(true)
            try {
                await createGoogleSheet(restaurantId)
                toast.success("Fichier Google Sheets créé et synchronisé !")
            } catch (error: any) {
                toast.error(error.message)
            } finally {
                setIsSyncing(false)
            }
            return
        }

        setIsSyncing(true)
        const result = await syncToGoogleSheets(stats)
        setIsSyncing(false)

        if (result.success) {
            toast.success(result.message)
        } else {
            toast.error(result.message)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-11 rounded-xl bg-white border border-slate-200 px-4 gap-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm focus:ring-0">
                    <DownloadIcon className="h-4 w-4 text-slate-400" />
                    Exporter
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white rounded-xl shadow-lg border-slate-100 p-2">
                <DropdownMenuLabel className="text-xs font-semibold text-slate-500 mb-1 px-2">Téléchargements</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleExportCSV} className="rounded-lg h-10 font-medium cursor-pointer !text-slate-700 data-[highlighted]:!bg-slate-50 data-[highlighted]:!text-slate-900 border-none outline-none focus:outline-none">
                    <TableIcon className="mr-2 h-4 w-4 text-emerald-600" /> Excel (CSV)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.print()} className="rounded-lg h-10 font-medium cursor-pointer !text-slate-700 data-[highlighted]:!bg-slate-50 data-[highlighted]:!text-slate-900 border-none outline-none focus:outline-none">
                    <PrinterIcon className="mr-2 h-4 w-4 text-blue-600" /> Imprimer / en PDF
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 bg-slate-100" />
                {!isGoogleConnected ? (
                    <DropdownMenuItem onClick={handleGoogleConnect} disabled={isConnecting} className="rounded-lg h-10 font-medium cursor-pointer !text-slate-700 data-[highlighted]:!bg-slate-50 data-[highlighted]:!text-slate-900 border-none outline-none focus:outline-none">
                        {isConnecting ? (
                            <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <LinkIcon className="mr-2 h-4 w-4 text-violet-600" />
                        )}
                        Connexion Gmail
                    </DropdownMenuItem>
                ) : (
                    <>
                        <DropdownMenuItem onClick={handleSync} disabled={isSyncing} className="rounded-lg h-10 font-medium cursor-pointer !text-slate-700 data-[highlighted]:!bg-slate-50 data-[highlighted]:!text-slate-900 border-none outline-none focus:outline-none">
                            {isSyncing ? (
                                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                            ) : hasSheet ? (
                                <CheckIcon className="mr-2 h-4 w-4 text-emerald-600" />
                            ) : (
                                <TableIcon className="mr-2 h-4 w-4 text-violet-600" />
                            )}
                            {isSyncing ? 'Sync...' : hasSheet ? 'Sync Google Sheets' : 'Créer le fichier Sheets'}
                        </DropdownMenuItem>
                        {sheetUrl && (
                            <DropdownMenuItem className="rounded-lg h-10 font-medium cursor-pointer !text-slate-700 data-[highlighted]:!bg-slate-50 data-[highlighted]:!text-slate-900 border-none outline-none focus:outline-none" asChild>
                                <a href={sheetUrl} target="_blank" rel="noopener noreferrer" className="flex items-center w-full">
                                    <ExternalLinkIcon className="mr-2 h-4 w-4 text-blue-600" /> Ouvrir le fichier
                                </a>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="rounded-lg h-10 font-medium cursor-pointer !text-red-600 data-[highlighted]:!bg-red-50 data-[highlighted]:!text-red-700 border-none outline-none focus:outline-none" onClick={() => {
                            if (confirm("Déconnecter votre compte Google ?")) disconnectGoogle()
                        }}>
                            <UnlinkIcon className="mr-2 h-4 w-4" /> Déconnecter Google
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
