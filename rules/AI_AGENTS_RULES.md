# MANLY - INSTRUCTIONS POUR AGENTS IA

Tu es un agent IA travaillant sur le projet MANLY. Voici tes directives prioritaires.

---

## 1. COMPRÉHENSION DU CONTEXTE

- **Architecture:** Feature-First Modular Monolith.
  - Ne crée PAS de fichiers épars à la racine de `components/`.
  - Cherche toujours le MODULE concerné dans `components/modules/[feature]/`.
  - Si une feature n'existe pas, propose de créer un NOUVEAU MODULE.

- **Stack:** Next.js (App Router), Supabase, Shadcn/ui, Tailwind v4.
  - N'utilise PAS `getServerSideProps` ou `getStaticProps` (c'est du Pages Router).
  - Utilise les **Server Components** (`async function Page()`) par défaut.

---

## 2. MODIFICATION DE LA BASE DE DONNÉES

- **INTERDICTION** de proposer des commandes SQL isolées dans le chat sans contexte.
- **PROCESSUS :**
  1. Vérifie `docs/database/01-schema.sql` pour l'état actuel.
  2. Crée un nouveau fichier de migration dans `docs/database/migrations/` (ex: `05-add-user-phone.sql`).
  3. Demande à l'utilisateur de l'appliquer.
  4. Ne jamais supposer que la DB a changé sans confirmation.

---

## 3. GÉNÉRATION DE CODE UI

- Utilise **uniquement** les classes utilitaires Tailwind CSS Standard (pas de styles arbitraires `w-[357px]` sauf exception).
- Réutilise les composants `components/ui` (Button, Input, etc.).
- Si tu dois créer un composant complexe, décompose-le en sous-composants dans le dossier du module.

---

## 4. SÉCURITÉ ET QUALITÉ

- **ZOD:** Valide CHAQUE input utilisateur. Pas d'exception.
- **TYPESCRIPT:** Ne produis JAMAIS de code avec `any`. Si tu ne connais pas le type, cherche-le dans `types/` ou définis-le.
- **RLS:** Si tu écris une requête SQL ou un appel Supabase, demande-toi : "Est-ce que je filtre bien par `restaurant_id` ?"

---

## 5. DOCUMENTATION

- Si tu modifies une logique métier importante, mets à jour le fichier de module correspondant dans `docs/modules/`.
- Tiens à jour le `docs/MASTER_PLAN.md` (si tu termines une tâche majeure).
