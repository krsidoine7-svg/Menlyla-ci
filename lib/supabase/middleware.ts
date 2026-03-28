import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // PROTECTED ROUTES CONFIGURATION
    // Add paths that require authentication here
    const protectedPaths = ['/admin', '/dashboard', '/restaurant', '/super-admin']

    const isProtected = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))
    const isAdminPath = request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/super-admin')
    const isAdminLoginPage = request.nextUrl.pathname === '/admin/login'
    const isAdminSignupPage = request.nextUrl.pathname === '/admin/signup'

    // Bypass protection for the admin login/signup pages itself to avoid infinite loops
    if (isAdminLoginPage || isAdminSignupPage) {
        return response
    }

    if (isProtected && !user) {
        const url = request.nextUrl.clone()
        url.pathname = isAdminPath ? '/admin/login' : '/login'
        return NextResponse.redirect(url)
    }

    if (isProtected && user) {
        // Fetch from app_admins table using Admin Client to bypass RLS issues in middleware
        const adminClient = getAdminClient()
        const { data: adminRecord } = await adminClient
            .from('app_admins')
            .select('id')
            .eq('id', user.id)
            .maybeSingle()

        const isAdmin = !!adminRecord
        console.log("[MIDDLEWARE] User ID:", user.id, "Is Admin:", isAdmin)

        // If it's an admin, BYPASS everything else (including onboarding)
        if (isAdmin) {
            // Force redirect to /admin if they hit /dashboard or /
            const isDashboard = request.nextUrl.pathname === '/dashboard' || request.nextUrl.pathname === '/'
            if (isDashboard) {
                const url = request.nextUrl.clone()
                url.pathname = '/admin'
                return NextResponse.redirect(url)
            }
            return response
        }

        // If it's an admin path but user is not admin, redirect to dashboard
        if (isAdminPath && !isAdmin) {
            const url = request.nextUrl.clone()
            url.pathname = '/dashboard'
            return NextResponse.redirect(url)
        }

        // Check if user has a restaurant and if it's active
        const { data: restaurant } = await supabase
            .from('restaurants')
            .select('id, subscription_status')
            .eq('owner_id', user.id)
            .maybeSingle()

        const isAtOnboarding = request.nextUrl.pathname.startsWith('/onboarding')

        if (!restaurant && !isAtOnboarding) {
            const url = request.nextUrl.clone()
            url.pathname = '/onboarding'
            return NextResponse.redirect(url)
        }

        if (restaurant && restaurant.subscription_status !== 'active' && !isAtOnboarding) {
            const url = request.nextUrl.clone()
            url.pathname = '/onboarding'
            return NextResponse.redirect(url)
        }
    }

    return response
}
