# PHASE 2 – DÉCOMPOSITION FONCTIONNELLE

**Projet:** MENLYLA  
**Date:** 26 décembre 2024  
**Architecture:** Modulaire (Domain-Driven Design simplifié)

---

## 1. VISION ARCHITECTURALE

Nous adoptons une **architecture modulaire** alignée avec le **Next.js App Router**. Chaque module regroupe sa logique métier, ses composants UI, ses hooks et ses types.

### Structure des Dossiers Modulaire
```
menlyla/
├── components/modules/
│   ├── [ModuleName]/
│   │   ├── components/    (UI spécifique au module)
│   │   ├── hooks/         (Logique métier + Data fetching)
│   │   ├── types.ts       (Définitions TypeScript)
│   │   └── utils.ts       (Helpers spécifiques)
├── app/
│   ├── (customer)/        (Routes client final)
│   ├── (restaurant)/      (Routes admin restaurant)
│   └── (super-admin)/     (Routes super admin)
```

---

## 2. MODULES CORE (Tableau Récapitulatif)

| Module | Responsabilité | Tables Supabase Clés |
| :--- | :--- | :--- |
| **Authentication** | Gestion accès (Super Admin, Resto Admin, Client anonyme) | `auth.users`, `profiles` |
| **Restaurant** | Profil restaurant, branding, paramètres | `restaurants`, `settings` |
| **Menu** | Plats, catégories, options, disponibilité | `categories`, `dishes`, `modifiers` |
| **QR Code** | Génération, scan, lien Table ↔ Session | `tables`, `qr_codes` |
| **Orders** | Panier, création commande, suivi statut | `orders`, `order_items` |
| **Payment** | Intégration LIGOS, webhooks, transactions | `payments`, `transactions` |
| **Notifications** | Realtime updates (cuisine, client), Email | `notifications` |
| **Analytics** | Dashboard ventes, stats plats | `sales_aggr` (vue) |

---

## 3. DÉTAIL DES MODULES PRINCIPAUX

### 3.1 Module: AUTHENTICATION & USERS
**But:** Gérer les identités et les rôles.
- **Rôles:**
  - `super_admin`: Gère la plateforme MENLYLA.
  - `resto_admin`: Gère son restaurant.
  - `staff` (Post-MVP): Serveurs/Cuisine.
  - `customer`: Client final (souvent anonyme ou via cookie session).
- **Supabase Auth:** Email/Password pour admins. Anonyme pour clients.

### 3.2 Module: RESTAURANT MANAGEMENT
**But:** Permettre la configuration multi-tenant.
- **Fonctions:**
  - Création de restaurant (Super Admin).
  - Configuration Branding (Logo, Colors).
  - Gestion des horaires.

### 3.3 Module: DIGITAL MENU
**But:** Gestion du catalogue produits.
- **Fonctions:**
  - CRUD Catégories/Plats.
  - Gestion Stocks/Disponibilité (86/Plat du jour).
  - Gestion Images (Supabase Storage).

### 3.4 Module: QR CODE & TABLES
**But:** Point d'entrée du client.
- **Workflow:**
  1. Admin génère QR pour Table X.
  2. Client scanne → URL `/restaurant/[slug]/table/[id]`.
  3. Session créée liée à la Table.

### 3.5 Module: ORDERS (COMMANDES)
**But:** Cœur transactionnel.
- **États Commande:** `pending` → `paid` (si pré-paiement) → `confirmed` → `preparing` → `ready` → `delivered` → `completed`.
- **Realtime:** Le Dashboard cuisine écoute les `INSERT` sur `orders`.

### 3.6 Module: PAYMENTS (LIGOS)
**But:** Encaisser l'argent.
- **Flow LIGOS:**
  1. `initiatePayment(amount, orderId)`
  2. Redirection ou Prompt Mobile Money.
  3. Webhook LIGOS → Update `orders.status` + Create `payment_record`.

---

## 4. SCHÉMA DE BASE DE DONNÉES (SUPABASE)

> *Note: Le schéma détaillé avec types SQL sera dans chaque fichier module.*

### Relations Clés
- `restaurants` (1) ↔ (N) `categories`
- `categories` (1) ↔ (N) `dishes`
- `restaurants` (1) ↔ (N) `tables`
- `tables` (1) ↔ (N) `orders`
- `orders` (1) ↔ (N) `order_items`
- `orders` (1) ↔ (1) `payments`

### Sécurité (RLS - Row Level Security)
- **Principe:** Isolation stricte par `restaurant_id`.
- **Règle d'or:** Une requête ne doit JAMAIS retourner de données sans filtrer par `restaurant_id` (sauf Super Admin).

---

## 5. UI COMPONENTS (SHARED)

Utilisation de `shadcn/ui` pour la cohérence.
- **Atoms:** Button, Input, Select, Badge, Card.
- **Molecules:** `MetricCard` (Dashboard), `MenuItemCard`, `CartDrawer`.
- **Organisms:** `OrderBoard` (Kanban cuisine), `MenuEditor` (Formulaire complexe).

---

## ⏭️ ÉTAPES SUIVANTES

Génération des spécifications détaillées pour chaque module dans `docs/modules/*.md`.
