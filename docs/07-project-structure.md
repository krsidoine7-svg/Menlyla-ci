# MENLYLA PROJECT STRUCTURE

Pour assurer la maintenabilité à long terme, nous utilisons une architecture **"Feature-First"** (ou Modulaire) couplée aux conventions Next.js App Router.

---

## 1. ARBORESCENCE PRINCIPALE

```bash
menlyla/
├── app/                    # Next.js App Router (Routes & Layouts)
│   ├── (auth)/             # Login, Register, Forgot Password
│   ├── (customer)/         # Application Client (Menu, Panier)
│   ├── (restaurant)/       # Backoffice Restaurant
│   ├── (super-admin)/      # Backoffice Super Admin
│   ├── api/                # Route Handlers (Webhooks, Cron)
│   └── layout.tsx          # Layout racine (Providers)
├── components/
│   ├── ui/                 # Composants primitifs shadcn (Button, Card...)
│   ├── shared/             # Composants réutilisables (Navbar, Footer...)
│   └── modules/            # ✨ CŒUR DU PROJET (Logique métier)
│       ├── menu/           # Module Menu
│       ├── orders/         # Module Commandes
│       ├── restaurant/     # Module Restaurant
│       └── ...
├── lib/                    # Utilitaires & Config
│   ├── supabase/           # Client Supabase (Server & Browser)
│   ├── utils.ts            # Helpers (Date format, cn...)
│   └── hooks/              # Hooks globaux (useToast...)
├── docs/                   # Documentation (Vous êtes ici)
├── public/                 # Assets statiques (Fonts, Images)
└── types/                  # Types TypeScript globaux (Database)
```

---

## 2. DÉTAIL D'UN MODULE (`components/modules/xyz`)

Chaque fonctionnalité métier doit être encapsulée dans son dossier module.

```bash
components/modules/menu/
├── components/           # UI Components spécifiques (ex: DishCard.tsx)
├── hooks/                # React Hooks (ex: useMenu.ts)
├── actions.ts            # Server Actions (ex: createDish)
├── types.ts              # Types spécifiques (ex: Dish, Category)
└── utils.ts              # Logique pure (ex: calculateDishPrice)
```

**Règle d'or :** Si un composant n'est utilisé QUE dans le module Menu, il DOIT être dans `modules/menu/components`, pas dans `components/shared`.

---

## 3. CONVENTIONS DE NOMMAGE

- **Dossiers :** `kebab-case` (ex: `user-profile`)
- **Fichiers Composants :** `PascalCase` (ex: `UserProfile.tsx`)
- **Fichiers Utilitaires :** `camelCase` (ex: `formatDate.ts`, `actions.ts`)
- **Hooks :** `camelCase` avec préfixe `use` (ex: `useAuth.ts`)

---

## 4. GESTION DES IMPORTS (@)

Nous utilisons les alias de chemin (Path Aliases) configurés dans `tsconfig.json` :

- `@/components` -> `src/components`
- `@/lib` -> `src/lib`
- `@/modules` -> `src/components/modules` (Recommandé pour clarté)

Exemple :
```typescript
import { Button } from "@/components/ui/button";
import { useMenu } from "@/components/modules/menu/hooks/useMenu";
```

---

## 5. PLACEMENT DU CODE

| Type de Code | Emplacement |
| :--- | :--- |
| **Page (Route)** | `app/(group)/[slug]/page.tsx` |
| **Layout** | `app/(group)/layout.tsx` |
| **Business Logic** | `components/modules/[name]/actions.ts` |
| **UI Primitive** | `components/ui/[name].tsx` |
| **Database Call** | `components/modules/[name]/actions.ts` (via Supabase) |
