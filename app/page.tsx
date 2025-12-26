import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChefHat, QrCode, Smartphone, CreditCard, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

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
        <section className="relative overflow-hidden pt-20 pb-24 lg:pt-32 lg:pb-40 bg-white">
          <div className="container px-4 md:px-6 relative z-10">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div className="flex flex-col items-start gap-6 text-left">
                <div className="inline-block rounded-full bg-orange-100 px-4 py-1.5 text-sm text-orange-600 font-black uppercase tracking-widest">
                  🚀 Le futur de la restauration
                </div>
                <h1 className="text-5xl font-black tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl leading-[0.9]">
                  Votre Menu <br />
                  <span className="text-orange-600">Digital</span> <br />
                  <span className="text-slate-900">Premium.</span>
                </h1>
                <p className="max-w-[600px] text-gray-500 text-lg md:text-xl leading-relaxed">
                  Créez une expérience mémorable pour vos clients. Photos HD, search intelligent, upselling automatisé et gestion des stocks en temps réel.
                </p>
                <div className="flex flex-col gap-3 min-[400px]:flex-row w-full sm:w-auto">
                  <Link href="/login">
                    <Button size="lg" className="bg-orange-600 hover:bg-orange-700 h-14 px-10 text-lg rounded-2xl shadow-2xl shadow-orange-500/20 w-full sm:w-auto">
                      Créer mon Restaurant
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="#pricing">
                    <Button variant="outline" size="lg" className="h-14 px-10 text-lg rounded-2xl border-slate-200 w-full sm:w-auto">
                      Voir les prix
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400 font-medium">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <span>+50 restaurants nous font confiance</span>
                </div>
              </div>

              <div className="relative flex justify-center lg:justify-end">
                {/* Mockup Container */}
                <div className="relative w-[300px] sm:w-[350px] aspect-[9/18.5] bg-slate-900 rounded-[3rem] p-3 shadow-[0_0_80px_-15px_rgba(234,88,12,0.3)] border-[8px] border-slate-800">
                  <div className="w-full h-full rounded-[2.2rem] overflow-hidden bg-white">
                    <img
                      src="/mobile_menu_mockup_preview_1766768339979.png"
                      alt="Aperçu Menu Mobile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Dynamic Badge */}
                  <div className="absolute -left-12 bottom-20 bg-white p-4 rounded-3xl shadow-2xl border flex items-center gap-4 animate-bounce duration-[3000ms]">
                    <div className="h-10 w-10 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Panier Moyen</div>
                      <div className="text-lg font-black text-slate-900 leading-none">+25%</div>
                    </div>
                  </div>
                </div>

                {/* Abstract Backgrounds */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[500px] h-[500px] bg-orange-100/50 rounded-full blur-[100px]" />
              </div>
            </div>
          </div>
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

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-slate-50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Des tarifs transparents</h2>
              <p className="mx-auto mt-4 max-w-[700px] text-gray-500 md:text-xl">
                Choisissez le plan qui correspond à la taille de votre restaurant.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {/* Solo Plan */}
              <Card className="flex flex-col p-6 rounded-[2rem] border-none shadow-sm bg-white">
                <div className="mb-8">
                  <h3 className="text-lg font-bold">SOLO</h3>
                  <div className="mt-4 flex items-baseline text-3xl font-black">
                    0 FCFA <span className="ml-1 text-sm font-medium text-gray-500">/mois</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">Parfait pour tester le menu QR.</p>
                </div>
                <ul className="flex-1 space-y-4 mb-8">
                  <PricingItem label="Menu digital illimité" />
                  <PricingItem label="1 QR Code unique" />
                  <PricingItem label="Photos HD des plats" />
                  <PricingItem label="Partage via lien" />
                </ul>
                <Link href="/login" className="w-full">
                  <Button variant="outline" className="w-full rounded-2xl h-12">Commencer Gratuitement</Button>
                </Link>
              </Card>

              {/* Pro Plan */}
              <Card className="flex flex-col p-6 rounded-[2rem] border-2 border-orange-500 shadow-xl shadow-orange-100 bg-white relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-600 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest">
                  LE PLUS POPULAIRE
                </div>
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-orange-600">PRO (BETA)</h3>
                  <div className="mt-4 flex items-baseline text-3xl font-black">
                    9.900 FCFA <span className="ml-1 text-sm font-medium text-gray-500">/mois</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">Pour les restaurants en pleine croissance.</p>
                </div>
                <ul className="flex-1 space-y-4 mb-8">
                  <PricingItem label="Tout le plan Solo" />
                  <PricingItem label="QR Code par table" />
                  <PricingItem label="Gestion des commandes" />
                  <PricingItem label="Souvent acheté avec (Upselling)" />
                  <PricingItem label="Support Prioritaire" />
                </ul>
                <Link href="/login" className="w-full">
                  <Button className="w-full rounded-2xl h-12 bg-orange-600 hover:bg-orange-700">Devenir Pro</Button>
                </Link>
              </Card>

              {/* Business Plan */}
              <Card className="flex flex-col p-6 rounded-[2rem] border-none shadow-sm bg-white">
                <div className="mb-8">
                  <h3 className="text-lg font-bold">BUSINESS (BETA)</h3>
                  <div className="mt-4 flex items-baseline text-3xl font-black text-gray-400">
                    Sur Devis
                  </div>
                  <p className="mt-2 text-sm text-gray-500">Pour les chaînes et franchises.</p>
                </div>
                <ul className="flex-1 space-y-4 mb-8">
                  <PricingItem label="Tout le plan Pro" />
                  <PricingItem label="Multi-établissements" />
                  <PricingItem label="Analytics Avancés" />
                  <PricingItem label="Paiement Mobile Money" />
                  <PricingItem label="Personnalisation complète" />
                </ul>
                <Button variant="outline" className="w-full rounded-2xl h-12">Contacter l'équipe</Button>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
          <div className="container px-4 md:px-6 text-center relative z-10">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">
              Prêt à passer au niveau supérieur ?
            </h2>
            <p className="mx-auto max-w-[600px] text-slate-300 md:text-xl mb-8">
              Rejoignez les restaurants qui utilisent Manly pour simplifier leur service.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="bg-orange-600 hover:bg-orange-700 h-14 px-10 text-lg rounded-2xl shadow-2xl shadow-orange-500/20">
                  Proposer mon Menu Gratuitement
                </Button>
              </Link>
              <Link href="https://wa.me/2250102030405" target="_blank">
                <Button size="lg" variant="outline" className="h-14 px-10 text-lg rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 text-white">
                  📞 Échanger sur WhatsApp
                </Button>
              </Link>
            </div>
          </div>
          <div className="absolute top-0 left-0 w-full h-full bg-orange-600/5 blur-3xl rounded-full translate-y-1/2" />
        </section>
      </main>

      <footer className="border-t py-12 bg-white">
        <div className="container grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="text-2xl font-black text-orange-600">MANLY</div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              La plateforme tout-en-un pour moderniser l'expérience client dans votre restaurant.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-black text-sm uppercase tracking-widest">Produit</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#features" className="hover:text-orange-600">Fonctionnalités</Link></li>
              <li><Link href="#pricing" className="hover:text-orange-600">Tarifs</Link></li>
              <li><Link href="#" className="hover:text-orange-600">Aide & Support</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-black text-sm uppercase tracking-widest">Légal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-orange-600">Mentions Légales</Link></li>
              <li><Link href="#" className="hover:text-orange-600">CGV / CGU</Link></li>
              <li><Link href="#" className="hover:text-orange-600">Confidentialité</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-black text-sm uppercase tracking-widest">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>hello@getmanly.com</li>
              <li>+225 01 02 03 04 05</li>
              <li>Abidjan, Côte d'Ivoire</li>
            </ul>
          </div>
        </div>
        <div className="container mt-12 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400 font-medium">
          <p>© 2024 Manly - Fait avec ❤️ pour la restauration.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-slate-900">Twitter</Link>
            <Link href="#" className="hover:text-slate-900">Instagram</Link>
            <Link href="#" className="hover:text-slate-900">LinkedIn</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PricingItem({ label }: { label: string }) {
  return (
    <li className="flex items-center gap-2 text-sm text-slate-600">
      <div className="bg-green-100 p-0.5 rounded-full">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><path d="M20 6 9 17l-5-5" /></svg>
      </div>
      {label}
    </li>
  )
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
