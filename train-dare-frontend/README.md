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
- `VITE_SITE_URL` : origine publique officielle (HTTPS, sans chemin, paramètres ni fragment), à définir avant le build de production. Elle est prioritaire pour les URL canoniques, Open Graph, images et données structurées. Utiliser la même valeur pour les prévisualisations. Sur Netlify, la variable système `URL` (adresse principale du site) sert de repli ; les adresses de Deploy Preview ne sont pas utilisées.
- `SEO_API_URL` : URL absolue de l’API publique pour récupérer les articles publiés pendant le build, par exemple `http://localhost:3001/api` en local. Cette variable est réservée au build. Netlify utilise l’API Render déjà configurée dans `netlify.toml`.

Sans origine configurée, les URL absolues sont omises du HTML compilé avec un avertissement ; React utilise l’origine courante en développement. Aucun domaine public hypothétique n’est imposé dans le dépôt. Les builds Docker acceptent les arguments `VITE_SITE_URL` et `SEO_API_URL`.

## SEO des pages et partage social

Les titres et descriptions des pages sont centralisés dans `src/seo/pages.ts`. `src/seo/metadata.ts` produit les mêmes balises pour React et le build : description, canonical, Open Graph, cartes Twitter/X, langue française et JSON-LD. Une image JPEG publique sert de repli aux images absentes ou intégrées en `data:`.

Le plugin `build/seoPlugin.ts` génère un fichier HTML par page importante et par article publié récupéré via `SEO_API_URL`. Ces fichiers contiennent les métadonnées avant l’exécution de JavaScript. Le contenu principal reste rendu par React : il ne s’agit pas d’un prérendu complet. Si l’API explicitement configurée échoue, le build échoue pour ne pas publier silencieusement des métadonnées d’articles manquantes. Sans `SEO_API_URL`, les articles restent accessibles dans React, mais leurs balises ne sont pas générées dans le HTML initial.

Le backend Express demande automatiquement une reconstruction après une mutation affectant les articles publics si sa variable privée `NETLIFY_BUILD_HOOK` est configurée sur Render. Sans hook ou en cas d’échec, reconstruire manuellement. Voir [la configuration et les tests du hook](../docs/NETLIFY-BLOG-REBUILDS.md). Les robots des réseaux sociaux peuvent également conserver leur propre cache.

Les variantes `/inscription/:programmeSlug` présélectionnent le même formulaire et partagent la canonique `/inscription`. `/landing` partage celle de `/landing/formation`. Les pages d’administration et introuvables utilisent `noindex` sans canonical. Le fallback `spa.html` évite d’attribuer la canonique de l’accueil aux URL dynamiques non générées ; les réécritures Netlify et nginx sont adaptées en conséquence. Le statut HTTP des URL inconnues reste celui du fallback SPA (200), même si React affiche une page introuvable avec `noindex`.

Validation : `npm run test`, `npm run build`, puis `npm run preview`. Vérifier le code source des réponses HTML sur `/`, `/programmes/formation`, `/blog` et un article publié : une seule description, une seule canonical pour les pages indexables, image publique et balises Open Graph/Twitter. Configurer l’origine publique avant le build de mise en ligne.

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
