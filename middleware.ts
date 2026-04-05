import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createClient } from '@/lib/supabase/server'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // 1. Définir les exclusions (Toujours laisser l'admin et les fichiers statiques)
    const isMaintenancePage = pathname === '/maintenance'
    const isAdmin = pathname.startsWith('/admin') || pathname.startsWith('/(super-admin)') || pathname.startsWith('/api/webhooks')
    const isStatic = pathname.includes('.') || pathname.startsWith('/_next')

    if (!isAdmin && !isStatic) {
        try {
            // 2. Vérification super rapide du mode maintenance
            const supabase = await createClient()
            const { data } = await supabase
                .from('system_settings')
                .select('is_maintenance_mode')
                .eq('id', 1)
                .maybeSingle()

            const isMaintenanceActive = !!data?.is_maintenance_mode

            // 3. LOGIQUE GLOBALE DE REDIRECTION
            if (isMaintenanceActive && !isMaintenancePage) {
                // On garde TOUTE l'URL d'origine (Path + Query)
                const originalPath = pathname + request.nextUrl.search
                const redirectUrl = new URL('/maintenance', request.url)
                redirectUrl.searchParams.set('from', originalPath)
                return NextResponse.redirect(redirectUrl, 307)
            }

            if (!isMaintenanceActive && isMaintenancePage) {
                const returnTo = request.nextUrl.searchParams.get('from') || '/'
                // Rediriger vers l'origine ou l'accueil si aucun lien n'est trouvé
                return NextResponse.redirect(new URL(returnTo, request.url), 307)
            }
        } catch (e) {
            console.error('Erreur Middleware Maintenance:', e)
        }
    }

    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
