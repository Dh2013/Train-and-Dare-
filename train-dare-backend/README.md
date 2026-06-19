# Train & Dare — Backend

API REST Express + TypeScript pour le frontend Train & Dare. Données persistées dans des fichiers JSON (`data/`). Authentification JWT pour l’administration du blog.

## Stack

- **Node.js** + **Express**
- **TypeScript**
- **CORS**, **jsonwebtoken**
- Données : `data/programs.json`, `data/blogs.json`, `data/contacts.json`, `data/inscriptions.json`

## Démarrage

```bash
npm install
npm run dev
```

Le serveur écoute sur **http://localhost:3001** (ou la variable `PORT`).

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Développement avec rechargement (ts-node-dev) |
| `npm run build` | Compilation TypeScript → `dist/` |
| `npm start` | Lancement du build (`node dist/index.js`) |

## Routes API

| Méthode | Route | Description |
|--------|--------|-------------|
| GET | `/` | Health / message de bienvenue |
| GET | `/api/programs` | Liste des univers et programmes (`?univers=slug` optionnel) |
| GET | `/api/programs/:id` | Détail univers ou programme par id/slug |
| GET | `/api/blogs` | Liste des articles (admin) |
| GET | `/api/blogs/published` | Liste des articles publiés |
| GET | `/api/blogs/:id` | Article par id/slug |
| POST | `/api/blogs` | Créer un article (JWT admin) |
| PUT | `/api/blogs/:id` | Modifier un article (JWT admin) |
| DELETE | `/api/blogs/:id` | Supprimer un article (JWT admin) |
| POST | `/api/contact` | Envoyer un message (body : `name`, `email`, `message`) |
| POST | `/api/inscriptions` | Soumettre une candidature / inscription |
| POST | `/api/auth/login` | Connexion admin → JWT |
| GET | `/api/auth/me` | Vérification du token (Authorization: Bearer) |

## Variables d’environnement

- `PORT` : port du serveur (défaut : 3001).
- `JWT_SECRET` : secret pour signer les JWT (à changer en production).
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` : identifiants admin (défaut : admin/admin).
- `JWT_EXPIRES_IN` : expiration du token en secondes (défaut : 7 jours).

## Structure `src/`

```
src/
├── data/          # Fichiers JSON (programs, blogs, contacts, inscriptions)
├── middleware/    # auth.ts (JWT, requireAdmin)
├── routes/        # programs, blogs, contact, inscriptions, auth
└── index.ts       # Point d’entrée Express
```

## Tests

Pour ajouter des tests (ex. Jest ou Vitest), créer un script `test` dans `package.json` et des fichiers `*.test.ts` dans `src/` ou un dossier `tests/`.
