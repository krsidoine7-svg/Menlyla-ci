import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChefHat, QrCode, Smartphone, CreditCard, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="text-2xl font-bold tracking-tight text-orange-600">MANLY</div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4">
              Connexion
            </Link>
            <Link href="/login">
              <Button>Commencer</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 lg:py-32 bg-slate-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="inline-block rounded-lg bg-orange-100 px-3 py-1 text-sm text-orange-600 font-medium">
                🚀 Le futur de la restauration est ici
              </div>
              <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                Votre Menu sur Mobile <br className="hidden sm:inline" />
                <span className="text-orange-600">en moins de 5 minutes</span>
              </h1>
              <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Créez votre menu numérique, générez vos QR Codes et recevez les commandes directement en cuisine. Sans matériel coûteux.
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row mt-4">
                <Link href="/login">
                  <Button size="lg" className="bg-orange-600 hover:bg-orange-700 h-12 px-8 text-lg">
                    Créer mon Restaurant
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button variant="outline" size="lg" className="h-12 px-8 text-lg">
                    En savoir plus
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          {/* Abstract Decoration */}
          <div className="absolute top-0 right-0 -z-10 h-full w-1/3 bg-gradient-to-l from-orange-50 to-transparent opacity-50 blur-3xl" />
          <div className="absolute bottom-0 left-0 -z-10 h-full w-1/3 bg-gradient-to-r from-blue-50 to-transparent opacity-50 blur-3xl" />
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Tout ce qu'il faut pour gérer</h2>
              <p className="mx-auto mt-4 max-w-[700px] text-gray-500 md:text-xl">
                Une suite complète d'outils pour moderniser votre établissement.
              </p>
            </div>
            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={<QrCode className="h-10 w-10 text-orange-600" />}
                title="QR Codes Intelligents"
                description="Générez des QR Codes uniques pour chaque table. Vos clients scannent et accèdent instantanément au menu."
              />
              <FeatureCard
                icon={<ChefHat className="h-10 w-10 text-blue-600" />}
                title="Dashboard Cuisine"
                description="Fini les bons papiers perdus. Recevez les commandes en temps réel sur tablette ou écran en cuisine."
              />
              <FeatureCard
                icon={<CreditCard className="h-10 w-10 text-green-600" />}
                title="Paiements Mobiles"
                description="Encaissez plus vite avec l'intégration Mobile Money (LIGOS). Sécurisé et instantané."
              />
              <FeatureCard
                icon={<Smartphone className="h-10 w-10 text-purple-600" />}
                title="Expérience Client Fluide"
                description="Une interface magnifique pour vos clients. Photos HD, descriptions alléchantes et panier facile."
              />
              <FeatureCard
                icon={<TrendingUp className="h-10 w-10 text-yellow-600" />}
                title="Analytics (Bientôt)"
                description="Suivez votre chiffre d'affaires et vos meilleures ventes pour optimiser votre carte."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-slate-900 text-white">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">
              Prêt à passer au niveau supérieur ?
            </h2>
            <p className="mx-auto max-w-[600px] text-slate-300 md:text-xl mb-8">
              Rejoignez les restaurants qui utilisent Manly pour simplifier leur service.
            </p>
            <Link href="/login">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700 h-12 px-8 text-lg">
                Proposer mon Menu Gratuitement
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 bg-slate-50">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© 2024 Manly. Tous droits réservés.</p>
          <nav className="flex gap-4">
            <Link href="#" className="hover:underline">Mentions Légales</Link>
            <Link href="#" className="hover:underline">Confidentialité</Link>
            <Link href="#" className="hover:underline">Contact</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex flex-col items-center text-center p-6 border rounded-xl shadow-sm hover:shadow-md transition-shadow bg-slate-50/50">
      <div className="mb-4 p-3 bg-white rounded-full shadow-sm">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-500">{description}</p>
    </div>
  )
}
