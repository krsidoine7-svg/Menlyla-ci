

import { Metadata } from "next";

export const metadata: Metadata = {
    title: "CGU & CGV – Menlyla",
    description: "Conditions générales d'utilisation et de vente du service Menlyla.",
};

export default function CGU() {
    return (
        <section className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-12">
            <div className="max-w-3xl space-y-6">
                <h1 className="text-4xl font-bold text-orange-600">CGU & CGV</h1>
                <p className="text-gray-700">
                    Ceci est un texte de remplissage pour les Conditions Générales d'Utilisation et de Vente. Remplacez-le par le contenu réel de votre entreprise.
                </p>
                <p className="text-gray-700">
                    Vous devez accepter ces conditions pour utiliser le service Menlyla.
                </p>
            </div>
        </section>
    );
}
