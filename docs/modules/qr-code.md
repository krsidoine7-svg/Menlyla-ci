# MODULE: QR CODE & TABLES

**Responsabilité:** Gestion des tables physiques, génération de QR Codes et association de session.
**Dépendances:** restaurant, orders.

---

## 1. MODÈLE DE DONNÉES (SUPABASE)

### Table `tables`
| Colonne | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid (PK) | |
| `restaurant_id` | uuid (FK) | |
| `number` | text | Numéro/Nom (ex: "Table 12", "Terrasse A") |
| `capacity` | int | Nombre de couverts |
| `zone_id` | uuid (FK) | (Optionnel) Zone du restaurant |
| `qr_code_id` | uuid (FK) | Lien vers la table QR |

### Table `qr_codes`
| Colonne | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid (PK) | Identifiant unique scanné |
| `restaurant_id` | uuid (FK) | |
| `table_id` | uuid (FK) | Table associée |
| `scan_count` | int | Métrique d'usage |
| `last_scanned_at` | timestamp | |
| `token` | text | Token unique dans l'URL (sécurité) |

---

## 2. WORKFLOW UTILISATEUR

### Scénario: Client scanne le QR
1. Le client scanne un QR physique.
2. URL décodée: `https://menlyla.ci/qr/[token]`.
3. Middleware Next.js intercepte `/qr/[token]`.
4. Lookup dans DB: `SELECT * FROM qr_codes WHERE token = [token]`.
5. Si valide:
   - Création d'un cookie de session "Anonymous Guest" lié à `table_id`.
   - Redirection 307 vers `/restaurant/[slug]/table/[tableId]`.
6. Si invalide: Redirection vers page d'erreur "QR Code expiré ou inconnu".

---

## 3. UI COMPONENTS (ADMIN)

- `QRCodeGenerator`:
  - Génère le PNG/SVG du QR.
  - Option pour télécharger en PDF (pour impression).
  - Personnalisation (logo au centre, couleur).
- `TableMap` (Post-MVP): Drag & drop des tables sur un plan.

---

## 4. API & SERVER ACTIONS

- `generateQRCode(tableId)`: Crée une entrée dans `qr_codes` et retourne le binaire image.
- `rotateQRCodeToken(qrId)`: Régénère le token (sécurité en cas de QR diffusé à tort).
- `resolveQRToken(token)`: (Public) Résout la redirection.

---

## 5. SÉCURITÉ

- Le `token` doit être un UUID v4 ou un NanoID long imprédictible.
- Les QR Codes ne donnent *pas* d'accès admin, ils ne font qu'associer une session client à une table pour la commande.
