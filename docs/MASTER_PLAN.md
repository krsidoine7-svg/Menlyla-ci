# MANLY MASTER PLAN

Ce document est la source de vérité pour le développement du projet MANLY. Il synthétise l'architecture, les règles et la roadmap d'implémentation.

---

## 1. RESSOURCES DU PROJET

### Documentation Clé
| Document | Description | Status |
| :--- | :--- | :--- |
| [`02-functional-breakdown.md`](./02-functional-breakdown.md) | Architecture Globale | ✅ Validé |
| [`04-security-guidelines.md`](./04-security-guidelines.md) | Règles de Sécurité OWASP | ✅ Validé |
| [`05-gdpr-compliance.md`](./05-gdpr-compliance.md) | Conformité Données (RGPD/ARTCI) | ✅ Validé |
| [`06-design-system.md`](./06-design-system.md) | Guide UI/UX (Couleurs, Composants) | ✅ Validé |
| [`07-project-structure.md`](./07-project-structure.md) | Structure des Dossiers | ✅ Validé |
| [`database/README.md`](./database/README.md) | Schéma SQL & Setup | ✅ Scripté |

### Règles (Rules)
- **Code:** [`PROJECT_RULES.md`](../rules/PROJECT_RULES.md) (TypeScript Strict, Zod, Server Actions).
- **IA:** [`AI_AGENTS_RULES.md`](../rules/AI_AGENTS_RULES.md) (Feature-First pattern).

---

## 2. ROADMAP D'IMPLÉMENTATION (PHASE DE CODAGE)

Maintenant que la planification est terminée, voici l'ordre d'exécution pour le développement.

### ÉTAPE 1 : FONDATIONS (Sprint 1)
- [ ] Initialiser le Design System (Theme CSS, Fonts).
- [ ] Installer les composants shadcn de base (Button, Card, Input, Sheet, Dialog).
- [ ] Configurer Supabase Auth (Middleware RBAC, Pages Login).
- [ ] Créer le Layout Principal (`app/layout.tsx`).

### ÉTAPE 2 : DOMAINE RESTAURANT (Sprint 1-2)
- [ ] Module `restaurant` : Création/Edition profil restaurant.
- [ ] Module `qr-code` : Génération des QR Codes par table.
- [ ] Module `menu` : CRUD Catégories et Plats (avec images).

### ÉTAPE 3 : DOMAINE CLIENT (Sprint 2)
- [ ] Vue Client (`/restaurant/[slug]`) : Affichage Menu public.
- [ ] Ajout au Panier (Contexte local ou Zustand).
- [ ] Tunnel de Commande (Validation Panier).

### ÉTAPE 4 : CORE TRANSACTIONNEL (Sprint 3)
- [ ] Module `orders` : Création commande en DB.
- [ ] Module `payment-ligos` : Intégration API Ligos (Server Action).
- [ ] Webhook Paiement : Gestion du callback succès/échec.

### ÉTAPE 5 : BACKOFFICE & OPS (Sprint 3-4)
- [ ] Dashboard Admin (Vue globale).
- [ ] KDS (Kitchen Display System) : Vue temps réel pour la cuisine.
- [ ] Gestion Équipe : Ajout de serveurs.

---

## 3. COMMANDES UTILES

- `npm run dev` : Lancer le serveur local.
- `npx shadcn@latest add [component]` : Ajouter un composant UI.
- `supabase gen types typescript` : Mettre à jour les types DB.

---

## 4. CONVENTIONS RAPIDES

> **Règle d'or :** Si tu ne sais pas où mettre un fichier, regarde `docs/07-project-structure.md`.

- **Feature-First :** Tout ce qui concerne le "Menu" va dans `components/modules/menu`.
- **Server Actions :** Toujours valider avec Zod avant d'appeler la DB.
- **Client Components :** Uniquement quand interactivité nécessaire (`'use client'`).

---

**Statut du Projet :** PRÊT POUR LE DÉVELOPPEMENT 🚀
