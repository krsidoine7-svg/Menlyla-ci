# MODULE: USERS & AUTH

**Responsabilité:** Gestion des profils utilisateurs étendus et des permissions.
**Dépendances:** authentication (Supabase Auth).

---

## 1. MODÈLE DE DONNÉES (SUPABASE)

> `auth.users` est géré par Supabase. Nous créons `public.profiles` pour les données métier.

### Table `profiles`
| Colonne | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid (PK, FK) | Référence `auth.users.id` (1:1) |
| `full_name` | text | |
| `avatar_url` | text | |
| `role` | enum | `super_admin`, `resto_admin`, `staff`, `customer` |
| `restaurant_id` | uuid (FK) | Si staff/admin, lié à UN restaurant (MVP) |
| `email` | text | Copie de auth.email pour facilité de lecture |

---

## 2. MIDDLEWARE & PERMISSIONS

### Rôle-Based Access Control (RBAC)
- **Super Admin:** Accès `/super-admin/*`. Peut tout faire.
- **Resto Admin:** Accès `/admin/*`. Scope limité à son `restaurant_id`.
- **Staff:** Accès `/admin/kds` (Cuisine/Commandes) uniquement.
- **Customer:** Accès `/restaurant/[slug]/*`. Pas d'accès admin.

### Implémentation Next.js
- Middleware vérifie le cookie de session Supabase + fetch `profiles.role`.
- Redirection si rôle insuffisant.

---

## 3. UI COMPONENTS

- `LoginForm`: Email/Password.
- `StaffManager` (Admin):
  - Liste employés.
  - bouton "Inviter Staff" (envoi email magic link ou création compte).
- `UserProfile`: Edition nom/avatar.

---

## 4. SÉCURITÉ

- `profiles` est sécurisé par RLS.
  - `SELECT`: Un utilisateur peut lire son profil. Admin peut lire profils de son resto.
  - `UPDATE`: Un utilisateur peut modifier son propre `full_name`. Seul Admin peut changer `role` ou `restaurant_id`.
