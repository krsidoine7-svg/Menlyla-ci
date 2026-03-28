"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Send, Rocket, Sparkles, LayoutPanelTop, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { submitLead } from "./actions";

const formSchema = z.object({
  name: z.string().min(2, { message: "Le nom doit avoir au moins 2 caractères." }),
  restaurant: z.string().min(2, { message: "Le nom du restaurant est obligatoire." }),
  whatsapp: z.string().min(8, { message: "Numéro WhatsApp invalide." }),
  email: z.string().email({ message: "Adresse email invalide." }).optional().or(z.literal("")),
});

export default function LeadFormPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      restaurant: "",
      whatsapp: "",
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const result = await submitLead(values);
      if (result.success) {
        toast.success("Demande envoyée avec succès !");
        router.push("/lead/success");
      } else {
        toast.error("Une erreur est survenue lors de l'envoi.");
      }
    } catch (error) {
      toast.error("Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden bg-[#020817]">
      {/* Animated background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-xl z-10"
      >
        <Card className="border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl overflow-hidden">
          <CardHeader className="space-y-4 pb-8 border-b border-border/40 text-center">
            <motion.div
               initial={{ scale: 0.8 }}
               animate={{ scale: 1 }}
               whileHover={{ rotate: 5 }}
               className="mx-auto w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 mb-2"
            >
              <Rocket className="text-white w-8 h-8" />
            </motion.div>
            <div className="space-y-1">
              <CardTitle className="text-3xl font-black tracking-tight flex items-center justify-center gap-2">
                Lancez votre Menu Digital <Sparkles className="text-orange-500 w-6 h-6" />
              </CardTitle>
              <CardDescription className="text-muted-foreground text-lg italic">
                C'est gratuit, rapide et sans engagement.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pt-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Votre Prénom & Nom</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: Koné Sidoine" 
                            className="bg-background/50 border-border/50 focus:border-orange-500 focus:ring-orange-500" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="restaurant"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom du Restaurant</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: Le Savoureux" 
                            className="bg-background/50 border-border/50 focus:border-orange-500 focus:ring-orange-500" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="whatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numéro WhatsApp</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="+225 07 00 00 00 00" 
                          className="bg-background/50 border-border/50 focus:border-orange-500 focus:ring-orange-500" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Optionnel)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="exemple@gmail.com" 
                          className="bg-background/50 border-border/50 focus:border-orange-500 focus:ring-orange-500" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-14 text-lg font-bold bg-orange-600 hover:bg-orange-500 transition-all shadow-xl shadow-orange-600/20 active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      Obtenir mon Menu Gratuit <Send className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground border-t border-border/40 pt-6">
                <div className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-orange-500" />
                  Zéro Frais
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-orange-500" />
                  Prêt en 5min
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-orange-500" />
                  Support 24/7
                </div>
            </div>
          </CardContent>
        </Card>

        <footer className="mt-8 text-center text-muted-foreground/60 text-sm">
          Propulsé par Menlyla • Solutions Digitales pour Restaurants
        </footer>
      </motion.div>
    </div>
  );
}
