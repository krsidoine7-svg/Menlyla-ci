# MENLYLA SECURITY GUIDELINES (OWASP)

Ce document définit les standards de sécurité pour le développement du projet MENLYLA.
**Stack:** Next.js 14+ (App Router), Supabase (Auth/DB), LIGOS (Paiement).

---

## 1. AUTHENTICATION & SESSION (Broken Authentication)

### Politique
- **Jamais de JWT en LocalStorage.** Utiliser uniquement les cookies `httpOnly` via `@supabase/ssr`.
- **MFA (Multi-Factor Auth):** Obligatoire pour les comptes `super_admin` et recommandé pour `resto_admin`.
- **Session Timeout:** Expiration par défaut des tokens Supabase (1h) avec refresh token rotation activé.

### Implémentation
- Utiliser `createClient` de `@supabase/ssr` dans les Server Components et Server Actions.
- Ne jamais exposer `SUPABASE_SERVICE_ROLE_KEY` côté client (uniquement server-side).

---

## 2. ACCESS CONTROL (Broken Access Control)

### Décorrélation Auth / App
- Ce n'est pas parce qu'un user est connecté qu'il a accès à tout.
- **Middleware Next.js:** Bloque l'accès aux routes `/admin` si le rôle dans `public.profiles` n'est pas admin.
- **Row Level Security (RLS):** C'est la barrière ultime.
  - *Règle d'or:* Si je requête `SELECT * FROM orders`, je ne dois voir QUE les commandes de MON restaurant.

### IDOR (Insecure Direct Object References)
- Ne jamais se fier à un ID envoyé par le client sans vérifier l'appartenance.
- **Bad:** `UPDATE orders SET status='paid' WHERE id=123`
- **Good:** `UPDATE orders SET status='paid' WHERE id=123 AND restaurant_id = (SELECT restaurant_id FROM user_restaurant_link WHERE user_id = auth.uid())`
- Avec RLS activé correctement, le "Bad" exemple échouera silencieusement (0 rows updated), ce qui est sécurisé.

---

## 3. DATA VALIDATION (Injection)

### Zod Obligatoire
- Toutes les Server Actions doivent valider les inputs avec **Zod**.
- Ne jamais passer `req.body` directement à une requête SQL.

```typescript
// ✅ Good
const schema = z.object({
  name: z.string().min(2),
  quantity: z.number().int().positive()
});
const data = schema.parse(formData);
```

### SQL Injection
- Supabase Client (PostgREST) protège nativement contre les injections SQL classiques.
- **Attention:** Si vous utilisez `.rpc()` avec du SQL dynamique concaténé (à éviter absolument).

---

## 4. PAIEMENT & WEBHOOKS

### Validation de Signature
- Les webhooks LIGOS doivent être validés cryptographiquement.
- Vérifier le header `X-LIGOS-SIGNATURE` avant de traiter l'événement.
- Rejeter tout webhook non signé ou avec signature invalide (Return 401).

### Idempotence
- Un webhook peut arriver 2 fois. Vérifier si `provider_tx_id` existe déjà dans `payments`.

---

## 5. XSS (Cross Site Scripting)

### React & Next.js
- React échappe automatiquement le contenu.
- **Risque:** `dangerouslySetInnerHTML`. **INTERDIT** sauf exception validée par le lead dev (ex: display rich text description nettoyé par `dompurify`).

### Content Security Policy (CSP)
- Configurer les headers CSP pour n'autoriser que les scripts de notre domaine et de Supabase/LIGOS.

---

## 6. SENSITIVE DATA EXPOSURE

- **Env Vars:**
  - `NEXT_PUBLIC_*`: Uniquement pour clés publiques (Supabase Anon Key).
  - Autres vars (Service Role, Ligos Secret, Stripe Key) : NE JAMAIS préfixer par `NEXT_PUBLIC_`.
- **Git:** Vérifier `.gitignore` pour `.env`, `.env.local`.

---

## CHECKLIST DE PRÉ-DÉPLOIEMENT

- [ ] RLS activé sur TOUTES les tables.
- [ ] Variables d'environnement de prod définies.
- [ ] Logs sensibles désactivés (pas de console.log de user data).
- [ ] Headers de sécurité (HSTS, X-Frame-Options) configurés via `next.config.js`.
