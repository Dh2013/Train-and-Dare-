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
| `npm test` | Compilation et tests natifs Node.js, service Netlify et routes HTTP blog isolées |
| `npm run check` | Vérification TypeScript sans émission de fichiers |

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
| PATCH | `/api/blogs/:id/publish` | Publier un article (JWT admin) |
| PATCH | `/api/blogs/:id/unpublish` | Dépublier un article (JWT admin) |
| DELETE | `/api/blogs/:id` | Supprimer un article (JWT admin) |
| POST | `/api/contact` | Envoyer un message (body : `name`, `email`, `message`) |
| POST | `/api/inscriptions` | Soumettre une candidature / inscription |
| POST | `/api/auth/login` | Connexion admin → JWT |
| GET | `/api/auth/me` | Vérification du token (Authorization: Bearer) |

## Variables d’environnement

- `PORT` : port du serveur (défaut : 3001).
- `JWT_SECRET` : secret indépendant pour signer les JWT (obligatoire en production, au moins 32 caractères).
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` : identifiants admin du mode JSON (obligatoires et robustes en production quand MongoDB n'est pas configuré ; aucune valeur par défaut n'est acceptée).
- `JWT_EXPIRES_IN` : expiration du token en secondes (défaut : 7 jours).
- `NETLIFY_BUILD_HOOK` : URL HTTPS **privée et optionnelle** du Build Hook Netlify. La configurer uniquement dans l’environnement du backend Render, sans préfixe `VITE_`. Si elle est absente ou vide, aucun appel Netlify n’est effectué. La valeur n’est jamais renvoyée par l’API ni écrite dans les logs ; ne jamais la committer. Le service utilise uniquement `process.env.NETLIFY_BUILD_HOOK` pour cette intégration.

## Structure `src/`

```
src/
├── data/          # Fichiers JSON (programs, blogs, contacts, inscriptions)
├── middleware/    # auth.ts (JWT, requireAdmin)
├── routes/        # programs, blogs, contact, inscriptions, auth
├── services/      # netlifyBuild.ts : notification de reconstruction après sauvegarde
└── index.ts       # Point d’entrée Express
```

## Tests

`npm test` compile le backend et exécute `tests/*.test.cjs` avec `node:test`. Aucun service externe n’est appelé : le hook est simulé, les routes Express sont testées par HTTP sur un port local éphémère, et les fichiers JSON sont isolés dans un répertoire temporaire. Les vrais articles ne sont jamais modifiés par ces tests.

## Reconstruction automatique du frontend

Après une sauvegarde réussie affectant les articles publics, les routes appellent `void requestNetlifyBuild()`. Le service envoie un POST sans contenu d’article au hook, avec un timeout de 5 secondes et sans suivre les redirections. Il ne retarde pas la réponse de l’éditeur en attendant Netlify. Un échec réseau, une réponse HTTP non réussie ou une configuration invalide produisent uniquement `[Netlify] Unable to request rebuild` ; la sauvegarde et son statut HTTP de succès restent inchangés. Une acceptation produit `[Netlify] Build requested successfully` : cela confirme la demande, pas la réussite du déploiement.

| Événement sauvegardé | Reconstruction |
|---------------------|----------------|
| Création avec `status=published` | Oui |
| Création, édition ou suppression d’un brouillon | Non |
| `PUT` d’un article publié, y compris titre, contenu, slug ou métadonnées | Oui |
| `PUT` passant de brouillon/programmé à publié | Oui |
| `PUT` passant de publié à brouillon/programmé | Oui |
| `PATCH /:id/publish` | Oui, y compris si déjà publié : cette route actualise aussi la date |
| `PATCH /:id/unpublish` | Seulement si l’article était publié |
| Suppression d’un article publié | Oui, après suppression persistée |
| Modification d’une catégorie utilisée par des articles publiés | Oui, après les écritures nécessaires |
| Promotion d’un article programmé arrivé à échéance | Oui, après sa sauvegarde lors d’une lecture de l’API |
| Lecture normale, mutation refusée ou échec de sauvegarde | Non, hors éventuelle promotion programmée indépendante |

Par prudence, tout `PUT` réussi sur un article déjà publié déclenche une reconstruction, même si les champs envoyés sont identiques : `updatedAt` change aussi. Les sauvegardes privées restent sans notification. Il n’y a pas de debounce, de nouvelle tentative automatique ni de file persistante : chaque changement public déclenche sa demande. En cas d’arrêt du processus pendant l’appel ou de panne Netlify, relancer manuellement un build ou sauvegarder à nouveau un article public.

Le mécanisme de programmation existant est conservé : aucun cron n’est ajouté. Un article programmé ne devient public qu’à la prochaine lecture déclenchant `loadPosts()`. Cette transition est persistée avant le hook ; les lectures suivantes ne le déclenchent plus, notamment celle du build Netlify.

Voir [la procédure de configuration et de test manuel](../docs/NETLIFY-BLOG-REBUILDS.md). Le blog repose sur Express et ses fichiers JSON ; Strapi n’intervient pas.
## Authentification de production (validation de release)

Avec `NODE_ENV=production`, `JWT_SECRET` doit être explicitement défini, aléatoire, indépendant et comporter au moins 32 caractères. La valeur de développement connue est refusée. Le démarrage échoue avec les noms des variables invalides, jamais leurs valeurs.

Sans `MONGODB_URI` (mode JSON), `ADMIN_USERNAME` doit être explicite et `ADMIN_PASSWORD` doit comporter au moins 12 caractères et ne pas commencer par les valeurs par défaut admin/password/changeme/change-me. Ces contrôles ne mesurent pas l'entropie : utiliser un mot de passe aléatoire unique. Aucun identifiant par défaut n'est accepté en production.

Avec `MONGODB_URI`, seuls les comptes MongoDB actifs possédant le rôle `super_admin` ou `editor` peuvent se connecter. Les identifiants d'environnement ne constituent plus un accès de secours. **Avant de déployer, vérifier qu'un compte MongoDB actif est déjà provisionné si ce mode est utilisé.** Une base indisponible entraîne un HTTP 503 au login et le refus des accès protégés. Les routes publiques restent indépendantes de l'authentification (sauf `MONGODB_REQUIRED=true`, qui impose la connexion au démarrage).

Chaque accès protégé, `/api/auth/me` et lecture privée d'article revérifie l'existence, le statut et les rôles du compte. La version milliseconde `passwordChangedAt` est inscrite dans les nouveaux JWT : `setPassword()` invalide ainsi les anciens jetons, y compris dans la même seconde. Les sessions MongoDB anciennes sans version devront se reconnecter lorsque le compte possède cette date. Une modification directe du hash sans mettre à jour `passwordChangedAt` ne révoque pas les jetons : passer par `setPassword()`.

Les JWT restent stateless : pas de liste persistante de jetons révoqués, ni de révocation individuelle lors du logout du navigateur. En mode JSON, changer le mot de passe ne révoque pas les JWT déjà émis ; faire une rotation de `JWT_SECRET` et redémarrer pour invalider toutes les sessions, ou attendre `JWT_EXPIRES_IN`. La désactivation puis réactivation d'un compte peut réautoriser un ancien jeton encore valable si son mot de passe n'a pas changé.

`POST /api/auth/login` accepte au maximum 10 tentatives par adresse de connexion sur 15 minutes (succès et échecs), puis HTTP 429 avec `Retry-After`. Aucun autre endpoint n'est limité. Stockage mémoire borné à 10 000 adresses, sans nouvelle dépendance ; remise à zéro au redémarrage, quota par instance. Aucun `X-Forwarded-For` non vérifié n'est utilisé. Derrière Render/Netlify, le quota peut être partagé par les clients du même proxy : protection conservative adaptée au petit espace admin, à compléter par un limiteur en amont si le trafic augmente. La protection ne garantit pas un quota distribué entre plusieurs proxies ou instances.

`NETLIFY_BUILD_HOOK` reste optionnel et privé côté Render. Son absence n'empêche ni la lecture publique ni la sauvegarde. Aucun changement du service de rebuild non bloquant.
