"use client";

import { Settings, AlertTriangle, Clock } from "lucide-react";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-700">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="h-20 w-20 rounded-3xl bg-white/5 flex items-center justify-center border border-white/10 shadow-2xl shadow-red-600/10">
            <Settings className="h-10 w-10 text-red-600 animate-spin-slow" />
          </div>
          <img src="/logos/logo-text.svg" alt="Menlyla" className="h-8 brightness-0 invert opacity-50" />
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/10 border border-red-600/20 rounded-full">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Maintenance en cours</span>
          </div>
          
          <h1 className="text-3xl font-black text-white italic tracking-tight">
            RETOUR <span className="text-red-600">IMMÉDIAT</span>
          </h1>
          
          <p className="text-white/40 text-sm leading-relaxed font-medium">
            Nous effectuons actuellement une mise à jour critique pour améliorer votre expérience. Les menus et services de paiement seront rétablis dans quelques instants.
          </p>
        </div>

        {/* Status Card */}
        <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] flex items-center gap-4 text-left">
          <div className="h-12 w-12 rounded-2xl bg-black/40 flex items-center justify-center border border-white/5">
            <Clock className="h-5 w-5 text-white/20" />
          </div>
          <div>
            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Temps estimé</p>
            <p className="text-sm font-bold text-white italic">Moins de 15 minutes</p>
          </div>
        </div>

        <p className="text-[9px] font-medium text-white/10 uppercase tracking-[0.3em]">
          Powered by Menlyla Engine
        </p>
      </div>

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
