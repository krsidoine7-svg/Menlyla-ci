import { getAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { can } from '@/lib/admin-permissions'
import { 
    Users, 
    MoreHorizontal, 
    Search, 
    Filter, 
    Trash2, 
    Edit, 
    ShieldCheck, 
    ShieldX,
    UserCircle,
    Mail,
    Calendar,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    ChevronDown,
    UserPlus
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { UserRow } from '@/components/modules/super-admin/user-row'
import Link from 'next/link'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export default async function UsersManagement({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const supabase = await createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    const adminClient = getAdminClient()

    // Fetch current admin's permissions for UI gating
    const { data: currentAdminRecord } = await adminClient
        .from('app_admins')
        .select('id, is_super_admin, permissions')
        .eq('id', currentUser?.id ?? '')
        .maybeSingle()

    const adminRecord = currentAdminRecord || { id: '', is_super_admin: false, permissions: null }
    const canEditUser = can(adminRecord, 'users', 'edit')
    const canDeleteUser = can(adminRecord, 'users', 'delete')
    const canImpersonateUser = can(adminRecord, 'users', 'impersonate')
    
    // Extract search, sort and pagination params
    const query = typeof params.q === 'string' ? params.q : ''
    const sort = typeof params.sort === 'string' ? params.sort : 'created_at'
    const order = typeof params.order === 'string' ? params.order : 'desc'
    const page = typeof params.page === 'string' ? parseInt(params.page, 10) : 1
    
    const ITEMS_PER_PAGE = 10
    const from = (page - 1) * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1

    // Fetch Admin IDs first to exclude them from the regular users list
    const { data: adminsRes } = await adminClient.from('app_admins').select('id')
    const adminIds = (adminsRes || []).map(a => a.id)

    // Build the query
    let usersQuery = adminClient
        .from('profiles')
        .select('*', { count: 'exact' })
        .order(sort, { ascending: order === 'asc' })
        .range(from, to)

    // Exclude admins gracefully at the DB level
    if (adminIds.length > 0) {
        usersQuery = usersQuery.not('id', 'in', `(${adminIds.join(',')})`)
    }

    if (query) {
        usersQuery = usersQuery.or(`username.ilike.%${query}%,full_name.ilike.%${query}%,email.ilike.%${query}%`)
    }

    const { data: usersRes, count, error } = await usersQuery

    if (error) console.error('Users fetch error:', error)

    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)
    
    // Format the list
    const usersWithRoles = (usersRes || []).map(u => ({
        ...u,
        isAdmin: false
    }))

    // Helper to generate URLs while preserving existing params
    const getSortUrl = (column: string) => {
        const newOrder = sort === column && order === 'asc' ? 'desc' : 'asc'
        const urlParams = new URLSearchParams()
        if (query) urlParams.set('q', query)
        urlParams.set('sort', column)
        urlParams.set('order', newOrder)
        // Reset to page 1 on new sort
        urlParams.set('page', '1')
        return `/admin/users?${urlParams.toString()}`
    }

    const getPageUrl = (newPage: number) => {
        const urlParams = new URLSearchParams()
        if (query) urlParams.set('q', query)
        urlParams.set('sort', sort)
        urlParams.set('order', order)
        urlParams.set('page', newPage.toString())
        return `/admin/users?${urlParams.toString()}`
    }

    // Helper to render sort icon
    const SortIcon = ({ column }: { column: string }) => {
        if (sort !== column) return <ArrowUpDown className="h-3.5 w-3.5 opacity-30 ml-1.5 inline" />
        return order === 'asc' 
            ? <ArrowUp className="h-3.5 w-3.5 ml-1.5 text-orange-500 inline" /> 
            : <ArrowDown className="h-3.5 w-3.5 ml-1.5 text-orange-500 inline" />
    }

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm flex items-center gap-3">
                        <Users className="h-8 w-8 text-orange-500" />
                        Gestion des Utilisateurs
                    </h1>
                    <p className="text-slate-500 font-medium max-w-2xl">Visualisez, modérez et gérez tous les comptes utilisateurs inscrits sur Menlyla.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <form method="get" action="/admin/users" className="w-full">
                            <Input 
                                name="q"
                                defaultValue={query}
                                placeholder="Rechercher (nom, email, @username)..." 
                                className="pl-10 h-10 rounded-xl border-slate-200 bg-white shadow-sm focus-visible:ring-emerald-500 w-full font-medium"
                            />
                            {/* Keep sort params when searching, reset page to 1 */}
                            <input type="hidden" name="sort" value={sort} />
                            <input type="hidden" name="order" value={order} />
                            <input type="hidden" name="page" value="1" />
                        </form>
                    </div>
                </div>
            </div>

            <Card className="border-none shadow-sm overflow-hidden bg-white/60 backdrop-blur-sm">
                <CardHeader className="bg-slate-50/80 border-b px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="space-y-0.5">
                        <CardTitle className="text-lg font-bold italic uppercase tracking-tighter text-slate-900">Base Utilisateurs</CardTitle>
                        <CardDescription className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                            {totalCount} utilisateurs {query ? 'trouvés' : 'au total'}
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-9 rounded-xl border-slate-200 bg-white font-bold text-slate-600 gap-2 shadow-sm">
                                    <Filter className="h-3.5 w-3.5" />
                                    Trier par: {sort === 'created_at' ? 'Date' : sort === 'full_name' ? 'Nom' : sort === 'email' ? 'Email' : sort}
                                    <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-xl border-slate-100 shadow-xl p-2 bg-white">
                                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Champ de tri</DropdownMenuLabel>
                                <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                                    <Link href={getSortUrl('created_at')} className="font-bold flex items-center justify-between w-full">Date d'inscription {sort === 'created_at' && <SortIcon column="created_at" />}</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                                    <Link href={getSortUrl('full_name')} className="font-bold flex items-center justify-between w-full">Nom complet {sort === 'full_name' && <SortIcon column="full_name" />}</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                                    <Link href={getSortUrl('email')} className="font-bold flex items-center justify-between w-full">Email {sort === 'email' && <SortIcon column="email" />}</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                                    <Link href={getSortUrl('username')} className="font-bold flex items-center justify-between w-full">Identifiant (@) {sort === 'username' && <SortIcon column="username" />}</Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-white border-b border-slate-100/50">
                                <th className="px-6 py-4">
                                    <Link href={getSortUrl('full_name')} className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center hover:text-emerald-600 transition-colors">
                                        Utilisateur <SortIcon column="full_name" />
                                    </Link>
                                </th>
                                <th className="px-6 py-4">
                                    <Link href={getSortUrl('email')} className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center hover:text-emerald-600 transition-colors">
                                        Contact <SortIcon column="email" />
                                    </Link>
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Compte & Rôle</th>
                                <th className="px-6 py-4">
                                    <Link href={getSortUrl('created_at')} className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center hover:text-emerald-600 transition-colors">
                                        Inscription <SortIcon column="created_at" />
                                    </Link>
                                </th>
                                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Menu</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/50 bg-white">
                            {usersWithRoles?.map((user: any) => (
                                <UserRow 
                                    key={user.id} 
                                    user={user} 
                                    isAdmin={user.isAdmin}
                                    canEdit={canEditUser}
                                    canDelete={canDeleteUser}
                                    canImpersonate={canImpersonateUser}
                                />
                            ))}
                        </tbody>
                    </table>
                    
                    {(!usersWithRoles || usersWithRoles.length === 0) && (
                        <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 backdrop-blur-sm">
                            <div className="h-20 w-20 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-center justify-center mb-6 -rotate-3 hover:rotate-0 transition-transform">
                                <Search className="h-8 w-8 text-orange-200" />
                            </div>
                            <h3 className="text-xl font-black italic uppercase text-slate-900 tracking-tight">Aucun utilisateur trouvé</h3>
                            <p className="text-slate-500 font-medium mt-1">Votre requête pour "{query}" n'a donné aucun résultat sur la page {page}.</p>
                            <Button variant="outline" asChild className="mt-6 font-bold uppercase tracking-widest text-[10px] h-10 px-6 border-slate-200 rounded-xl hover:bg-slate-900 hover:text-white transition-all">
                                <Link href="/admin/users">Effacer tous les filtres</Link>
                            </Button>
                        </div>
                    )}
                </CardContent>

                {/* Pagination Footer */}
                {totalCount > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 bg-slate-50/30 border-t border-slate-100">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Affichage <span className="text-slate-900 font-black">{totalCount > 0 ? from + 1 : 0}</span> à <span className="text-slate-900 font-black">{Math.min(to + 1, totalCount)}</span> sur <span className="text-slate-900 font-black">{totalCount}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {page > 1 ? (
                                <Button variant="outline" size="sm" asChild className="font-black text-xs h-9 rounded-xl border-slate-200">
                                    <Link href={getPageUrl(page - 1)}>Précédent</Link>
                                </Button>
                            ) : (
                                <Button variant="outline" size="sm" disabled className="font-black text-xs h-9 rounded-xl border-slate-200 opacity-50 cursor-not-allowed">
                                    Précédent
                                </Button>
                            )}

                            {page < totalPages ? (
                                <Button variant="outline" size="sm" asChild className="font-black text-xs h-9 rounded-xl border-slate-200">
                                    <Link href={getPageUrl(page + 1)}>Suivant</Link>
                                </Button>
                            ) : (
                                <Button variant="outline" size="sm" disabled className="font-black text-xs h-9 rounded-xl border-slate-200 opacity-50 cursor-not-allowed">
                                    Suivant
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </Card>
        </div>
    )
}

