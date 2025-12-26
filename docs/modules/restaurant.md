# MODULE: RESTAURANT (MULTI-TENANCY)

**Responsabilité:** Gestion des entités restaurants, configurations globales et branding.
**Dépendances:** authentication.

---

## 1. MODÈLE DE DONNÉES (SUPABASE)

### Table `restaurants`
| Colonne | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid (PK) | Identifiant unique (interne) |
| `name` | text | Nom public (ex: "Le Maquis ivoirien") |
| `slug` | text (Unique) | URL friendly (ex: "le-maquis-ivoirien") |
| `description` | text | |
| `address` | text | |
| `phone` | text | |
| `owner_id` | uuid (FK) | Lien `auth.users` (Resto Admin) |
| `is_active` | boolean | Si faux, restaurant inaccessible |
| `currency` | text | "XOF" (CFA) par défaut |

### Table `restaurant_branding`
| Colonne | Type | Description |
| :--- | :--- | :--- |
| `restaurant_id` | uuid (PK, FK) | |
| `logo_url` | text | |
| `cover_image_url` | text | |
| `primary_color` | text | Hex code (ex: "#FF5733") |
| `font_family` | text | Custom font choice |

### Table `operating_hours`
| Colonne | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid (PK) | |
| `restaurant_id` | uuid (FK) | |
| `day_of_week` | int | 0 = Sunday, 1 = Monday... |
| `open_time` | time | |
| `close_time` | time | |
| `is_closed` | boolean | |

---

## 2. API & LOGIQUE MÉTIER

### Middleware (Multi-Tenancy)
- Détection du `slug` dans l'URL ou le sous-domaine.
- Injection du `restaurant_id` dans le contexte de la requête pour RLS.

### Server Actions
- `createRestaurant(data)` (Super Admin only).
- `updateBranding(data)` (Resto Admin).
- `getRestaurantConfig(slug)` (Public).

---

## 3. UI COMPONENTS

- `RestaurantSwitcher` (Si un admin gère plusieurs restos - rare mais possible).
- `BrandingPreview`: Aperçu en temps réel des changements de couleurs.
- `ScheduleEditor`: Grille d'horaires d'ouverture.

---

## 4. SÉCURITÉ (RLS)

- **SELECT Public:**
  - `restaurants` (champs non-sensibles) accessible à tous si `is_active = true`.
- **UPDATE:**
  - `owner_id` = `auth.uid()` (Le propriétaire peut modifier).
  - `super_admin` peut tout modifier.
