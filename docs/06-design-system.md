# MENLYLA DESIGN SYSTEM

**Vision:** Une interface "Premium", fluide, et réactive. L'expérience doit être appétissante (pour le client) et efficace (pour le restaurateur).

---

## 1. FONDATIONS (TAILWIND CONFIG)

### Couleurs
Nous utilisons les variables CSS pour supporter le theming dynamique (Dark Mode + Custom Restaurant Brand).

- **Primary:** `#F97316` (Orange vibrant - par défaut). Dynamique via `var(--primary)`.
- **Secondary:** `#1E293B` (Slate 800).
- **Background:** `#FFFFFF` (Light) / `#020817` (Dark).
- **Surface:** `#F8FAFC` (Slate 50) / `#0F172A` (Slate 900).
- **Success:** `#22C55E` (Green 500).
- **Error:** `#EF4444` (Red 500).

### Typographie
- **Font Family:** `Inter` (Google Fonts) pour sa lisibilité et modernité.
- **Headings:** Bold, Tracking Tight.
- **Body:** Regular, Leading Relaxed.

### Border Radius
- **Composants:** `0.5rem` (Rounded-md) ou `0.75rem` (Rounded-lg) pour un look soft.
- **Boutons:** `9999px` (Rounded-full) pour les CTA principaux.

---

## 2. COMPOSANTS (SHADCN/UI)

Nous utilisons `shadcn/ui` comme base. Voici les composants clés à installer :

| Composant | Usage clé |
| :--- | :--- |
| `Button` | Actions principales (Primary/Secondary/Ghost). |
| `Card` | Conteneur plats, stats dashboards. |
| `Dialog` / `Sheet` | Modales détails plats, Panier (Drawer mobile). |
| `Badge` | Tags (Allergènes, "Nouveau"). |
| `Skeleton` | Loading states (Indispensable pour UX fluide). |
| `Toast` | Notifications (Ajout panier, Erreur). |
| `Tabs` | Navigation Catégories Menu. |
| `Form` | (React Hook Form + Zod) pour Admin. |

---

## 3. UX PATTERNS & ANIMATIONS (FRAMER MOTION)

### Listes (Staggered Children)
L'apparition des plats dans le menu doit être séquencée.
```javascript
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} />
```

### Feedback Tactile
- **Active State:** Scale down léger (`0.98`) au clic sur les cartes/boutons.
- **Micro-interactions:** Icône panier secoue quand on ajoute un item.

### Mobile First
- **Navigation:** Bottom Bar pour Client (Menu / Panier / Appeler Serveur).
- **Touch Target:** Minimum 44px pour tous les boutons.

---

## 4. IMAGERIE

- **Ratio:**
  - Plats (Liste): Square (1:1) ou 4:3.
  - Plats (Détail): 16:9 ou Wide.
- **Optimisation:** Utiliser `next/image` avec `blurDataURL` ou Skeleton pendant chargement.
- **Comportement:** `object-cover` + `rounded-md`.

---

## 5. ACCESSIBILITÉ (A11Y)

- **Contraste:** Vérifier le ratio 4.5:1 (surtout si le resto change sa couleur primaire).
- **Focus:** Outline visible pour navigation clavier.
- **Screen Readers:** `aria-label` sur les boutons icônes (ex: panier).
