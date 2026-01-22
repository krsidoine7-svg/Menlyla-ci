

import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Politique de Confidentialité – Manly",
    description: "Politique de confidentialité du service Manly, expliquant la collecte, l'utilisation et la protection des données personnelles.",
};

export default function Confidentialite() {
    return (
        <section className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-12">
            <div className="max-w-3xl space-y-6">
                <h1 className="text-4xl font-bold text-orange-600">Politique de Confidentialité</h1>
                <p className="text-gray-700">
                    Ceci est un texte de remplissage pour la politique de confidentialité. Remplacez-le par le contenu réel décrivant la collecte, l’utilisation et la protection des données personnelles.
                </p>
                <p className="text-gray-700">
                    Adresse : 123 Rue Exemple, Abidjan, Côte d&#39;Ivoire
                </p>
                <p className="text-gray-700">Email : contact@manly.com</p>
                <p className="text-gray-700">Téléphone : +225 05 03 68 15 88</p>
            </div>
        </section>
    );
}
