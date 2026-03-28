'use client'

import { useState } from 'react'
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { login } from '@/app/login/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function AdminLoginForm() {
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        const result = await login(formData)
        
        if (result?.error) {
            toast.error(result.error)
            setLoading(false)
        } else {
            router.push('/admin')
        }
    }

    return (
        <div className="bg-white p-10 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-50 w-full animate-in fade-in zoom-in-95 duration-500">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Se connecter</h2>
                <p className="text-slate-400 text-sm font-medium">Entrez vos identifiants pour accéder à votre compte</p>
            </div>

            <form action={handleSubmit} className="space-y-6">
                <input type="hidden" name="redirectTo" value="/admin" />
                
                <div className="space-y-4">
                    {/* Email Field */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                            <Input 
                                name="email"
                                type="email" 
                                required
                                placeholder="votre@email.com" 
                                className="pl-12 h-[54px] bg-white border-slate-200 text-slate-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 rounded-2xl transition-all placeholder:text-slate-300 font-medium"
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Mot de passe</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                            <Input 
                                name="password"
                                type={showPassword ? "text" : "password"} 
                                required
                                placeholder="Votre mot de passe" 
                                className="pl-12 h-[54px] bg-white border-slate-200 text-slate-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 rounded-2xl transition-all placeholder:text-slate-300 font-medium"
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full h-[54px] bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold rounded-2xl transition-all active:scale-[0.98] shadow-[0_4px_15px_rgba(249,115,22,0.3)] shadow-orange-500/20"
                >
                    {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            Se connecter <ArrowRight className="h-5 w-5" />
                        </span>
                    )}
                </Button>
            </form>
        </div>
    )
}
