# Architecture technique – Train&Dare

Architecture cible pour une plateforme d’éducation entrepreneuriale moderne, scalable et maintenable, en cohérence avec l’identité Train&Dare.

---

## 1. Vue d’ensemble

```
                    ┌─────────────────────────────────────────────────────────┐
                    │                    Utilisateurs                            │
                    │  (visiteurs, parents, enseignants, futurs inscrits)         │
                    └───────────────────────────┬───────────────────────────────┘
                                                │ HTTPS
                    ┌───────────────────────────▼───────────────────────────────┐
                    │                  Frontend (React + Vite)                    │
                    │  • Pages : Accueil, Programmes, Ado-preneur, Parent&Ado,   │
                    │           Enseignants, Blog, Contact, Inscription          │
                    │  • État : React state / context, pas d’auth utilisateur yet  │
                    │  • API client : axios, baseURL = VITE_API_URL              │
                    └───────────────────────────┬───────────────────────────────┘
                                                │ REST JSON
                    ┌───────────────────────────▼───────────────────────────────┐
                    │                  Backend (Node.js + Express)                 │
                    │  • Routes : /api/programs, /api/blogs, /api/contact,        │
                    │             /api/inscriptions (candidatures)               │
                    │  • Validation + sanitization sur toutes les entrées          │
                    │  • Stockage : fichiers JSON (data/)                         │
                    └───────────────────────────┬───────────────────────────────┘
                                                │
                    ┌───────────────────────────▼───────────────────────────────┐
                    │                  Données (actuel)                           │
                    │  • data/programs.json   – univers + programmes              │
                    │  • data/blogs.json      – articles blog                     │
                    │  • data/contacts.json  – messages contact                  │
                    │  • data/inscriptions.json – candidatures par programme      │
                    └───────────────────────────────────────────────────────────┘
```

---

## 2. Frontend

### 2.1 Stack

- **React 19** + **Vite** : SPA, build optimisé.
- **TypeScript** : typage strict, interfaces partagées avec le backend quand pertinent.
- **React Router** : routes publiques (/, /programmes/*, /blog, /blog/admin, /contact, etc.).
- **Ant Design** : composants UI (formulaires, cartes, messages).
- **Tailwind CSS** : utilitaires et mise en page.
- **Framer Motion** : animations légères.
- **Axios** : appels API (baseURL via `VITE_API_URL`).
- **DOMPurify** : sanitization HTML côté client (blog, contenu riche).

### 2.2 Structure des dossiers (recommandée)

```
train-dare-frontend/src/
├── api/              # Clients API (blogs, programs, contact, inscriptions)
├── component/        # Composants réutilisables et pages
├── types/            # Types TS partagés (optionnel, ex. Programme, Candidature)
├── App.tsx
├── main.tsx
└── index.css
```

### 2.3 Routes principales

| Route | Rôle |
|-------|------|
| `/` | Accueil (sections : accueil, à propos, programmes, coaching, FAQ, contact) |
| `/programmes` | Liste des 3 espaces (Ado-preneur, Parent & Ado, Enseignants) |
| `/programmes/education` | Détail Éducation Entrepreneuriale / Ado-preneur |
| `/programmes/formation` | Formation professionnelle / adultes |
| `/programmes/parent-ado` | Espace Parent & Ado |
| `/programmes/enseignants` | Espace Enseignants |
| `/blog` | Liste des articles |
| `/blog/admin` | Administration du blog (à protéger par auth en production) |
| `/blog/:slug` | Article |
| `/inscription` ou `/inscription/:programmeId` | Formulaire de candidature |
| (Contact intégré en section sur `/`) | Formulaire contact |

### 2.4 Bonnes pratiques

- Charger les programmes depuis l’API pour une seule source de vérité.
- Gérer les états de chargement et d’erreur (message utilisateur, pas de crash).
- Ne jamais afficher de HTML non sanitisé (blog, descriptions riches).

---

## 3. Backend

### 3.1 Stack

- **Node.js** + **Express** : API REST.
- **TypeScript** : typage, maintenabilité.
- **CORS** : configuré pour le frontend (origine autorisée).
- **Fichiers JSON** : stockage actuel (data/). Évolutif vers SQLite/PostgreSQL si besoin.

### 3.2 Routes API

| Méthode | Route | Rôle |
|--------|--------|------|
| GET | /api/programs | Liste des univers + programmes |
| GET | /api/programs?univers=ado-preneur | Filtre par univers |
| GET | /api/programs/:id | Détail d’un programme (pour page dédiée / formulaire) |
| GET | /api/blogs | Liste des articles |
| GET | /api/blogs/:id | Article par id ou slug |
| POST | /api/blogs | Création (à protéger en prod) |
| PUT | /api/blogs/:id | Mise à jour |
| DELETE | /api/blogs/:id | Suppression |
| POST | /api/contact | Envoi message contact |
| POST | /api/inscriptions | Candidature (programme, nom, email, âge, message) |

### 3.3 Validation et sécurité

- **Corps JSON** : `express.json()` avec limites de taille.
- **Validation** : champs requis, formats (email, tranche d’âge), longueurs max.
- **Sanitization** : HTML nettoyé (DOMPurify / liste blanche) pour blog et champs texte riches.
- **Rate limiting** : à ajouter en production (ex. express-rate-limit) sur contact et inscriptions.
- **CORS** : restreindre aux origines autorisées en production.

---

## 4. Base de données (état actuel et évolution)

### 4.1 Actuel : fichiers JSON

- **programs.json** : tableau d’univers avec sous-tableau de programmes (id, slug, titre, durée, public, objectifs, lienInscription).
- **blogs.json** : articles (id, slug, title, date, tags, excerpt, content).
- **contacts.json** : messages (name, email, message, receivedAt).
- **inscriptions.json** : candidatures (programmeId, nom, email, trancheAge, message, receivedAt).

### 4.2 Évolution possible (scalable)

- **SQLite** (ou **PostgreSQL**) : tables `univers`, `programmes`, `blogs`, `contacts`, `inscriptions`.
- **Schéma minimal inscriptions** : id, programme_id, nom, email, tranche_age, message, created_at.
- **Authentification** : table `users` (admin) pour protéger `/api/blogs` (POST/PUT/DELETE) et `/blog/admin`.

---

## 5. Sécurité (synthèse)

- **Entrées** : validation + sanitization systématiques.
- **Sorties** : pas d’injection HTML (HTML sanitisé uniquement).
- **Admin blog** : en production, protéger par authentification (JWT ou session).
- **Données personnelles** : politique de confidentialité, consentement explicite sur formulaires, durée de conservation à définir (RGPD).
- **HTTPS** et en-têtes de sécurité (CSP, X-Frame-Options) en production.

---

## 6. Nommage et cohérence

- **Univers** : `ado-preneur`, `parent-ado`, `enseignants` (slugs).
- **Programmes** : `education-entrepreneuriat`, `pnl-ados-inside-out`, `education-financiere`, `bootcamp-vacances`, etc.
- **Routes front** : `/programmes/parent-ado`, `/programmes/enseignants`, `/inscription`, `/inscription/:programmeId`.
- **API** : `programmeId`, `trancheAge`, `receivedAt` (camelCase côté JSON).

Cette architecture permet d’enrichir la plateforme sans casser l’existant et en restant aligné avec la description officielle Train&Dare.
