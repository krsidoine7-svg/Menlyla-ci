'use client'

import { useState } from 'react'
import { Mail, Lock, Loader2, ArrowRight, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { signup } from '@/app/login/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function AdminSignupForm() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        // Using common signup action but with a secret or logic to become admin
        // We will pass redirectTo so the middleware sees it
        const result = await signup(formData)
        
        if (result?.error) {
            toast.error(result.error)
            setLoading(false)
        } else {
            // Note: After signup, we might need a confirmation or special logic.
            // But since this is the VERY FIRST admin, we'll suggest them to login.
            toast.success("Compte créé. Connectez-vous maintenant.")
            router.push('/admin/login')
        }
    }

    return (
        <div className="bg-white p-10 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-50 w-full animate-in fade-in zoom-in-95 duration-500">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 italic serif">Bootstrapping Admin</h2>
                <p className="text-slate-400 text-sm font-medium">Installation du tout premier compte administrateur système</p>
            </div>

            <form action={handleSubmit} className="space-y-6">
                <input type="hidden" name="redirectTo" value="/admin" />
                
                <div className="space-y-4">
                    {/* User Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Nom / Username</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                            <Input 
                                name="username"
                                type="text" 
                                required
                                placeholder="votre_nom" 
                                className="pl-12 h-[54px] bg-white border-slate-200 text-slate-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 rounded-2xl transition-all placeholder:text-slate-300 font-medium"
                            />
                        </div>
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Email Principal</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                            <Input 
                                name="email"
                                type="email" 
                                required
                                placeholder="votre@admin-corp.com" 
                                className="pl-12 h-[54px] bg-white border-slate-200 text-slate-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 rounded-2xl transition-all placeholder:text-slate-300 font-medium"
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Clé Maître</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                            <Input 
                                name="password"
                                type="password" 
                                required
                                placeholder="Mot de passe robuste" 
                                className="pl-12 h-[54px] bg-white border-slate-200 text-slate-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 rounded-2xl transition-all placeholder:text-slate-300 font-medium"
                            />
                        </div>
                    </div>
                </div>

                <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full h-[54px] bg-slate-900 hover:bg-black text-white font-bold rounded-2xl transition-all active:scale-[0.98] shadow-lg"
                >
                    {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            Lancer l'Installation <ArrowRight className="h-5 w-5 opacity-40" />
                        </span>
                    )}
                </Button>
            </form>
        </div>
    )
}
