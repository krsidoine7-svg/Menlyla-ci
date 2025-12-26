# MODULE: ANALYTICS & DASHBOARD

**Responsabilité:** Agrégation des données pour fournir des insights décisions aux restaurateurs.
**Dépendances:** orders, payment-ligos, menu.

---

## 1. MODÈLE DE DONNÉES (SUPABASE VIEW)

Nous ne stockons pas les analytics bruts mais utilisons des Vues matérialisées ou des requêtes optimisées sur les tables existantes.

### Vue `daily_sales_stats`
| Colonne | Type | Description |
| :--- | :--- | :--- |
| `restaurant_id` | uuid | |
| `date` | date | Jour concerné |
| `total_revenue` | decimal | Somme des `payments.amount` |
| `order_count` | int | Nombre de commandes confirmées |
| `average_ticket` | decimal | Panier moyen |

### Vue `product_performance`
| Colonne | Type | Description |
| :--- | :--- | :--- |
| `dish_id` | uuid | |
| `restaurant_id` | uuid | |
| `sales_count` | int | Nombre d'unités vendues |
| `revenue_generated` | decimal | Chiffre d'affaires généré par ce plat |

---

## 2. FONCTIONNALITÉS CLÉS

### Dashboard "Live" (Temps réel)
- Chiffre d'affaire du jour (MAJ via Realtime Subscription sur `payments`).
- Commandes en cours.
- Tables occupées.

### Dashboard "Insights" (Historique)
- Graphique des ventes (Semaine/Mois/Année) avec `recharts`.
- Top 5 des plats les plus vendus.
- Heures de pointe (Heatmap).

---

## 3. UI COMPONENTS

- `KPICard`: Composant générique (Titre, Valeur, Trend +/-%).
- `SalesChart`: LineChart ou BarChart.
- `ProductRankingTable`: Liste triable.
- `DateRangePicker`: Sélecteur de période (shadcn/ui calendar).

---

## 4. PERFORMANCE

- Les requêtes d'analytics lourdes doivent être mises en cache ou utiliser des Edge Functions pour l'agrégation si la BDD grossit.
- Pour le MVP, des requêtes directes SQL (RPC functions) suffiront.

## 5. SÉCURITÉ

- STRICTEMENT réservé au rôle `resto_admin` pour SON restaurant.
- Le personnel (`staff`) ne voit pas les données financières (sauf permission explicite).
