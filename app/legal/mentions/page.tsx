

import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Mentions Légales – Manly",
    description: "Mentions légales du service Manly, informations sur l'éditeur, les conditions d'utilisation et la protection des données.",
};

export default function MentionsLegales() {
    return (
        <section className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-12">
            <div className="max-w-3xl space-y-6">
                <h1 className="text-4xl font-bold text-orange-600">Mentions Légales</h1>
                <p className="text-gray-700">
                    Ceci est un texte de remplissage pour les mentions légales. Remplacez-le par le contenu réel de votre entreprise, incluant l'éditeur, le responsable de la publication, les coordonnées, etc.
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
