"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChefHat, QrCode, Smartphone, CreditCard, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

const Orb = dynamic(() => import("@/components/ui/Orb"), { ssr: false });

export default function Home() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -200]);
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Navbar Glassmorphic */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-7xl backdrop-blur-xl bg-white/70 border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] rounded-[2rem] transition-all duration-300">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-2xl font-black tracking-tighter text-orange-600 flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white text-lg">M</div>
            MENLYLA
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-bold text-slate-600 hover:text-orange-600 transition-colors">Fonctionnalités</Link>
            <Link href="#pricing" className="text-sm font-bold text-slate-600 hover:text-orange-600 transition-colors">Tarifs</Link>
            <Link href="https://wa.me/2250503681588" className="text-sm font-bold text-slate-600 hover:text-orange-600 transition-colors">Contact</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block text-sm font-bold text-slate-600 hover:text-orange-600 transition-colors">
              Connexion
            </Link>
            <Link href="/login">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl px-6 font-bold shadow-lg shadow-orange-600/20 active:scale-95 transition-all">
                Démarrer
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-orange-600 origin-left z-50" style={{ scaleX: scrollYProgress }} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-40 pb-24 lg:pt-48 lg:pb-40 bg-white">
          {/* WebGL Orb Background */}
          <motion.div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40" style={{ y }}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]">
              <Orb
                hue={20}
                hoverIntensity={0.5}
                rotateOnHover={true}
                forceHoverState={false}
                backgroundColor="#ffffff"
              />
            </div>
          </motion.div>

          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Floating Gradient Orbs */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-orange-200/40 to-orange-300/40 rounded-full blur-3xl animate-float-slow"></div>
            <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-blue-200/30 to-blue-300/30 rounded-full blur-3xl animate-float-medium"></div>
            <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-purple-200/30 to-pink-200/30 rounded-full blur-3xl animate-float-fast"></div>
            <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-gradient-to-r from-yellow-200/30 to-orange-200/30 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '1s' }}></div>
          </div>

          <div className="container mx-auto px-6 md:px-8 lg:px-12 relative z-10">
            <div className="grid gap-2 lg:grid-cols-2 lg:items-center lg:gap-0">
              <div className="flex flex-col items-start gap-6 text-left">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="text-5xl font-black tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl leading-[1.1]"
                >
                  <span className="inline-block animate-wave-1">Votre Menu</span> <br />
                  <span className="inline-block animate-wave-2 text-orange-600">Digital</span> <br />
                  <span className="inline-block animate-wave-3 text-slate-900">Premium.</span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="max-w-[540px] text-gray-500 text-base md:text-lg leading-relaxed"
                >
                  Créez une expérience mémorable pour vos clients. Photos HD, search intelligent, upselling automatisé et gestion des stocks en temps réel.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="flex flex-col gap-3 min-[400px]:flex-row w-full sm:w-auto"
                >
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
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative flex justify-center lg:justify-end mt-16 lg:mt-0"
              >
                {/* Mockup Container with Navy Blue Frame */}
                <div className="relative w-[220px] sm:w-[260px] aspect-[9/18.5] bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] rounded-[3rem] p-3 shadow-[0_20px_60px_-15px_rgba(30,58,95,0.4)] border-[12px] border-[#1e3a5f]">
                  <div className="w-full h-full rounded-[2rem] overflow-hidden bg-white shadow-inner">
                    <img
                      src="/mobile_menu_mockup_preview_1766768339979.png"
                      alt="Aperçu Menu Mobile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Abstract Backgrounds */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[100px]" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Featured Dishes Section (New Dynamic Section) */}
        <section id="dishes" className="py-32 bg-white relative overflow-hidden">
          <div className="container mx-auto px-6 uppercase tracking-widest text-[10px] font-black text-orange-600 mb-4 text-center">
            Expérience Gastronomique
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-center mb-16 tracking-tighter">
            Sublimez vos <span className="text-orange-600">Créations</span>.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10 px-6 max-w-7xl mx-auto">
            <FloatingDish
              image="/burger.png"
              name="Gourmet Burger"
              delay={0}
              rotate={-5}
            />
            <FloatingDish
              image="/steak.png"
              name="Ribeye Premium"
              delay={0.2}
              rotate={3}
              yOffset={40}
            />
            <FloatingDish
              image="/salad.png"
              name="Salade Fraîcheur"
              delay={0.4}
              rotate={-3}
            />
            <FloatingDish
              image="/dessert.png"
              name="Lava Cake"
              delay={0.6}
              rotate={5}
              yOffset={40}
            />
          </div>

          {/* Animated Background Text */}
          <div className="absolute top-1/2 left-0 w-full whitespace-nowrap overflow-hidden select-none pointer-events-none opacity-[0.03] text-[20vw] font-black -translate-y-1/2">
            FRESH DELICIOUS PREMIUM TASTY QUALITY
          </div>
        </section>

        {/* Features Grid with Glassmorphism */}
        <section id="features" className="py-24 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 relative overflow-hidden">
          {/* Animated Background Orbs for Glassmorphism */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-orange-300/20 to-pink-300/20 rounded-full blur-3xl animate-float-slow"></div>
            <div className="absolute bottom-40 right-32 w-80 h-80 bg-gradient-to-r from-blue-300/20 to-purple-300/20 rounded-full blur-3xl animate-float-medium"></div>
            <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-gradient-to-r from-green-300/15 to-teal-300/15 rounded-full blur-3xl animate-float-fast"></div>
          </div>

          <div className="container mx-auto px-6 md:px-8 lg:px-12 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Tout ce qu'il faut pour gérer</h2>
              <p className="mx-auto mt-4 max-w-[700px] text-gray-500 md:text-xl">
                Une suite complète d'outils pour moderniser votre établissement.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
                title="Analytics"
                description="Suivez votre chiffre d'affaires et vos meilleures ventes pour optimiser votre carte."
              />
            </div>
          </div>
        </section>

        {/* Pricing Section with Glassmorphism */}
        <section id="pricing" className="py-24 bg-white relative overflow-hidden">
          {/* Subtle Background Decoration */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-50/50 rounded-full blur-[120px] -z-10" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[120px] -z-10" />

          <div className="container mx-auto px-6 md:px-8 lg:px-12 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Des tarifs transparents</h2>
              <p className="mx-auto mt-4 max-w-[700px] text-gray-500 md:text-xl">
                Choisissez le plan qui correspond à la taille de votre restaurant.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {/* Solo Plan */}
              <div className="group flex flex-col p-8 rounded-[2.5rem] backdrop-blur-md bg-white/60 border border-slate-200/60 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-slate-900">SOLO</h3>
                  <div className="mt-4 flex items-baseline text-4xl font-black text-slate-900">
                    0 FCFA <span className="ml-1 text-sm font-medium text-slate-500">/mois</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500 leading-relaxed">Parfait pour tester le menu QR.</p>
                </div>
                <ul className="flex-1 space-y-4 mb-8">
                  <PricingItem label="Menu digital illimité" />
                  <PricingItem label="1 QR Code unique" />
                  <PricingItem label="Photos HD des plats" />
                  <PricingItem label="Partage via lien" />
                </ul>
                <Link href="/login" className="w-full">
                  <Button variant="outline" className="w-full rounded-2xl h-14 border-slate-200 hover:bg-slate-50 text-slate-600 font-bold transition-all">
                    Commencer Gratuitement
                  </Button>
                </Link>
              </div>

              {/* Pro Plan */}
              <div className="group flex flex-col p-8 rounded-[2.5rem] bg-slate-950 border-2 border-orange-500 shadow-[0_20px_50px_-12px_rgba(249,115,22,0.3)] relative transition-all duration-500 hover:-translate-y-2 scale-105 z-20">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-orange-600 text-white text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-lg">
                  LE PLUS POPULAIRE
                </div>
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-orange-400">PRO</h3>
                  <div className="mt-4 flex items-baseline text-4xl font-black text-white">
                    9.900 FCFA <span className="ml-1 text-sm font-medium text-slate-400">/mois</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-300 leading-relaxed">Pour les restaurants en pleine croissance.</p>
                </div>
                <ul className="flex-1 space-y-4 mb-8">
                  <PricingItem label="Tout le plan Solo" isDark />
                  <PricingItem label="QR Code par table" isDark />
                  <PricingItem label="Gestion des commandes" isDark />
                  <PricingItem label="Souvent acheté avec (Upselling)" isDark />
                  <PricingItem label="Support Prioritaire" isDark />
                </ul>
                <Link href="/login" className="w-full">
                  <Button className="w-full rounded-2xl h-14 bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg shadow-xl shadow-orange-900/20 active:scale-95 transition-all">
                    Devenir Pro
                  </Button>
                </Link>
              </div>

              {/* Business Plan */}
              <div className="group flex flex-col p-8 rounded-[2.5rem] backdrop-blur-md bg-white/60 border border-slate-200/60 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-slate-900">BUSINESS</h3>
                  <div className="mt-4 flex items-baseline text-4xl font-black text-slate-400">
                    Sur Devis
                  </div>
                  <p className="mt-2 text-sm text-slate-500 leading-relaxed">Pour les chaînes et franchises.</p>
                </div>
                <ul className="flex-1 space-y-4 mb-8">
                  <PricingItem label="Tout le plan Pro" />
                  <PricingItem label="Multi-établissements" />
                  <PricingItem label="Analytics Avancés" />
                  <PricingItem label="Paiement Mobile Money" />
                  <PricingItem label="Personnalisation complète" />
                </ul>
                <Button variant="outline" className="w-full rounded-2xl h-14 border-slate-200 hover:bg-slate-50 text-slate-600 font-bold transition-all">
                  Contacter l'équipe
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
          <div className="container mx-auto px-6 md:px-8 lg:px-12 text-center relative z-10">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">
              Prêt à passer au niveau supérieur ?
            </h2>
            <p className="mx-auto max-w-[600px] text-slate-300 md:text-xl mb-8">
              Rejoignez les restaurants qui utilisent Menlyla pour simplifier leur service.
            </p>
            <div className="flex flex-col items-center sm:flex-row justify-center gap-4">
              <Link href="/login" className="w-full sm:w-auto flex justify-center">
                <Button size="lg" className="bg-orange-600 hover:bg-orange-700 h-14 px-10 text-lg rounded-2xl shadow-2xl shadow-orange-500/20 w-full sm:w-auto">
                  Proposer mon Menu Gratuitement
                </Button>
              </Link>
              <Link href="https://wa.me/2250503681588" target="_blank" className="w-full sm:w-auto flex justify-center">
                <Button size="lg" variant="outline" className="h-14 px-10 text-lg rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 text-white w-full sm:w-auto">
                  📞 Échanger sur WhatsApp
                </Button>
              </Link>
            </div>
          </div>
          <div className="absolute top-0 left-0 w-full h-full bg-orange-600/5 blur-3xl rounded-full translate-y-1/2" />
        </section>
      </main>

      <footer className="border-t py-12 bg-white">
        <div className="container mx-auto px-6 md:px-8 lg:px-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="text-2xl font-black text-orange-600">MENLYLA</div>
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
              <li><Link href="/legal/mentions" className="hover:text-orange-600">Mentions Légales</Link></li>
              <li><Link href="/legal/cgu" className="hover:text-orange-600">CGV / CGU</Link></li>
              <li><Link href="/legal/confidentialite" className="hover:text-orange-600">Confidentialité</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-black text-sm uppercase tracking-widest">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>krsidoine7@gmail.com</li>
              <li>+225 05 03 68 15 88</li>
              <li>Abidjan, Côte d'Ivoire</li>
              <li><a href="https://ofika.vercel.app/krsidoine" target="_blank" rel="noopener noreferrer" className="hover:text-orange-600">Profil public</a></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-6 md:px-8 lg:px-12 mt-12 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400 font-medium">
          <p>© 2026 Menlyla. Tous droits réservés.</p>
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

function PricingItem({ label, isDark = false }: { label: string; isDark?: boolean }) {
  return (
    <li className={`flex items-center gap-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600 font-medium'}`}>
      <div className={`shrink-0 p-1 rounded-full ${isDark ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={isDark ? 'text-orange-400' : 'text-orange-600'}><path d="M20 6 9 17l-5-5" /></svg>
      </div>
      {label}
    </li>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="group flex flex-col items-center text-center p-8 rounded-2xl backdrop-blur-xl bg-white/40 border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.25)] hover:bg-white/50 transition-all duration-300 hover:scale-105 hover:-translate-y-1"
    >
      <div className="mb-5 p-4 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-slate-800">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </motion.div>
  )
}

function FloatingDish({ image, name, delay, rotate = 0, yOffset = 0 }: { image: string, name: string, delay: number, rotate?: number, yOffset?: number }) {
  const { scrollYProgress } = useScroll();
  const yNormal = useTransform(scrollYProgress, [0.3, 0.7], [yOffset, yOffset - 100]);
  const y = useSpring(yNormal, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay }}
      style={{ y }}
      className="flex flex-col items-center group cursor-pointer"
    >
      <div className="relative w-48 h-48 md:w-64 md:h-64">
        <motion.img
          src={image}
          alt={name}
          initial={{ rotate }}
          animate={{ rotate: rotate + 5, y: [0, -10, 0] }}
          transition={{
            rotate: { duration: 4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
            y: { duration: 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
          }}
          className="w-full h-full object-contain filter drop-shadow-2xl"
        />
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-black/5 blur-xl rounded-full scale-y-50 -z-10 group-hover:scale-110 transition-transform duration-500"></div>
      </div>
      <motion.p className="mt-6 text-sm font-black uppercase tracking-widest text-slate-400 group-hover:text-orange-600 transition-colors duration-300">
        {name}
      </motion.p>
    </motion.div>
  );
}
