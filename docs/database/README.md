# MANLY Database Setup

Ce dossier contient les scripts SQL nécessaires pour initialiser la base de données Supabase.

## Ordre d'Exécution

1. **`01-schema.sql`** : Crée les tables et les types.
2. **`02-rls-policies.sql`** : Active la sécurité.
3. **`03-functions-triggers.sql`** : Ajoute les automatisations.
4. **`04-seed-data.sql`** : (Optionnel) Ajoute des données de test.

## Comment Exécuter

Vous pouvez copier-coller le contenu de chaque fichier dans l'**éditeur SQL** de votre dashboard Supabase.

> **Note:** Si vous utilisez le CLI Supabase, placez ces fichiers dans `supabase/migrations`.
