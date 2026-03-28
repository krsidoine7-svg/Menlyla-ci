# Ofika Passport - Carte de Visite Digitale

## Vue d'ensemble

Le système **Ofika Passport** permet aux utilisateurs de créer et partager leur carte de visite numérique personnelle. C'est une carte de visite interactive avec photo de profil, bio, liens sociaux et liens personnalisés.

## Fonctionnalités

### 1. Carte de Visite Digitale
- **Photo de profil** circulaire
- **Logo Ofika** avec nom complet
- **Bio** personnalisée
- **Actions principales**:
  - Ajouter aux contacts (génère un fichier vCard)
  - Échanger des contacts (partage via navigateur)

### 2. Liens Sociaux
Support pour:
- WhatsApp
- Instagram  
- Facebook
- LinkedIn

### 3. Liens Personnalisés
Ajoutez autant de liens que vous voulez:
- Menly menu
- Mon CV professionnel
- Portfolio
- Site web
- etc.

## Architecture

###Composants

```
components/modules/passport/
├── passport-card.tsx                    # Composant d'affichage de la carte
├── passport-settings-form.tsx           # Formulaire de gestion
└── passport-personal-settings.tsx       # Page des paramètres
```

### Routes

```
app/
├── passport/[username]/page.tsx         # Page publique du passport
└── api/passport/route.ts                # API CRUD
```

### Base de données

Table: `passports`
- `id`: UUID
- `user_id`: Lien vers auth.users
- `username`: Nom d'utilisateur unique (URL)
- `full_name`: Nom complet
- `bio`: Description
- `phone`: Téléphone (optionnel)
- `email`: Email (optionnel)
- `profile_image`: URL de la photo
- `social_links`: JSONB (whatsapp, instagram, facebook, linkedin)
- `custom_links`: JSONB array [{label, url}]

## Utilisation

### 1. Configuration dans le Dashboard

1. Aller dans **Paramètres** → **Mon Passport Digital**
2. Remplir les informations:
   - Nom d'utilisateur (pour l'URL)
   - Nom complet
   - Bio
   - Coordonnées (téléphone, email)
   - Photo de profil (URL)
3. Ajouter les réseaux sociaux
4. Ajouter des liens personnalisés
5. Enregistrer

### 2. Partager votre Passport

Votre passport sera accessible à:
```
https://votre-domaine.com/passport/[votre-username]
```

### 3. Fonctionnalités côté visiteur

- **Ajouter aux contacts**: Télécharge un fichier vCard compatible tous téléphones
- **Échanger des contacts**: Partage le lien du passport via Web Share API
- **Liens sociaux**: Accès direct aux profils sociaux
- **Liens personnalisés**: Navigation vers les ressources partagées

## Design

Le design suit les principes modernes:
- **Glassmorphism** avec ombres subtiles
- **Gradients** du blanc au gris clair
- **Animations** au survol et au clic
- **Responsive** adapté mobile et desktop
- **Premium** look professionnel

### Couleurs
- Fond principal: gradient `from-slate-50 to-white`
- Bouton principal: `bg-black`
- Bouton secondaire: `border-slate-200`
- Icônes sociales: couleurs de marque respectives

## API

### POST /api/passport
Créer ou mettre à jour un passport

**Body**:
```json
{
  "username": "koffi-renaud",
  "full_name": "Koffi Renaud",
  "bio": "Jeune ivoirien dans le domaine...",
  "phone": "+225...",
  "email": "email@example.com",
  "profile_image": "https://...",
  "social_links": {
    "whatsapp": "https://wa.me/225...",
    "instagram": "https://instagram.com/...",
    "facebook": "https://facebook.com/...",
    "linkedin": "https://linkedin.com/in/..."
  },
  "custom_links": [
    { "label": "Menly menu", "url": "https://..." },
    { "label": "Mon CV", "url": "https://..." }
  ]
}
```

### GET /api/passport
Récupérer son propre passport (authentifié)

## Migration

Exécuter le script SQL:
```bash
# Appliquer la migration
psql -U postgres -d votre_db -f supabase/migrations/create_passports_table.sql
```

Ou via Supabase Dashboard:
1. SQL Editor
2. Copier le contenu de `create_passports_table.sql`
3. Run

## Sécurité

- **RLS activé**: Row Level Security sur la table
- **Validation username**: Format `^[a-z0-9-]+$`
- **Unicité**: Un passport par utilisateur
- **Public read**: N'importe qui peut voir un passport via son URL
- **Auth required**: Création/modification nécessite authentification

## Améliorations futures

- [ ] QR Code généré automatiquement
- [ ] Statistiques de vues
- [ ] Thèmes personnalisables
- [ ] Export PDF
- [ ] Intégration NFC
- [ ] Analytics des clics sur les liens
