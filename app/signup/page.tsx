import { SignupForm } from './signup-form'
import { UtensilsCrossed } from 'lucide-react'
import Link from 'next/link'

export default function SignupPage() {
    return (
        <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
            <div className="flex items-center justify-center py-12">
                <div className="mx-auto grid w-[350px] gap-6">
                    <div className="grid gap-2 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-orange-100 rounded-full">
                                <UtensilsCrossed className="h-8 w-8 text-orange-600" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold">Créer un compte</h1>
                        <p className="text-balance text-muted-foreground">
                            Démarrez votre essai gratuit dès aujourd'hui
                        </p>
                    </div>
                    <SignupForm />
                    <div className="mt-4 text-center text-sm">
                        Déjà un compte ?{' '}
                        <Link href="/login" className="underline font-medium hover:text-orange-600">
                            Se connecter
                        </Link>
                    </div>
                </div>
            </div>
            <div className="hidden bg-muted lg:block relative">
                <div className="absolute inset-0 bg-gradient-to-bl from-slate-800 to-slate-900 flex items-center justify-center text-white">
                    <div className="max-w-md p-10 text-center">
                        <blockquote className="space-y-2">
                            <p className="text-lg">
                                &ldquo;La mise en place a pris littéralement 5 minutes. Mes serveurs sont soulagés et je vends plus de desserts !&rdquo;
                            </p>
                            <footer className="text-sm italic text-slate-400">Sarah M., The Burger Joint</footer>
                        </blockquote>
                    </div>
                </div>
            </div>
        </div>
    )
}
