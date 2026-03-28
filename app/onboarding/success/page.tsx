'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Rocket, ArrowRight, Star, PartyPopper } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function OnboardingSuccessPage() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-100/50 rounded-full blur-[120px] -z-10 animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-100/50 rounded-full blur-[120px] -z-10" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-lg z-10"
            >
                <Card className="border-none shadow-[0_32px_80px_-20px_rgba(0,0,0,0.1)] rounded-[3rem] overflow-hidden bg-white/80 backdrop-blur-xl border border-white/50">
                    <div className="h-2 bg-gradient-to-r from-orange-500 via-yellow-500 to-green-500 w-full" />

                    <CardHeader className="text-center pt-12 pb-6">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                            className="mx-auto h-28 w-28 bg-gradient-to-tr from-green-500 to-emerald-400 rounded-3xl flex items-center justify-center text-white mb-8 shadow-2xl shadow-green-500/30 rotate-12"
                        >
                            <PartyPopper className="h-14 w-14" />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <CardTitle className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                                Paiement Confirmé ! <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-400">Bienvenue en PRO.</span>
                            </CardTitle>
                        </motion.div>
                    </CardHeader>

                    <CardContent className="p-8 px-10 space-y-8 text-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="space-y-4"
                        >
                            <p className="text-slate-600 text-lg font-medium leading-relaxed">
                                Félicitations ! Votre restaurant est maintenant activé avec toutes les fonctionnalités Premium.
                            </p>

                            <div className="flex items-center justify-center gap-6 py-2">
                                <Badge icon={<CheckCircle2 className="w-4 h-4" />} label="PRO Activé" color="text-green-600 bg-green-50" />
                                <Badge icon={<Star className="w-4 h-4" />} label="QR Tables" color="text-orange-600 bg-orange-50" />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="pt-4"
                        >
                            <Link href="/dashboard" className="block transform transition-all active:scale-95">
                                <Button size="lg" className="w-full bg-slate-900 hover:bg-black text-white font-black py-8 rounded-2xl shadow-2xl shadow-slate-900/20 group relative overflow-hidden">
                                    <span className="relative z-10 flex items-center justify-center gap-3 text-lg">
                                        Accéder à mon Dashboard
                                        <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                                    </span>
                                </Button>
                            </Link>
                        </motion.div>

                        <p className="text-xs text-slate-400 font-medium">
                            Votre facture vous sera envoyée par email dans quelques instants.
                        </p>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Decorative Stars */}
            <DecorativeStar top="20%" left="15%" delay={1} />
            <DecorativeStar top="70%" right="10%" delay={1.2} />
            <DecorativeStar top="40%" right="20%" delay={0.8} />
        </div>
    )
}

function Badge({ icon, label, color }: { icon: any, label: string, color: string }) {
    return (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider ${color}`}>
            {icon}
            {label}
        </div>
    )
}

function DecorativeStar({ top, left, right, delay }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.4, scale: 1 }}
            transition={{ delay, duration: 1, repeat: Infinity, repeatType: "reverse" }}
            className="absolute hidden md:block"
            style={{ top, left, right }}
        >
            <Star className="text-orange-500 fill-orange-500 w-6 h-6" />
        </motion.div>
    )
}

