# Train & Dare Academy

Plateforme web d’éducation et de formation en entrepreneuriat et développement personnel (Train&Dare Academy). Projet full-stack : frontend React + Vite, backend Express + TypeScript, persistance MongoDB via Mongoose et fichiers JSON selon les modules.

---

## Vue d’ensemble

| Dépôt / dossier      | Rôle |
|----------------------|------|
| `train-dare-frontend` | SPA React 19, Vite, TypeScript, Ant Design, Tailwind, React Router |
| `train-dare-backend`  | API REST Express, TypeScript, MongoDB/Mongoose et stockage JSON (`data/`) |
| `docs/`               | Documentation technique (architecture, auth, blog, etc.) |

## Langages, technologies, bibliothèques et outils

Cet inventaire couvre les dépendances directes des trois `package.json`, les usages dans le code et les configurations du dépôt. Les versions ci-dessous sont les **contraintes déclarées**, pas nécessairement les versions installées. Les versions résolues et les dépendances transitives sont consignées dans les `package-lock.json` de chaque dossier.

### Langages et formats

| Langage ou format | Utilisation dans le projet |
|------------------|---------------------------|
| **TypeScript** (`.ts`) | Logique frontend et backend, types, clients API, modèles de données, tests et plugin SEO. |
| **TSX / JSX** (`.tsx`) | Syntaxe des composants et pages React, intégrée à TypeScript. |
| **JavaScript** (`.js`, `.mjs`) | Scripts Node.js, vérification du déploiement et configurations ESLint/Tailwind. |
| **HTML5** | Document d’entrée, contenu des articles et pages HTML SEO générées. |
| **CSS** | Styles des composants, responsive design et utilitaires Tailwind CSS. |
| **JSON** | Manifestes npm, lockfiles, fichiers de données et échanges API. |
| **JSON-LD / XML / texte** | Données structurées Schema.org, `sitemap.xml` et `robots.txt`. |
| **YAML** | Configuration du service backend Render. |
| **TOML** | Configuration Netlify : build, proxy, réécritures et en-têtes HTTP. |
| **Markdown** | README et documentation technique dans `docs/`. |
| **Batch Windows** (`.bat`) | Scripts de lancement et de déploiement : `start.bat`, `deploy.bat`. |
| **PowerShell / shell** | Commandes de développement et d’administration documentées ; commandes shell dans les conteneurs. |
| **SVG, JPEG, PNG, PDF** | Icônes, images, supports visuels et documents ; ce sont des formats de ressources, pas des langages de programmation. |

### Frontend : application et interface

| Technologie / paquet npm | Version déclarée | Rôle |
|--------------------------|------------------|------|
| **React** — `react` | `^19.1.0` | Composants, hooks, état et contexte de l’application. |
| **React DOM** — `react-dom` | `^19.1.0` | Montage de l’application dans le navigateur avec `createRoot`. |
| **React Router** — `react-router-dom` | `^7.6.2` | Navigation SPA avec `BrowserRouter`, routes dynamiques, redirections et routes protégées. |
| **Ant Design** — `antd` | `^5.26.5` | Formulaires, boutons, menus, cartes, typographie et composants d’interface. |
| **Ant Design Icons** — `@ant-design/icons` | `^6.1.0` | Bibliothèque d’icônes React. |
| **Tailwind CSS** — `tailwindcss` | `^4.1.11` | Classes utilitaires CSS. |
| **Tailwind pour Vite** — `@tailwindcss/vite` | `^4.1.11` | Intégration Tailwind active dans `vite.config.ts`. |
| **Framer Motion** — `framer-motion` | `^12.23.22` dans le frontend ; `^12.18.1` à la racine | Animations, transitions et apparitions des sections. |
| **Axios** — `axios` | `^1.9.0` | Appels HTTP vers les endpoints du backend. |
| **DOMPurify** — `dompurify` | `^3.3.1` | Nettoyage du HTML des contenus riches avant affichage. |

L’application utilise aussi les API Web natives : DOM, Fetch, URL, `AbortSignal`, `localStorage` pour le jeton d’authentification, Clipboard pour copier les liens et `Intl.DateTimeFormat` pour les dates. L’éditeur de contenu riche est un composant du projet ; aucune bibliothèque d’éditeur supplémentaire n’est déclarée.

### Backend : API, authentification et données

| Technologie / paquet npm | Version déclarée ou configurée | Rôle |
|--------------------------|--------------------------------|------|
| **Node.js** | `22` pour Netlify ; `22.22.0` pour Render | Exécution JavaScript, scripts et serveur backend. |
| **Express** — `express` | `^4.18.2` | API REST : programmes, articles, contact, inscriptions, newsletter et authentification. |
| **CORS** — `cors` | `^2.8.5` | Gestion des requêtes HTTP entre origines. |
| **JSON Web Token** — `jsonwebtoken` | `^9.0.3` | Signature et vérification des jetons JWT d’administration. |
| **Mongoose** — `mongoose` | `^9.3.3` | Connexion à MongoDB, schémas, modèles et validation des données. |
| **MongoDB** | Configurée côté backend | Base documentaire ; connexion via `MONGODB_URI`. |
| **DOMPurify côté serveur** — `isomorphic-dompurify` | `^3.0.0-rc.2` | Nettoyage du HTML des articles dans le backend. |
| **Modules natifs Node.js** — `fs`, `path`, `crypto`, `node:assert/strict` | Fournis par Node.js | Fichiers, chemins, fonctions cryptographiques du modèle administrateur et assertions des scripts de contrôle. |
| **Fichiers JSON** | Sans version | Données initiales, stockage de certains modules et import vers MongoDB via le script de seed. |

La présence de modèles Mongoose ne signifie pas que toutes les routes ont été migrées : le blog utilise encore des fichiers JSON. La persistance de ces fichiers doit être prévue sur l’hébergement du backend. Les variables `.env` du backend sont chargées par un lecteur interne (`src/config/env.ts`), sans dépendance directe à `dotenv`.

### Build, développement et qualité

| Outil / paquet npm | Version déclarée | Rôle |
|-------------------|------------------|------|
| **npm / npx** | Fournis avec l’environnement Node.js | Installation, lockfiles, exécution des scripts et outils CLI. npm est le gestionnaire utilisé par les configurations du projet. |
| **Vite** — `vite` | `^6.3.5` | Serveur de développement, compilation et aperçu local. |
| **SWC pour React** — `@vitejs/plugin-react-swc` | `^3.9.0` | Transformation des composants React dans Vite. |
| **TypeScript / `tsc`** — `typescript` | Frontend `~5.8.3` ; backend `^5.2.2` | Vérification des types et compilation. |
| **ts-node-dev** — `ts-node-dev` | `^2.0.0` | Exécution TypeScript et redémarrage du backend en développement. |
| **concurrently** — `concurrently` | `^9.1.0` | Lancement simultané du frontend et du backend depuis la racine. |
| **PostCSS** — `postcss` | `^8.5.6` | Outil de transformation CSS déclaré dans le frontend. |
| **Autoprefixer** — `autoprefixer` | `^10.4.21` | Outil de préfixage CSS déclaré. |
| **Tailwind pour PostCSS** — `@tailwindcss/postcss` | `^4.1.11` | Intégration PostCSS déclarée ; la configuration Vite utilise actuellement `@tailwindcss/vite`. |
| **ESLint** — `eslint`, `@eslint/js` | `^9.25.0` chacun | Analyse statique et règles JavaScript. |
| **TypeScript ESLint** — `typescript-eslint` | `^8.30.1` | Règles et analyse TypeScript pour ESLint. |
| **Règles React** — `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` | `^5.2.0`, `^0.4.19` | Vérification des hooks et compatibilité React Fast Refresh. |
| **globals** — `globals` | `^16.0.0` | Déclaration des variables globales du navigateur pour ESLint. |
| **Prettier** | Configuration `.prettierrc` | Conventions de formatage ; aucun paquet Prettier n’est déclaré directement dans les manifestes actuels. |
| **EditorConfig** | Configuration `.editorconfig` | UTF-8, indentation, fins de ligne et conventions communes aux éditeurs. |

Les déclarations TypeScript supplémentaires sont également des dépendances directes :

| Déclarations de types | Frontend | Backend |
|-----------------------|----------|---------|
| `@types/node` | `^20.19.43` | `^20.5.1` |
| `@types/react` | `^19.1.2` | — |
| `@types/react-dom` | `^19.1.2` | — |
| `@types/dompurify` | `^3.0.5` | — |
| `@types/cors` | — | `^2.8.12` |
| `@types/express` | — | `^4.17.17` |
| `@types/jsonwebtoken` | — | `^9.0.10` |

### Tests et vérification

| Bibliothèque / outil | Version déclarée | Utilisation |
|---------------------|------------------|-------------|
| **Vitest** — `vitest` | `^4.0.18` | Tests frontend : navigation, client API et métadonnées SEO. |
| **React Testing Library** — `@testing-library/react` | `^16.3.2` | Rendu et vérification des composants React. |
| **jest-dom** — `@testing-library/jest-dom` | `^6.9.1` | Assertions sur le DOM, utilisées avec Vitest ; Jest n’est pas le moteur de test du projet. |
| **user-event** — `@testing-library/user-event` | `^14.6.1` | Bibliothèque déclarée pour simuler des interactions utilisateur. |
| **jsdom** — `jsdom` | `^28.0.0` | Environnement DOM de test et analyse des pages HTML par le script de vérification du déploiement. |
| **Scripts internes Node.js** | Code du projet | `check:production` contrôle la configuration et l’API ; `verify:deployment` vérifie les réponses HTTP, métadonnées, ressources et endpoints après publication. |

### Hébergement, infrastructure et outils de déploiement

| Technologie / outil | Configuration ou usage |
|---------------------|-------------------------|
| **Git / GitHub** | Versionnement et dépôt distant ; la connexion du dépôt à Netlify pour le déploiement continu est documentée, sans être présumée active. |
| **Netlify** | Hébergement frontend préparé dans `netlify.toml` : build, proxy API, fallback SPA, cache et en-têtes HTTP. |
| **Netlify CLI** | Version `27.5.2` utilisée via `npx` pour préparer et vérifier le déploiement ; pas une dépendance npm du projet. |
| **Render** | Hébergement du backend Express prévu par `render.yaml`. |


### SEO, analyse d’audience et partage

| Technologie ou intégration | Rôle |
|----------------------------|------|
| **Plugin SEO Vite interne** | Génération du HTML des métadonnées pour les pages et les articles publiés ; contenu principal rendu par React. |
| **Schema.org / JSON-LD** | Description de l’organisation et des articles (`Organization`, `BlogPosting`). |
| **Canonical, méta descriptions, `robots`** | URL de référence, descriptions des pages et consignes d’indexation. |
| **Open Graph / Twitter Cards** | Métadonnées et images pour les aperçus de partage sur les réseaux sociaux. |
| **Sitemap XML / `robots.txt`** | Découverte des pages publiques et indication du sitemap aux robots. |
| **Google Analytics 4 / `gtag.js`** | Intégration optionnelle, activée uniquement si `VITE_GA_MEASUREMENT_ID` est renseigné. |
| **WhatsApp, Facebook, LinkedIn** | Liens de partage externes ; aucune bibliothèque SDK de ces plateformes n’est déclarée. |

Les fichiers de référence sont [package.json](package.json), [frontend/package.json](train-dare-frontend/package.json), [backend/package.json](train-dare-backend/package.json), [netlify.toml](netlify.toml) et [render.yaml](render.yaml).

## Démarrage rapide

### Prérequis

- Node.js 22 pour le développement et Netlify ; Render utilise Node.js 22.22.0.
- npm, avec les lockfiles fournis dans le projet.

### Lancer le projet (backend + frontend)

**Option 1 – Un seul terminal (recommandé)**  
À la racine du projet :

```bash
npm install
npm install --prefix train-dare-backend
npm install --prefix train-dare-frontend
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
- [Architecture MongoDB](docs/MONGODB-ARCHITECTURE.md) – Modèles, connexion et import des données.
- [Déploiement Netlify](docs/NETLIFY-DEPLOYMENT.md) – Configuration, contrôles et publication.

## Rendu académique / professionnel

- Code commenté (JSDoc / commentaires de bloc où utile).  
- Types TypeScript (interfaces pour formulaires, API, payloads).  
- Structure claire (api, component, constants, types, context).  
- Documentation technique et diagrammes dans `docs/`.  
- Conventions (Prettier, EditorConfig) et base de tests unitaires (Vitest).

---

© 2025 Train & Dare Academy. Tous droits réservés.
