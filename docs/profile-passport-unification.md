# Unification des sections Profil et Passport

## Changements effectués

### 1. **Fusion des sections**
Les sections suivantes ont été fusionnées :
- **Avant** : 
  - `/dashboard/settings?section=profile` → Profil & Identité du restaurant
  - `/dashboard/settings?section=my-passport` → Mon Passport Digital (séparé)

- **Après** :
  - `/dashboard/settings?section=profile` → Profil & Carte de Visite (unifié)
  - La section `my-passport` a été supprimée
  - La section `social` a été supprimée et intégrée au profil restaurant

### 2. **Navigation mise à jour**
Dans le sidebar des paramètres :
- **Avant** : "Profil & Identité" + "Mon Passport Digital" (2 items séparés)
- **Après** : "Profil & Carte de Visite" (1 seul item)

### 3. **Structure de la section unifiée**
La section "Profil & Carte de Visite" contient maintenant :

#### A. Informations du Restaurant
- Nom de l'établissement
- Slug (URL)
- Description courte
- Téléphone
- Email
- Adresse

#### B. Carte de Visite Digitale (Passport Personnel)
- Nom d'utilisateur (pour l'URL publique)
- Nom complet
- Bio personnelle
- Photo de profil
- Téléphone personnel
- Email personnel
- Réseaux sociaux (WhatsApp, Instagram, Facebook, LinkedIn)
- Liens personnalisés

### 4. **Avantages de cette unification**
1. **Meilleure UX** : Tout est au même endroit, plus besoin de naviguer entre deux sections
2. **Logique** : Le profil du restaurant et la carte de visite du propriétaire sont liés
3. **Simplicité** : Un seul formulaire de sauvegarde pour les deux
4. **Cohérence** : Évite la confusion entre les deux types de profils

### 5. **Affichage public**
Le passport personnel du propriétaire s'affiche toujours dans la section "Mon Passeport" de la page publique du restaurant (accessible via l'icône profil dans la navbar mobile).

## Fichiers modifiés

| Fichier | Modification |
|---------|-------------|
| `components/modules/restaurant/components/unified-settings.tsx` | Ajout de `<PassportPersonalSettings />` dans la section profile |
| `components/modules/admin/sidebar.tsx` | Suppression de "Mon Passport Digital", renommage en "Profil & Carte de Visite" |
| `supabase/migrations/20260202_unify_profiles_passports.sql` | Fusion de la table `passports` dans `profiles` |
| `app/api/passport/route.ts` | Mise à jour pour utiliser la table `profiles` |

## Migration de la base de données

La migration est maintenant "profonde" :
1. Les champs du passport ont été ajoutés à la table `profiles`.
2. Les données existantes de `passports` ont été migrées vers `profiles`.
3. La table `passports` a été supprimée pour éviter toute duplication.

## Notes techniques

- Le composant `PassportPersonalSettings` a été supprimé et ses fonctionnalités ont été fusionnées directement dans `UnifiedSettings` pour une expérience "One-Click Save".
- L'action Server-side `updateRestaurant` gère maintenant simultanément la mise à jour des données du restaurant et du profil utilisateur.
- L'API `/api/passport` (GET) reste disponible mais la sauvegarde se fait désormais via les Server Actions pour une meilleure synchronisation.
- Les URL publiques `/passport/[username]` continuent de fonctionner via `profiles.username`.
