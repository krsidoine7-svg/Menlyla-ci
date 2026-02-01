# MENLYLA GDPR & ARTCI COMPLIANCE

Ce document décrit comment MENLYLA se conforme au RGPD (Europe) et à la loi sur la protection des données de Côte d'Ivoire (ARTCI).

---

## 1. DONNÉES COLLECTÉES & FINALITÉ

| Donnée | Type | Finalité | Durée de rétention |
| :--- | :--- | :--- | :--- |
| **Email/Password** | Donnée personnelle | Authentification (Admin/Resto) | Tant que le compte est actif |
| **Numéro Téléphone** | Donnée personnelle | Paiement mobile (LIGOS) | 5 ans (Obligation légale financière) |
| **Historique Commandes** | Donnée commerciale | Service, Stats, Preuve d'achat | 3 ans glissants |
| **Cookies Session** | Donnée technique | Maintien de connexion | Session (ou 30 jours) |

> **Principe de Minimisation:** Nous ne collectons PAS la date de naissance, le genre ou l'adresse du domicile des clients finaux, car non nécessaires au service de commande.

---

## 2. DROITS DES UTILISATEURS

### Droit d'Accès & Portabilité
- Tout utilisateur (Client ou Restaurateur) peut demander un export JSON de ses données.
- **Action:** Créer une Server Action `exportUserData(userId)` qui génère un zip (Profil + Commandes).

### Droit à l'Oubli (Suppression)
- Un utilisateur peut supprimer son compte via l'interface `/settings`.
- **Mécanisme:** "Soft Delete" initial (30 jours) puis "Hard Delete".
- **Exception:** Les données de transaction financière (Paiements) sont conservées pour la comptabilité mais anonymisées (lien vers user supprimé remplacé par `NULL` ou `Deleted User`).

---

## 3. COOKIES & TRACKING

### Cookies Essentiels (Pas de consentement requis)
- `sb-access-token`: Auth Supabase.
- `menlyla-session`: Panier invité.

### Cookies Analytics (Consentement requis)
- Si nous utilisons Google Analytics ou PostHog, nous devons afficher une bannière "Accepter les cookies".
- **Pour le MVP:** Pas de cookies tiers. Analytics via SQL interne (Privacy friendly). Donc **pas de bandeau cookie nécessaire** pour le MVP.

---

## 4. SOUS-TRAITANTS (PROCESSORS)

Nous utilisons des services tiers conformes :
1. **Supabase (AWS):** Hébergement DB. (Conforme RGPD, Data Encryption at Rest).
2. **LIGOS:** Paiement. (Conforme PCI-DSS).

---

## 5. SÉCURITÉ DES DONNÉES (ARTCI)

Conformément aux exigences de l'ARTCI :
- Les données sont chiffrées en transit (SSL/TLS).
- Les mots de passe sont hashés (bcrypt via Supabase Auth).
- Les accès employés sont journalisés.

## CHECKLIST DÉVELOPPEMENT

- [ ] Bouton "Supprimer mon compte" dans les paramètres.
- [ ] Case à cocher "J'accepte les CGU et la Politique de Confidentialité" au signup.
- [ ] Politique de Confidentialité accessible en pied de page.
