# MODULE: PAYMENT (LIGOS INTEGRATION)

**Responsabilité:** Gestion des transactions financières via l'agrégateur LIGOS (Mobile Money, Cartes).
**Dépendances:** orders, restaurant.

---

## 1. MODÈLE DE DONNÉES (SUPABASE)

### Table `payments`
| Colonne | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid (PK) | |
| `order_id` | uuid (FK) | Lien commande |
| `restaurant_id` | uuid (FK) | Lien restaurant (pour RLS) |
| `amount` | decimal | Montant payé |
| `currency` | text | "XOF" |
| `provider` | text | "LIGOS" |
| `provider_tx_id` | text | ID transaction chez LIGOS |
| `status` | enum | `pending`, `success`, `failed`, `cancelled` |
| `payment_method` | text | "OM", "MOMO", "WAVE", "CARD" |
| `customer_phone` | text | Numéro payeur (si dispo) |
| `created_at` | timestamp | |
| `confirmed_at` | timestamp | |

---

## 2. FLUX DE PAIEMENT (LIGOS API)

### A. Initiation (Client side -> Server Action)
1. Client clique "Payer" (Panier ou Fin de repas).
2. Appelle Server Action `initiateLigosPayment(orderId, phone, method)`.
3. Backend:
   - Récupère API Key LIGOS du restaurant (via Vault ou Settings chiffrés).
   - Construit payload LIGOS.
   - POST `https://api.lygosapp.com/v1/gateway` (ou endpoint actuel).
   - Reçoit `payment_url` ou `token`.
4. Client redirigé vers URL LIGOS ou attend prompt USSD.

### B. Confirmation (Webhook)
1. LIGOS notifie `POST /api/webhooks/ligos`.
2. **Signature Verification:**
   - Header `x-signature` vs HMAC-SHA256(body + timestamp + secret).
   - CRITIQUE pour éviter fausses validations.
3. Si signature OK:
   - Update `payments.status` = `success`.
   - Update `orders.status` = `paid` (ou `confirmed` selon workflow).
   - Trigger realtime notification "Paiement Reçu".

---

## 3. SÉCURITÉ & CLEANING

- **API Keys:** Ne JAMAIS exposer la clé privée LIGOS au client. Toujours passer par Server Action.
- **Idempotency:** Gérer les doublons de webhooks (vérifier `provider_tx_id` avant insert/update).
- **Montants:** Toujours valider le montant payé vs montant commande.

---

## 4. UI COMPONENTS

- `PaymentModal`:
  - Choix opérateur (Wave, Orange, MTN).
  - Input téléphone.
  - Spinner "En attente de validation sur votre mobile...".
- `PaymentHistory` (Admin): Liste transactions avec statuts.
