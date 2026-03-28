"use client";

import { motion } from "framer-motion";
import { CheckCircle2, MessageSquare, ArrowRight, PartyPopper, Sparkle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LeadSuccessPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden bg-[#020817]">
      {/* Animated background elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[150px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[130px] animate-pulse delay-700" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg z-10 text-center space-y-10"
      >
        <div className="relative inline-block mb-4">
             <motion.div
                initial={{ rotate: -20, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                className="w-24 h-24 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/30 rotate-[8deg]"
             >
                <CheckCircle2 className="text-white w-12 h-12" />
             </motion.div>
             <motion.div 
               animate={{ y: [0, -10, 0] }}
               transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
               className="absolute -top-6 -right-6 text-orange-400"
             >
               <Sparkle className="w-8 h-8 fill-current" />
             </motion.div>
             <motion.div 
               animate={{ y: [0, 10, 0] }}
               transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
               className="absolute -bottom-4 -left-10 text-emerald-400"
             >
               <PartyPopper className="w-10 h-10" />
             </motion.div>
        </div>

        <div className="space-y-4">
           <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
             Félicitations ! 🎉<br />
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
               Demande Reçue.
             </span>
           </h1>
           <p className="text-muted-foreground text-lg md:text-xl max-w-md mx-auto font-medium">
             Votre restaurant est sur le point d'entrer dans l'ère digitale. Notre équipe vous contacte sur <strong>WhatsApp</strong> d'ici peu.
           </p>
        </div>

        <div className="space-y-4 pt-6">
           <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl backdrop-blur-sm flex items-center gap-5 text-left mb-6">
               <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0">
                  <MessageSquare className="text-emerald-500 w-6 h-6" />
               </div>
               <div className="space-y-1">
                  <p className="text-emerald-100 font-bold">Prochaine étape :</p>
                  <p className="text-emerald-50/80 text-sm">Préparez vos plus belles photos de plats, nous allons en avoir besoin pour votre menu !</p>
               </div>
           </div>

           <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Button asChild size="lg" className="h-14 px-8 text-lg font-bold bg-[#1e293b] hover:bg-[#334155] border-border-foreground/10 text-white rounded-2xl w-full sm:w-auto transition-all shadow-xl shadow-slate-900/50">
                <Link href="/">Retour Accueil</Link>
              </Button>
              <Button asChild size="lg" className="h-14 px-8 text-lg font-bold bg-orange-600 hover:bg-orange-500 rounded-2xl w-full sm:w-auto transition-all shadow-xl shadow-orange-600/20">
                <Link href="https://menlyla-chi.vercel.app/" target="_blank" className="flex items-center gap-2">
                  Visiter Menlyla <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
           </div>
        </div>

        <footer className="pt-12 text-muted-foreground/40 text-xs font-semibold tracking-widest uppercase">
          Menlyla • Digitalizing Hospitality
        </footer>
      </motion.div>
    </div>
  );
}
