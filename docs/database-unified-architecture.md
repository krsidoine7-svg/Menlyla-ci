# Architecture de Base de Données Unifiée

## 🎯 Objectif
Éliminer les duplications et créer des relations claires entre les tables.

## 📊 Structure Avant vs Après

### ❌ AVANT (Problématique)

```
auth.users
    ↓
profiles (email, full_name, avatar_url)
    ↓
restaurants (name, phone, address, owner_id)

auth.users
    ↓
passports (full_name, email, phone, bio, profile_image) ← DUPLICATION!
```

**Problèmes :**
- `full_name` existe dans `profiles` ET `passports`
- `email` existe dans `profiles` ET `passports`
- `profile_image` / `avatar_url` sont la même chose
- Pas de relation directe entre `restaurants` et `passports`

### ✅ APRÈS (Solution)

```
auth.users
    ↓
profiles (email, full_name, phone, bio, profile_image, username, social_links, custom_links)
    ↑
    │
restaurants (name, phone, email, address, owner_id → profiles.id)
```

**Avantages :**
- ✅ Une seule source de vérité pour les données utilisateur
- ✅ Relations claires : `restaurants.owner_id` → `profiles.id`
- ✅ Pas de duplication de données
- ✅ Simplicité de maintenance

## 🗂️ Structure Finale des Tables

### 1️⃣ **profiles** (Table unifiée)
```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    
    -- Informations personnelles de base
    email TEXT,
    full_name TEXT,
    phone TEXT,
    
    -- Passport / Carte de visite digitale
    username TEXT UNIQUE,              -- URL publique: /passport/johndoe
    bio TEXT,
    profile_image TEXT,
    social_links JSONB,                -- {whatsapp, instagram, facebook, linkedin}
    custom_links JSONB,                -- [{label, url}]
    
    -- Métadonnées
    role user_role DEFAULT 'customer',
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
```

**Utilisations :**
- Profil utilisateur dans l'app
- Carte de visite digitale (passport)
- Lien avec le restaurant (propriétaire)

### 2️⃣ **restaurants**
```sql
CREATE TABLE restaurants (
    id UUID PRIMARY KEY,
    
    -- Identité du restaurant
    slug TEXT UNIQUE,
    name TEXT,
    description TEXT,
    
    -- Contact du restaurant (établissement)
    phone TEXT,
    email TEXT,                        -- Email du restaurant
    address TEXT,
    
    -- Propriétaire
    owner_id UUID REFERENCES profiles(id),  -- Lien vers le propriétaire
    
    -- Configuration
    is_active BOOLEAN,
    currency TEXT,
    
    -- Métadonnées
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
```

**Relations :**
- `owner_id` → `profiles.id` : Le propriétaire du restaurant
- Le propriétaire a son propre profil/passport dans `profiles`

### 3️⃣ **restaurant_settings**
```sql
CREATE TABLE restaurant_settings (
    restaurant_id UUID PRIMARY KEY REFERENCES restaurants(id),
    
    -- Branding
    logo_url TEXT,
    banner_url TEXT,
    primary_color TEXT,
    
    -- Social du restaurant (établissement)
    social_links JSONB,                -- Réseaux sociaux DU RESTAURANT
    
    -- Configuration
    is_open BOOLEAN,
    updated_at TIMESTAMPTZ
);
```

## 🔗 Clarification des Relations

### Restaurant vs Propriétaire

| Entité | Stockage | Exemple |
|--------|----------|---------|
| **Restaurant** | `restaurants` table | Nom: "Chez Moussa", Tel: +225 07 XX XX XX |
| **Propriétaire** | `profiles` table | Nom: "Moussa Koné", Tel: +225 05 YY YY YY |

**Points importants :**
1. Le restaurant a **ses propres** coordonnées (phone, email, address)
2. Le propriétaire a **ses propres** coordonnées dans son profil
3. Ce sont **deux entités différentes** !

### Réseaux Sociaux

| Type | Stockage | Usage |
|------|----------|-------|
| **Réseaux du restaurant** | `restaurant_settings.social_links` | Facebook/Instagram de l'établissement |
| **Réseaux du propriétaire** | `profiles.social_links` | Profils personnels du propriétaire |

## 📱 Cas d'Usage

### 1. Page publique du restaurant
```typescript
// Récupérer le restaurant et son propriétaire
const { data: restaurant } = await supabase
  .from('restaurants')
  .select(`
    *,
    owner:profiles!owner_id (
      full_name,
      bio,
      profile_image,
      social_links,
      username
    )
  `)
  .eq('slug', 'chez-moussa')
  .single()

// Afficher:
// - Info du restaurant (nom, adresse, tel du restaurant)
// - Carte du propriétaire (nom, bio, photo, réseaux du propriétaire)
```

### 2. Paramètres du dashboard
```typescript
// Section "Profil & Carte de Visite"
// Formulaire 1: Info du RESTAURANT
{
  name: restaurant.name,
  phone: restaurant.phone,  // Tel du restaurant
  email: restaurant.email,  // Email du restaurant
  address: restaurant.address
}

// Formulaire 2: Carte de visite PERSONNELLE
{
  full_name: profile.full_name,
  phone: profile.phone,  // Tel personnel
  email: profile.email,  // Email personnel
  bio: profile.bio,
  social_links: profile.social_links  // Réseaux perso
}
```

## 🚀 Migration

### Étapes à suivre :

1. **Exécuter la migration**
```bash
# Fichier: supabase/migrations/20260202_unify_profiles_passports.sql
```

2. **Mettre à jour l'API `/api/passport`**
   - Modifier pour utiliser `profiles` au lieu de `passports`

3. **Mettre à jour les composants**
   - `PassportPersonalSettings`: utiliser `profiles`
   - `OwnerPassportSection`: récupérer depuis `restaurants.owner`

4. **Nettoyer**
   - Supprimer `create_passports_table.sql`
   - Mettre à jour la documentation

## ✅ Bénéfices de cette Architecture

### Normalisation
- ✅ Pas de duplication de données
- ✅ Une seule source de vérité
- ✅ Cohérence garantie

### Performance
- ✅ Moins de tables à joindre
- ✅ Moins d'espace disque
- ✅ Requêtes plus simples

### Maintenance
- ✅ Plus facile à comprendre
- ✅ Plus facile à maintenir
- ✅ Moins de bugs potentiels

### Flexibilité
- ✅ Un utilisateur peut avoir plusieurs restaurants
- ✅ Un restaurant peut avoir un propriétaire
- ✅ Séparation claire entre données personnelles et données business

## 🔐 Sécurité (RLS)

```sql
-- Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Tout le monde peut voir les profils publics (avec username)
CREATE POLICY "Public can view public profiles"
ON profiles FOR SELECT
USING (username IS NOT NULL);

-- Les utilisateurs peuvent modifier leur propre profil
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);
```

## 📝 Conclusion

Vous aviez **totalement raison** ! La duplication entre `profiles` et `passports` était inutile.

**Solution finale :**
- 🔄 Fusionner `passports` → `profiles`
- 🔗 Lien clair : `restaurants.owner_id` → `profiles.id`
- 🎯 Séparation : données du restaurant ≠ données du propriétaire
- ✨ Architecture propre, normalisée et maintenable
