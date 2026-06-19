# Train & Dare — Frontend

Application React (Vite + TypeScript) pour Train & Dare Academy : accueil, programmes, blog, contact, inscription, espace admin (éditeur de blog).

## Stack

- **React 19** + **Vite** – SPA, HMR
- **TypeScript** – typage strict
- **React Router 7** – routes et navigation
- **Ant Design** – composants UI
- **Tailwind CSS** – utilitaires
- **Framer Motion** – animations
- **Axios** – appels API
- **DOMPurify** – sanitization HTML (blog)

## Démarrage

```bash
npm install
npm run dev
```

Ouvrir **http://localhost:5173**. L’API doit être disponible sur `VITE_API_URL` (défaut : `http://localhost:3001/api`).

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Serveur de développement Vite |
| `npm run build` | Build de production (`dist/`) |
| `npm run preview` | Prévisualisation du build |
| `npm run lint` | ESLint |
| `npm run test` | Tests unitaires (Vitest) |

## Structure `src/`

```
src/
├── api/           # Clients API (auth, blogs, contact, inscriptions, programs)
├── component/     # Composants et pages (Acceuil, Blog, ContactSection, etc.)
├── constants/     # Constantes (navigation, sections)
├── context/       # AuthContext (auth admin)
├── types/         # Types partagés (formulaires, etc.)
├── App.tsx        # Routes et layout principal
├── main.tsx       # Point d’entrée (BrowserRouter, AuthProvider, ErrorBoundary)
└── index.css      # Styles globaux
```

## Variables d’environnement

Créer un fichier `.env` à la racine du frontend :

- `VITE_API_URL` : URL de base de l’API (ex. `http://localhost:3001/api`).

## Tests

Les tests unitaires utilisent **Vitest** et **React Testing Library**. Exécution :

```bash
npm run test
```

Voir les fichiers `*.test.ts` / `*.test.tsx` dans `src/` pour les exemples.

## Build production

```bash
npm run build
```

Les artefacts sont dans `dist/`. Pour les servir en production, pointer le serveur web (nginx, etc.) vers ce dossier ou utiliser `npm run preview` pour un aperçu local.
