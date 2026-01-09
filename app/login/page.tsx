import { LoginForm } from './login-form'
import { UtensilsCrossed } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
    return (
        <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
            <div className="flex items-center justify-center py-12">
                <div className="mx-auto grid w-[350px] gap-6">
                    <div className="grid gap-2 text-center">
                        <div className="flex justify-center mb-6">
                            <img src="/favicon.png" alt="MANLY Logo" className="h-16 w-16 rounded-[1.5rem] shadow-xl shadow-orange-500/20" />
                        </div>
                        <h1 className="text-3xl font-bold">Bienvenue</h1>
                        <p className="text-balance text-muted-foreground">
                            Entrez vos identifiants pour gérer votre restaurant
                        </p>
                    </div>
                    <LoginForm />
                    <div className="mt-4 text-center text-sm">
                        Pas encore de compte ?{' '}
                        <Link href="/signup" className="underline font-medium hover:text-orange-600">
                            S'inscrire
                        </Link>
                    </div>
                    <div className="mt-2 text-center text-sm">
                        <Link href="/" className="underline text-muted-foreground">
                            Retour à l'accueil
                        </Link>
                    </div>
                </div>
            </div>
            <div className="hidden bg-muted lg:block relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white">
                    <div className="max-w-md p-10 text-center">
                        <blockquote className="space-y-2">
                            <p className="text-lg">
                                &ldquo;Depuis que j'utilise Manly, mon temps d'attente a diminué de 20% et mes clients adorent scanner le menu.&rdquo;
                            </p>
                            <footer className="text-sm italic text-orange-100">Chef Jean, Le Petit Maquis</footer>
                        </blockquote>
                    </div>
                </div>
                {/* 
                  Optional: Realistic Image Background
                  <Image src="/placeholder.svg" alt="Image" width="1920" height="1080" className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale" />
                 */}
            </div>
        </div>
    )
}
