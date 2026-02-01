# MENLYLA PROJECT RULES

Ce document définit les standards techniques impératifs pour tout contributeur (Humain ou IA) sur le projet MENLYLA.

---

## 1. TYPESCRIPT STRICT

- **NO ANY:** L'utilisation de `any` est strictement interdite. Utiliser `unknown` ou faire du type narrowing.
- **Interfaces vs Types:** Privilégier `interface` pour les objets et `type` pour les unions/intersections.
- **Strict Null Checks:** Toujours gérer les cas `null` ou `undefined`.
- **Zod:** Utiliser `z.infer<typeof schema>` pour dériver les types depuis les validateurs.

## 2. REACT & NEXT.JS

- **Server Components par défaut:** Tout est Server Component sauf si `use client` est explicitement nécessaire (State, Effects, Event Listeners).
- **Hooks Personnalisés:** Extraire la logique complexe dans des hooks (`useCart`, `useOrders`).
- **Composants Fonctionnels:** Utiliser `export function ComponentName({ prop }: Props)` plutôt que `const ComponentName: FC...`.

## 3. GESTION DES ERREURS

- **Try/Catch:** Obligatoire dans toutes les Server Actions et API Routes.
- **UI Error Boundaries:** Utiliser `error.tsx` dans chaque segment de route critique (`/dashboard`, `/menu`).
- **Toasts:** Notifier l'utilisateur en cas d'erreur asynchrone via `radix-ui/toast`.

## 4. CODE STYLE (CLEAN CODE)

- **DRY (Don't Repeat Yourself):** Si un bout de code est utilisé 2 fois, envisager une fonction. 3 fois, l'extraire.
- **KISS (Keep It Simple, Stupid):** Pas de sur-ingénierie. Une fonction = Une responsabilité.
- **Nommage:** Variables en `camelCase`, Composants en `PascalCase`, Constantes globales en `UPPER_SNAKE_CASE`.

## 5. DATABASE & SUPABASE

- **Typed Client:** Toujours utiliser le client typé `SupabaseClient<Database>`.
- **Snake Case:** Les colonnes SQL sont en `snake_case`. TypeScript mappe automatiquement ou manuellement si besoin.
- **Pas de SQL Brut dans le code:** Utiliser le Query Builder Supabase ou des RPC (Remote Procedure Calls).

## 6. GIT & COMMITS

- **Messages:** Utiliser Conventionnel Commits (`feat: add dish components`, `fix: login redirection`).
- **Atomic Commits:** Un commit par changement logique.
