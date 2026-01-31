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
    EllipsisVertical as EllipsisIcon
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
                <Button variant="outline" size="icon" className="rounded-full border-orange-200 text-orange-600">
                    <EllipsisIcon className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Exports rapides</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleExportCSV} className="font-medium">
                    <DownloadIcon className="mr-2 h-4 w-4" /> Export CSV
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {!isGoogleConnected ? (
                    <DropdownMenuItem onClick={handleGoogleConnect} disabled={isConnecting} className="font-medium">
                        {isConnecting ? (
                            <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <LinkIcon className="mr-2 h-4 w-4" />
                        )}
                        Connexion Gmail
                    </DropdownMenuItem>
                ) : (
                    <>
                        <DropdownMenuItem onClick={handleSync} disabled={isSyncing} className="font-medium">
                            {isSyncing ? (
                                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                            ) : hasSheet ? (
                                <CheckIcon className="mr-2 h-4 w-4" />
                            ) : (
                                <TableIcon className="mr-2 h-4 w-4" />
                            )}
                            {isSyncing ? 'Sync...' : hasSheet ? 'Sync Google Sheets' : 'Créer le fichier Sheets'}
                        </DropdownMenuItem>
                        {sheetUrl && (
                            <DropdownMenuItem className="font-medium" asChild>
                                <a href={sheetUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLinkIcon className="mr-2 h-4 w-4" /> Ouvrir le fichier
                                </a>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => {
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
