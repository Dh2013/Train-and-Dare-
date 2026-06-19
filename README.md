# Train & Dare Academy

Plateforme web d’éducation et de formation en entrepreneuriat et développement personnel (Train&Dare Academy). Projet full-stack : frontend React + Vite, backend Express + TypeScript, données en fichiers JSON.

---

## Vue d’ensemble

| Dépôt / dossier      | Rôle |
|----------------------|------|
| `train-dare-frontend` | SPA React 19, Vite, TypeScript, Ant Design, Tailwind, React Router |
| `train-dare-backend`  | API REST Express, TypeScript, stockage JSON (`data/`) |
| `docs/`               | Documentation technique (architecture, auth, blog, etc.) |

## Démarrage rapide

### Prérequis

- Node.js 18+
- npm (ou pnpm/yarn)

### Lancer le projet (backend + frontend)

**Option 1 – Un seul terminal (recommandé)**  
À la racine du projet :

```bash
npm install
npm run dev
```

Cela démarre le backend et le frontend en parallèle (si `concurrently` est disponible). Sinon, utilisez l’option 2.

**Option 2 – Deux terminaux**

Terminal 1 – Backend :

```bash
cd train-dare-backend
npm install
npm run dev
```

Le backend écoute sur **http://localhost:3001**.

Terminal 2 – Frontend :

```bash
cd train-dare-frontend
npm install
npm run dev
```

Le frontend est servi sur **http://localhost:5173**. Ouvrez cette URL dans le navigateur.

### Variables d’environnement

- **Frontend** : `train-dare-frontend/.env`  
  - `VITE_API_URL` : URL de l’API (défaut : `http://localhost:3001/api`).
- **Backend** : `train-dare-backend/.env` (optionnel)  
  - `PORT` : port du serveur (défaut : 3001).  
  - `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` : pour l’auth admin (éditeur blog).

## Structure du projet

```
Website Train and Dare/
├── README.md                 # Ce fichier
├── package.json               # Scripts racine (dev avec concurrently)
├── .prettierrc                # Formatage Prettier
├── .editorconfig              # Conventions d’édition
├── docs/                      # Documentation technique
│   ├── ARCHITECTURE-TECHNIQUE.md
│   ├── AUTH-ADMIN.md
│   ├── BLOG-EDITOR.md
│   └── ...
├── train-dare-frontend/       # Application React
│   ├── src/
│   │   ├── api/               # Clients API (programs, blogs, contact, inscriptions, auth)
│   │   ├── component/         # Composants et pages
│   │   ├── constants/         # Constantes (navigation, etc.)
│   │   ├── context/           # AuthContext
│   │   ├── types/             # Types partagés (formulaires, etc.)
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
└── train-dare-backend/        # API Express
    ├── src/
    │   ├── data/              # Fichiers JSON (programs, blogs, contacts, inscriptions)
    │   ├── middleware/        # Auth JWT
    │   ├── routes/            # programs, blogs, contact, inscriptions, auth
    │   └── index.ts
    └── package.json
```

## Routes principales (frontend)

| Route | Description |
|-------|-------------|
| `/` | Accueil (sections : accueil, à propos, programmes, coaching, FAQ, contact) |
| `/programmes/education` | Éducation entrepreneuriale (jeunes) |
| `/programmes/formation` | Formation entrepreneuriale (adultes) |
| `/programmes/parent-ado` | Espace Parent & Ado |
| `/programmes/enseignants` | Espace Enseignants |
| `/blog` | Liste des articles |
| `/blog/:slug` | Article |
| `/inscription`, `/inscription/:programmeSlug` | Formulaire d’inscription |
| `/login` | Connexion admin |
| `/editeur`, `/blog/admin` | Éditeur blog (protégé, réservé admin) |
| `/contact` | Redirection vers la section contact de l’accueil |

## API (backend)

| Méthode | Route | Description |
|--------|--------|-------------|
| GET | `/api/programs` | Liste des univers et programmes (query `?univers=slug` optionnel) |
| GET | `/api/programs/:id` | Détail univers ou programme |
| GET | `/api/blogs`, `/api/blogs/published` | Liste des articles (tous ou publiés) |
| GET | `/api/blogs/:id` | Article par id/slug |
| POST / PUT / DELETE | `/api/blogs/*` | Mutations (protégées par JWT admin) |
| POST | `/api/contact` | Envoi d’un message (body : name, email, message) |
| POST | `/api/inscriptions` | Candidature / inscription |
| POST | `/api/auth/login` | Connexion admin (username, password) → JWT |
| GET | `/api/auth/me` | Vérification du token (Authorization: Bearer) |

## Conventions et qualité

- **Formatage** : Prettier (voir `.prettierrc`).  
- **Style** : ESLint (frontend : `train-dare-frontend/eslint.config.js`).  
- **Édition** : `.editorconfig` pour indent, fin de ligne, etc.  
- **Tests** : voir `train-dare-frontend/README.md` pour les tests unitaires (Vitest).

## Documentation détaillée

- [Architecture technique](docs/ARCHITECTURE-TECHNIQUE.md) – Vue d’ensemble, stack, routes, sécurité.  
- [Auth admin](docs/AUTH-ADMIN.md) – Authentification et protection de l’éditeur.  
- [Blog & éditeur](docs/BLOG-EDITOR.md) – Gestion des articles.

## Rendu académique / professionnel

- Code commenté (JSDoc / commentaires de bloc où utile).  
- Types TypeScript (interfaces pour formulaires, API, payloads).  
- Structure claire (api, component, constants, types, context).  
- Documentation technique et diagrammes dans `docs/`.  
- Conventions (Prettier, EditorConfig) et base de tests unitaires (Vitest).

---

© 2025 Train & Dare Academy. Tous droits réservés.
