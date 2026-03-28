'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'

/**
 * Ensures the requester is actually a super admin.
 */
async function verifySuperAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const adminClient = getAdminClient()
    const { data: adminRecord } = await adminClient
        .from('app_admins')
        .select('id, is_super_admin')
        .eq('id', user.id)
        .maybeSingle()

    if (!adminRecord?.is_super_admin) {
        const { count } = await adminClient.from('app_admins').select('id', { count: 'exact', head: true }).eq('is_super_admin', true)
        
        if (count === 0) {
            // Permanent Auto-heal: If system is entirely locked out, the first user claims it
            await adminClient.from('app_admins').upsert({ id: user.id, email: user.email, is_super_admin: true })
            return user
        }
        
        throw new Error('Unauthorized Access: Only super admins can perform this action.')
    }

    return user
}

/**
 * Ensures the requester is at least an admin (system editor or super admin).
 */
export async function verifyAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const adminClient = getAdminClient()
    const { data: adminRecord } = await adminClient
        .from('app_admins')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

    if (!adminRecord) {
        const { count } = await adminClient.from('app_admins').select('id', { count: 'exact', head: true })
        
        if (count === 0) {
            // Permanent Auto-heal: If system is entirely locked out, the first user claims it
            await adminClient.from('app_admins').upsert({ id: user.id, email: user.email, is_super_admin: true })
            return user
        }
        
        throw new Error('Unauthorized Access: Admins only.')
    }

    return user
}

/**
 * Toggle admin status for a user (Add to or remove from app_admins table)
 */
export async function toggleAdminRole(userId: string) {
    try {
        const caller = await verifySuperAdmin()
        const supabase = await createClient()
        const adminClient = getAdminClient()

        const { data: isAdmin } = await supabase
            .from('app_admins')
            .select('id')
            .eq('id', userId)
            .maybeSingle()

        if (isAdmin) {
            // Remove from admins
            const { error } = await adminClient
                .from('app_admins')
                .delete()
                .eq('id', userId)
            
            if (error) throw error
            
            // Log audit
            await adminClient.from('admin_audit_logs').insert({
                admin_id: caller.id,
                action: 'REMOVE_ADMIN_ROLE',
                entity_type: 'admin',
                entity_id: userId
            })
            
            revalidatePath('/admin/users')
            revalidatePath('/admin/compteAdmin')
            return { success: true, message: "L'utilisateur n'est plus administrateur." }
        } else {
            // Add as admin - First fetch user email from profiles or auth
            const { data: profile } = await supabase
                .from('profiles')
                .select('email')
                .eq('id', userId)
                .single()

            const { error } = await adminClient
                .from('app_admins')
                .insert({ 
                    id: userId,
                    email: profile?.email || null
                })
            
            if (error) throw error

            // Log audit
            await adminClient.from('admin_audit_logs').insert({
                admin_id: caller.id,
                action: 'ADD_ADMIN_ROLE',
                entity_type: 'admin',
                entity_id: userId
            })

            revalidatePath('/admin/users')
            revalidatePath('/admin/compteAdmin')
            return { success: true, message: "L'utilisateur est désormais administrateur." }
        }
    } catch (e: any) {
        return { error: e.message }
    }
}

/**
 * Delete a user account (fully delete from auth.users)
 */
export async function deleteUserAccount(userId: string) {
    try {
        const adminClient = getAdminClient()
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        // Fetch caller's admin record (bypasses RLS)
        const { data: callerRecord } = await adminClient
            .from('app_admins')
            .select('id, is_super_admin, permissions')
            .eq('id', user.id)
            .maybeSingle()

        if (!callerRecord) throw new Error("Unauthorized Access: Admins only.")

        const isSuperAdmin = callerRecord.is_super_admin
        const perms = callerRecord.permissions as any
        const hasDeletePerm = isSuperAdmin || perms?.users?.delete === true

        if (!hasDeletePerm) throw new Error("Unauthorized Access: You don't have permission to delete users.")
        if (callerRecord.id === userId) throw new Error('Vous ne pouvez pas supprimer votre propre compte.')

        // Manual cleanup of public records to avoid foreign key violations
        // 1. Remove from orders if this user was the customer
        await adminClient.from('orders').delete().eq('customer_id', userId)

        // 2. Remove from restaurants if owner_id references this user (Merchant account)
        // Since restaurants have no cascade on orders, we first delete orders from those restaurants
        const { data: userRestos } = await adminClient.from('restaurants').select('id').eq('owner_id', userId)
        if (userRestos && userRestos.length > 0) {
            const restoIds = userRestos.map(r => r.id)
            await adminClient.from('orders').delete().in('restaurant_id', restoIds)
            await adminClient.from('restaurants').delete().in('id', restoIds)
        }
        
        // 3. Remove from app_admins if present
        await adminClient.from('app_admins').delete().eq('id', userId)
        
        // 4. Remove from profiles if present
        await adminClient.from('profiles').delete().eq('id', userId)

        // 5. Remove from admin_audit_logs where they were the admin
        await adminClient.from('admin_audit_logs').delete().eq('admin_id', userId)

        const { error } = await adminClient.auth.admin.deleteUser(userId)
        if (error) {
            console.error('Final Auth delete error:', error)
            throw new Error(`Database error deleting user: ${error.message}`)
        }



        await adminClient.from('admin_audit_logs').insert({
            admin_id: callerRecord.id,
            action: 'DELETE_USER',
            entity_type: 'profile',
            entity_id: userId,
            details: { email_at_time: userId }
        })


        revalidatePath('/admin/users')
        revalidatePath('/admin/compteAdmin')
        return { success: true, message: 'Compte utilisateur supprimé définitivement.' }
    } catch (e: any) {
        return { error: e.message }
    }
}


/**
 * Update an existing admin's permissions and role
 */
export async function updateAdminPermissions(adminId: string, data: {
    is_super_admin: boolean,
    permissions: Record<string, any>
}) {
    try {
        const caller = await verifySuperAdmin()
        
        // Prevent self-demotion
        if (caller.id === adminId && !data.is_super_admin) {
            throw new Error('Vous ne pouvez pas rétrograder votre propre compte Super Admin.')
        }

        const adminClient = getAdminClient()

        const { error } = await adminClient
            .from('app_admins')
            .update({
                is_super_admin: data.is_super_admin,
                permissions: data.permissions
            })
            .eq('id', adminId)

        if (error) throw error

        // Log audit
        await adminClient.from('admin_audit_logs').insert({
            admin_id: caller.id,
            action: 'UPDATE_ADMIN_PERMISSIONS',
            entity_type: 'admin',
            entity_id: adminId,
            details: { is_super_admin: data.is_super_admin }
        })

        revalidatePath('/admin/compteAdmin')
        return { success: true, message: 'Droits mis à jour avec succès.' }
    } catch (e: any) {
        return { error: e.message }
    }
}

/**
 * Create a new admin account with specific permissions
 */
export async function createAdminAccount(data: {
    email: string,
    password: string,
    isSuperAdmin: boolean,
    permissions: Record<string, any>
}) {
    try {
        const caller = await verifySuperAdmin()
        const adminClient = getAdminClient()

        // 1. Create the user in Auth
        const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
            email: data.email,
            password: data.password,
            email_confirm: true
        })

        if (authError) throw authError
        if (!authUser.user) throw new Error("Erreur lors de la création du compte Auth.")

        // 2. Insert into app_admins
        const { error: adminError } = await adminClient
            .from('app_admins')
            .insert({
                id: authUser.user.id,
                email: data.email,
                is_super_admin: data.isSuperAdmin,
                permissions: data.permissions
            })

        if (adminError) {
            // Cleanup auth user if admin insert fails
            await adminClient.auth.admin.deleteUser(authUser.user.id)
            throw adminError
        }

        // Log audit
        await adminClient.from('admin_audit_logs').insert({
            admin_id: caller.id,
            action: 'CREATE_ADMIN',
            entity_type: 'admin',
            entity_id: authUser.user.id,
            details: { email: data.email, is_super: data.isSuperAdmin }
        })

        revalidatePath('/admin/users')
        revalidatePath('/admin/compteAdmin')
        
        return { success: true, message: "Le compte administrateur a été créé avec succès." }
    } catch (e: any) {
        return { error: e.message }
    }
}

/**
 * Update restaurant status (moderation)
 */
export async function updateRestaurantStatus(restaurantId: string, status: 'active' | 'pending' | 'expired' | 'cancelled') {
    try {
        const caller = await verifyAdmin()
        const adminClient = getAdminClient()

        const { error } = await adminClient
            .from('restaurants')
            .update({ subscription_status: status })
            .eq('id', restaurantId)

        if (error) throw error

        // Log moderation history
        await adminClient.from('moderation_history').insert({
            admin_id: caller.id,
            restaurant_id: restaurantId,
            action: status,
            reason: 'Statut modifié manuellement via le dashboard admin'
        })
        
        // Log audit (global)
        await adminClient.from('admin_audit_logs').insert({
            admin_id: caller.id,
            action: 'UPDATE_RESTAURANT_STATUS',
            entity_type: 'restaurant',
            entity_id: restaurantId,
            details: { new_status: status }
        })

        revalidatePath('/admin/moderation')
        return { success: true, message: `Statut du restaurant mis à jour: ${status}` }
    } catch (e: any) {
        return { error: e.message }
    }
}

/**
 * Génère un lien de connexion magique pour usurper l'identité d'un utilisateur (Impersonation)
 * Utile pour le support client.
 */
export async function getImpersonationLink(userId: string) {
    try {
        const adminClient = getAdminClient()
        const supabase = await createClient()
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        if (!currentUser) throw new Error('Not authenticated')

        // Fetch caller's admin record with permissions
        const { data: adminRecord } = await adminClient
            .from('app_admins')
            .select('id, is_super_admin, permissions')
            .eq('id', currentUser.id)
            .maybeSingle()

        if (!adminRecord) throw new Error("Unauthorized Access: Admins only.")

        const perms = adminRecord.permissions as any
        const canImpersonate = adminRecord.is_super_admin || perms?.users?.impersonate === true

        if (!canImpersonate) throw new Error("Unauthorized Access: You don't have permission to impersonate users.")

        // Fetch target user email
        const { data: userToImpersonate, error: fetchError } = await adminClient.auth.admin.getUserById(userId)
        if (fetchError || !userToImpersonate.user) throw new Error("Utilisateur introuvable dans le système d'authentification.")
        if (!userToImpersonate.user.email) throw new Error("Cet utilisateur n'a pas d'adresse e-mail valide.")

        // Generate magic link without sending email
        const { data, error } = await adminClient.auth.admin.generateLink({
            type: 'magiclink',
            email: userToImpersonate.user.email,
            options: {
                redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
            }
        })

        if (error) throw error

        // Log audit
        await adminClient.from('admin_audit_logs').insert({
            admin_id: adminRecord.id,
            action: 'IMPERSONATE_USER',
            entity_type: 'profile',
            entity_id: userId,
            details: { target_email: userToImpersonate.user.email }
        })

        return { success: true, link: data.properties?.action_link }
    } catch (e: any) {
        return { error: e.message }
    }
}

