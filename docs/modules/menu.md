# MODULE: MENU (DIGITAL MENU)

**Responsabilité:** Gestion du catalogue des produits, catégories, modificateurs et disponibilité.
**Dépendances:** authentication, restaurant, storage (Supabase).

---

## 1. MODÈLE DE DONNÉES (SUPABASE)

### Table `categories`
| Colonne | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid (PK) | |
| `restaurant_id` | uuid (FK) | Lien vers le restaurant |
| `name` | text | Nom (ex: "Entrées") |
| `icon_url` | text | Icône optionnelle |
| `rank` | int | Ordre d'affichage |
| `is_active` | boolean | Visibilité |

### Table `dishes` (Plats)
| Colonne | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid (PK) | |
| `restaurant_id` | uuid (FK) | |
| `category_id` | uuid (FK) | |
| `name` | text | |
| `description` | text | |
| `price` | decimal(10,2) | Prix de base |
| `image_urls` | text[] | Tableau d'URLs d'images |
| `is_available` | boolean | Disponibilité immédiate (86) |
| `is_featured` | boolean | Mis en avant ? |
| `allergens` | text[] | Liste des allergènes |
| `tags` | text[] | (ex: "Spicy", "Vegan") |

### Table `modifiers_groups` (Options)
| Colonne | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid (PK) | |
| `restaurant_id` | uuid (FK) | |
| `name` | text | (ex: "Cuisson", "Sauce", "Suppléments") |
| `min_selection` | int | 0 = optionnel, 1+ = obligatoire |
| `max_selection` | int | Limite de choix |

### Table `modifiers` (Choix possibles)
| Colonne | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid (PK) | |
| `group_id` | uuid (FK) | |
| `name` | text | (ex: "Saignant", "Mayonnaise") |
| `price_extra` | decimal(10,2) | Coût additionnel (+0.00 si gratuit) |

### Table `dish_modifiers` (Liaison)
| Colonne | Type | Description |
| :--- | :--- | :--- |
| `dish_id` | uuid (FK) | |
| `modifier_group_id` | uuid (FK) | |

---

## 2. TYPES TYPESCRIPT (`types.ts`)

```typescript
export interface Dish {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_urls: string[];
  is_available: boolean;
  category_id: string;
  // ...
}

export interface CategoryWithDishes extends Category {
  dishes: Dish[];
}
```

---

## 3. COMPOSANTS REACT

### Admin (Restaurant)
- `MenuManagePage`: Vue liste avec Drag & Drop pour trier.
- `DishForm`: Création/Edition (React Hook Form + Zod).
- `CategoryManager`: Modal pour ajouter/éditer catégories.
- `ModifierBuilder`: Interface complexe pour créer des groupes d'options.

### Customer (Client)
- `MenuCategoryList`: Scroll horizontal des catégories (Sticky).
- `DishCard`: Affichage compact (Image + Nom + Prix + Add Button).
- `DishDetailModal`: Vue détaillée + Sélection des modificateurs.

---

## 4. API & SERVER ACTIONS

- `getMenu(restaurantSlug)` (Public, Cached)
- `createDish(data)` (Protected, Resto Admin)
- `updateDishAvailability(id, status)` (Protected, Resto Admin)
- `reorderCategories(ids[])` (Protected)

---

## 5. SÉCURITÉ (RLS)

- **SELECT:**
  - `anon` peut lire si `is_active = true` et `restaurant.slug` correspond.
  - `resto_admin` peut tout lire de SON restaurant.
- **INSERT/UPDATE/DELETE:**
  - `resto_admin` uniquement pour SON `restaurant_id`.
  - `super_admin` a tous les droits.
