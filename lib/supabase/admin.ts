import { createClient } from '@supabase/supabase-js'

/**
 * Super Admin Client with service role privileges.
 * WARNING: ONLY use this in Server Actions or API Routes that have 
 * explicit role-based checks. NEVER expose this key to the client.
 */
export function getAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    )
}
