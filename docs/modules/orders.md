# MODULE: ORDERS (COMMANDES)

**Responsabilité:** Gestion du cycle de vie des commandes, du panier à la livraison.
**Dépendances:** menu, restaurant, tables, payment-ligos, notifications.

---

## 1. MODÈLE DE DONNÉES (SUPABASE)

### Table `orders`
| Colonne | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid (PK) | |
| `restaurant_id` | uuid (FK) | |
| `table_id` | uuid (FK) | |
| `customer_id` | uuid (FK) | (Optionnel, si client authentifié) |
| `status` | enum | `pending`, `confirmed`, `preparing`, `ready`, `delivered`, `cancelled`, `paid` |
| `total_amount` | decimal | Montant final |
| `payment_status` | enum | `pending`, `paid`, `failed`, `refunded` |
| `special_instructions` | text | Note globale pour la cuisine |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

### Table `order_items`
| Colonne | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid (PK) | |
| `order_id` | uuid (FK) | |
| `dish_id` | uuid (FK) | |
| `quantity` | int | |
| `unit_price` | decimal | Prix au moment de la commande (snapshot) |
| `total_price` | decimal | (unit_price * quantity) + modifiers |
| `modifiers` | jsonb | Snapshot des options choisies |
| `notes` | text | Note spécifique au plat (ex: "Sans oignon") |

---

## 2. MACHINE À ÉTATS (STATUS FLOW)

1. **`pending`**: Commande créée par le client, pas encore validée (ou en attente de paiement LIGOS).
2. **`confirmed`**: Validée par le système (paiement OK) ou le serveur. Apparaît en cuisine.
3. **`preparing`**: Cuisine a commencé la préparation.
4. **`ready`**: Prêt à être servi. Notification serveur/client.
5. **`delivered`**: Client servi.
6. **`paid`**: Transaction finalisée (si paiement après repas).

---

## 3. UI COMPONENTS

### Customer
- `CartDrawer`: Résumé du panier, modification quantités.
- `OrderTracking`: Timeline verticale montrant l'état (Reçu -> Préparation -> Prêt).

### Kitchen / Staff (Admin)
- `KitchenDisplaySystem (KDS)`: "Kanban" board des commandes.
  - Colonnes: A faire, En cours, Prêt.
  - Cartes: Heure commande, Table, Liste plats, Timer (depuis combien de temps).
- `OrderHistory`: Liste tabulaire pour comptabilité.

---

## 4. API & LOGIQUE

- `createOrder(cart)`:
  - Valide stocks (si activé).
  - Calcule total server-side (ne jamais faire confiance au client).
  - Crée `orders` et `order_items`.
  - Trigger notification (Realtime).

- `updateOrderStatus(id, status)`:
  - Transition d'état.
  - Envoie notif WebSocket au client ("Votre commande est prête !").

---

## 5. SÉCURITÉ (RLS)

- **Client:**
  - `INSERT`: Autorisé pour tous (anonymes).
  - `SELECT`: Uniquement ses propres commandes (via cookie session ID ou `auth.uid`).
- **Staff/Admin:**
  - `SELECT/UPDATE`: Tout accès sur leur `restaurant_id`.
