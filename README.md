# o´lery — Plateforme SaaS de Gestion Immobilière

> **Developed by Ndiba Gabou Aïn Soph — o´lery**

Dashboard professionnel de gestion locative conçu pour le marché sénégalais, avec une expérience utilisateur de niveau SaaS commercial (type Stripe / Linear / Vercel).

---

## Aperçu rapide

```
olery/
│
├── dashboard.html          ← Application frontend complète (ouvrir dans le navigateur)
│
└── backend/
    ├── server.js           ← API REST Node.js — production-ready
    ├── package.json        ← Dépendances
    └── README.md           ← Ce fichier
```

---

## Démarrage instantané

### Option A — Frontend autonome *(recommandé pour commencer)*

Ouvrez simplement `dashboard.html` dans votre navigateur. L'application est 100% fonctionnelle avec des données embarquées. Aucune installation requise.

**Fonctionnalités disponibles hors-ligne :**
- Dashboard KPI dynamique
- Graphiques interactifs (barres + donut)
- CRUD complet des locataires (ajouter, voir, modifier, supprimer)
- Validation des paiements en temps réel
- Filtrage et tri des données
- Navigation multi-pages (Dashboard, Locataires, Biens, Paiements, Paramètres)
- Toasts de notification
- Responsive mobile/tablette/desktop

### Option B — Avec API REST

**Prérequis :** Node.js 18+

```bash
# Aller dans le dossier backend
cd olery/backend

# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev

# Ou en production
npm start
```

L'API démarre sur **http://localhost:3001**

---

## Architecture du projet

### Pourquoi ce choix d'architecture ?

#### Frontend : HTML5 + CSS3 + JS Vanilla

Choix délibéré pour :
- **Zéro dépendance** de build (pas de webpack, vite, etc.)
- **Déployable immédiatement** sur n'importe quel CDN (Netlify, Vercel, GitHub Pages)
- **Performance maximale** — temps de chargement < 1s même sur connexion lente
- **Maintenable** grâce à une architecture interne structurée

#### Organisation interne du JavaScript

```
DB          → Unique source de vérité (données)
State       → État réactif de l'application
Renderers   → Fonctions de rendu par composant (renderKPIs, renderTenantsTable...)
Actions     → Mutations de données (addTenant, deleteTenant, validatePayment...)
Utils       → Helpers purs (fmt, initials, getBadge...)
Navigation  → Routeur SPA léger
```

#### Flux des données

```
DB (données) → State (filtre/tri) → Renderers (HTML) → DOM
                    ↑                      ↓
               Actions ←────────── Interactions utilisateur
```

---

## Endpoints API

| Méthode  | Route                          | Description                            |
|----------|--------------------------------|----------------------------------------|
| `GET`    | `/api/dashboard`               | KPIs, stats, revenus mensuels          |
| `GET`    | `/api/locataires`              | Liste paginée (avec filtres + recherche)|
| `GET`    | `/api/locataires/:id`          | Détail d'un locataire                  |
| `POST`   | `/api/locataires`              | Créer un locataire                     |
| `PUT`    | `/api/locataires/:id`          | Modifier un locataire                  |
| `DELETE` | `/api/locataires/:id`          | Supprimer (libère le bien associé)     |
| `GET`    | `/api/biens`                   | Liste des biens (filtre par statut)    |
| `GET`    | `/api/biens/:id`               | Détail d'un bien + locataire + paiements|
| `POST`   | `/api/biens`                   | Ajouter un bien                        |
| `PUT`    | `/api/biens/:id`               | Modifier un bien                       |
| `DELETE` | `/api/biens/:id`               | Supprimer (bloqué si occupé)           |
| `GET`    | `/api/paiements`               | Liste paginée (filtre statut/mois)     |
| `POST`   | `/api/paiements`               | Enregistrer un paiement                |
| `PUT`    | `/api/paiements/:id/valider`   | Valider un paiement en attente         |

### Paramètres de query strings

```bash
# Pagination
GET /api/locataires?page=2&limit=10

# Filtres
GET /api/locataires?statut=actif
GET /api/paiements?statut=en_retard&mois=Mars%202026

# Recherche plein texte
GET /api/locataires?search=fatou

# Tri
GET /api/locataires?sort=nom&order=desc
```

### Exemples cURL

```bash
# Dashboard
curl http://localhost:3001/api/dashboard

# Créer un locataire
curl -X POST http://localhost:3001/api/locataires \
  -H "Content-Type: application/json" \
  -d '{"nom":"Aminata Fall","email":"a.fall@email.com","telephone":"+221 77 111 2222","bienId":3,"loyer":350000}'

# Valider un paiement
curl -X PUT http://localhost:3001/api/paiements/3/valider \
  -H "Content-Type: application/json" \
  -d '{"methode":"Mobile Money"}'

# Supprimer un locataire
curl -X DELETE http://localhost:3001/api/locataires/8
```

---

## Optimisations de performance

### Frontend

| Technique | Implémentation |
|-----------|----------------|
| **Rendu différé** | Les pages non actives ne sont pas renderisées |
| **State centralisé** | Un seul `DB` objet — pas de duplication mémoire |
| **Event delegation** | Les listeners sont sur les parents, pas chaque ligne |
| **CSS Variables** | Thème cohérent sans recalculs JS |
| **CSS GPU transitions** | `transform` et `opacity` uniquement (pas `width`, `height`) |
| **backdrop-filter** | Header glassmorphism sans JS |
| **Font display:swap** | Texte visible immédiatement même si la police charge |

### Backend

| Technique | Implémentation |
|-----------|----------------|
| **Pagination native** | Toutes les listes sont paginées |
| **Filtrage côté serveur** | Réduction du payload réseau |
| **Validation centralisée** | Fonction `required()` réutilisable |
| **Gestion d'erreurs** | Middleware global 404 + 500 |
| **CORS configuré** | Production-ready avec whitelist |

---

## Fonctionnalités

### Dashboard KPI
- Revenus du mois calculés dynamiquement
- Taux d'occupation en temps réel
- Compteur d'alertes
- Graphique de revenus interactif (6M / 1A / 3A)
- Donut paiements mis à jour lors des validations

### Gestion Locataires (CRUD)
- ✅ Création avec validation + attribution bien
- ✅ Consultation avec détail complet
- ✅ Modification inline
- ✅ Suppression avec confirmation
- ✅ Filtrage par statut
- ✅ Tri par colonnes
- ✅ Recherche globale (Ctrl+K)

### Gestion Biens
- Vue grille avec statut visuel
- Informations locataire en cours
- Surface, loyer, adresse

### Paiements
- Vue timeline avec actions
- Validation en un clic → met à jour tous les composants
- Filtrage par statut

### UX/UI
- Animations non bloquantes (CSS only)
- Toasts de notification (succès, erreur, info)
- Modals avec formulaires complets
- Navigation clavier (Escape, Ctrl+K)
- Sidebar responsive avec overlay mobile

---

## Stack technique

| Couche      | Technologie                          |
|-------------|--------------------------------------|
| Frontend    | HTML5 + CSS3 + JavaScript ES2022     |
| Graphiques  | Chart.js 4.4                         |
| Typographie | Cabinet Grotesk + Epilogue (Google)  |
| Backend     | Node.js 18+ + Express.js 4.18        |
| Données     | JSON en mémoire (dev)                |

---

## Roadmap — Évolution vers SaaS complet

### Phase 1 — Base de données (prioritaire)
```bash
npm install prisma @prisma/client
```
Remplacer les arrays par **PostgreSQL + Prisma ORM** :
- Schema: User → Property → Tenant → Payment
- Migrations automatiques
- Relations et requêtes optimisées

### Phase 2 — Authentification
```bash
npm install jsonwebtoken bcryptjs
```
- JWT Bearer tokens
- Rôles: ADMIN / MANAGER / READ_ONLY
- Sessions persistantes

### Phase 3 — Fonctionnalités avancées
- Génération de quittances PDF (`puppeteer`)
- Envoi d'emails automatiques (`nodemailer`)
- Rappels SMS (`Twilio`)
- Upload de documents (`multer` + S3)
- Export Excel (`xlsx`)

### Phase 4 — Déploiement
```
Frontend  → Netlify ou Vercel (gratuit)
Backend   → Railway ou Render ($5/mois)
Base de données → Supabase PostgreSQL (gratuit jusqu'à 500MB)
```

### Phase 5 — Multi-tenant SaaS
- Isolation par organisation
- Plans d'abonnement (Free / Pro / Enterprise)
- Stripe pour la facturation
- Dashboard admin global

---

## Variables d'environnement

Créer un fichier `.env` dans `backend/` :

```env
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://votre-domaine.com
DATABASE_URL=postgresql://user:pass@host:5432/olery
JWT_SECRET=votre_secret_tres_long
```

---

*Developed by Ndiba Gabou Aïn Soph — o´lery*
*© 2026 — Tous droits réservés*
