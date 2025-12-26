# MODULE: ADMIN (SUPER & RESTO)

**Responsabilité:** Interface de gestion unifiée (Backoffice). Ce module est le conteneur UI des fonctionnalités administratives des autres modules.
**Dépendances:** users, restaurant, menu, orders, analytics.

---

## 1. STRUCTURE UI ADMIN (LAYOUT)

### Layout `(restaurant-admin)`
- **Sidebar:**
  - Dashboard (Home)
  - Commandes (KDS)
  - Menu (Catalogue)
  - Tables & QR
  - Analytics
  - Équipe (Staff)
  - Paramètres (Resto Profile, Horaires)
- **Header:**
  - Nom du Restaurant
  - Statut Restaurant (Ouvert/Fermé) - Switch toggle.
  - Avatar User (Dropdown Logout).

### Layout `(super-admin)`
- **Sidebar:**
  - Overview (Métriques globales plateforme)
  - Restaurants (Liste, Création, Suspension)
  - Utilisateurs (Recherche globale)
  - System (Logs, Maintenance)

---

## 2. FONCTIONNALITÉS SPÉCIFIQUES

### Gestion de l'abonnement (Billing) - Post MVP
- Gestion du statut "Premium" du restaurant.
- Blocage d'accès si impayé.

### Logs d'audit
- Table `audit_logs` pour tracer les actions sensibles (Changement prix, suppression plat, remboursement).
- Visible par Super Admin (et Resto Admin pour son scope).

---

## 3. PAGE COMPONENTS

- `AdminShell`: Wrappe le contenu avec Sidebar/Header.
- `PageHeader`: Titre + Boutons d'action (ex: "Ajouter un plat").
- `DataTable`: Composant générique shadcn table avec filtres/pagination.

---

## 4. ACCESSIBILITÉ & RESPONSIVE

- Le Backoffice doit être utilisable sur Tablette (iPad) pour les gérants en salle.
- Le KDS (Kitchen Display) doit être optimisé pour écrans tactiles larges.
