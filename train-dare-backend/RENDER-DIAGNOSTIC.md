# Diagnostic du backend Render

> Mise ? jour : le nouveau service Live utilise `https://train-and-dare.onrender.com`.
> Les deux endpoints `/api/health` et `/api/blogs/published` r?pondent d?sormais HTTP 200.
> Le constat ci-dessous est conserv? comme historique du service pr?c?dent.
> Les commandes de v?rification en fin de document ciblent le nouveau service.

## Constat public

Les lectures HTTP de `https://dh2013-train-and-dare-backend.onrender.com`
sur `/`, `/api/health`, `/api/blogs/published` et `/api/blogs/not-a-real-article`
retournent toutes :

```text
HTTP 404
content-type: text/plain; charset=utf-8
x-render-routing: no-server

Not Found
```

Ce résultat situe le blocage dans le routage de la plateforme, avant le router
Express. Il ne permet pas de déterminer à lui seul si le service a été supprimé,
renommé, suspendu ou si cette URL ne correspond pas au service attendu. Le
Dashboard et les journaux du service sont nécessaires pour trancher. Aucun accès
authentifié Render n'était disponible pour cette vérification.

## Route et version Git

- `src/index.ts:23` monte `blogsRouter` sur `/api/blogs`.
- `src/routes/blogs.ts:627` déclare `GET /published`, avant `GET /` puis `GET /:id`.
- `GET /` est une route exacte, pas une route dynamique. C'est `/:id` qui pourrait
  capturer `published` si l'ordre était inversé ; ce n'est pas le cas ici.
- La combinaison est bien `GET /api/blogs/published`, sans authentification.
- Le build fraîchement compilé contient le montage dans `dist/index.js` et la
  route dans `dist/routes/blogs.js`.
- Branche locale et référence distante vérifiée par `git ls-remote` : `main`.
- HEAD et main distante au diagnostic :
  `27b6555862724ae433cca3a061318e89d23eb778` — `Fix React 19 SEO dependency conflict`.
- Ce commit contient `src/index.ts`, `src/routes/blogs.ts`, `package.json` du
  backend et `render.yaml`. La route est présente depuis le commit initial
  `2cab0a0f6f32f27bc3993fea2b886beffc0f39c5`.
- La branche configurée et le SHA actuellement déployé dans Render restent
  inconnus. Les modifications locales de reconstruction Netlify et de ce
  diagnostic ne sont pas commitées ni poussées.

Render peut conserver le dernier déploiement réussi après un échec de build.
Cependant, l'historique Git examiné ne montre aucune version antérieure sans
`/published`, et la réponse observée ne ressemble pas au 404 JSON d'Express.
Il faut comparer le dépôt et le SHA du déploiement Live, plutôt que supposer
qu'une ancienne route est en cause.

## Configuration exacte du service

| Paramètre | Valeur |
| --- | --- |
| Type | Web Service |
| Runtime | Node |
| Branch | `main` |
| Root Directory | `train-dare-backend` |
| Build Command | `npm ci --include=dev && npm run build` |
| Start Command | `npm start` |
| Health Check Path | `/api/health` |
| NODE_VERSION | `22.22.0` |
| NODE_ENV | `production` |

`npm run build` exécute exactement `tsc -p tsconfig.json && node scripts/copy-data.js`.
`npm start` exécute exactement `node dist/index.js`. Le champ `main` vaut
`dist/index.js`. Le package backend ne déclare pas de champ `engines` ; Node est
fixé par `NODE_VERSION` dans `render.yaml`. Les dépendances verrouillées demandent
notamment Node >=20.19 pour Mongoose et ^22.12 pour la branche Node 22 de jsdom.
La version 22.22.0 est celle utilisée pour les vérifications locales.

L'installation inclut explicitement les dépendances de développement nécessaires
à TypeScript, même sous `NODE_ENV=production`. Le lockfile backend est utilisé.
Ne pas ajouter un second `cd train-dare-backend` avec ce Root Directory.
Le fichier Blueprint n'est pas la preuve des réglages d'un service créé manuellement.

## Variables backend

Les noms présents dans le Blueprint sont `NODE_VERSION`, `NODE_ENV`, `JWT_SECRET`,
`JWT_EXPIRES_IN`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `MONGODB_REQUIRED`.
Les valeurs privées n'ont pas été consultées. Aucun nom manquant en production ne
peut être confirmé sans accès à l'environnement Render.

Le blog lit ses données JSON et ne requiert ni MongoDB ni `NETLIFY_BUILD_HOOK`
pour cette route publique. L'absence du hook ne cause donc pas le 404.
`JWT_SECRET`, `ADMIN_USERNAME` et `ADMIN_PASSWORD` concernent l'administration.
Si `MONGODB_URI` est fourni et `MONGODB_REQUIRED=true`, une connexion impossible
peut empêcher le démarrage global : consulter les logs avant de changer ce choix.
Le Blueprint conserve `MONGODB_REQUIRED=false`.

`PORT` est pris en compte par le serveur. `RENDER_GIT_COMMIT` est fourni par Render
et apparaît désormais sous `revision` dans `/api/health` ; seule une chaîne SHA
hexadécimale de 40 caractères est publiée, sinon `null`. Aucun secret supplémentaire
ni nouvel endpoint n'est nécessaire.

## Vérifications locales

Depuis `train-dare-backend` :

```bash
npm ci
npm run build
npm test
npm run check
```

Installation et compilation réussies ; 22 tests backend réussis, dont les 20
tests préexistants inchangés. Le nouveau test lance le véritable `dist/index.js`
dans un processus séparé, avec données temporaires et aucun accès MongoDB ou hook.
`GET /api/blogs/published` retourne HTTP 200, `application/json` et un tableau
d'articles publiés excluant les brouillons. Un article dont l'id vaut `published`
permet de distinguer explicitement cette route de `/:id`. `/api/health` expose
le SHA attendu. Un id inconnu conserve son 404 JSON.

`npm ci` signale 11 vulnérabilités de dépendances (1 faible, 4 modérées, 6 élevées).
Aucune mise à jour de dépendance n'a été effectuée dans ce diagnostic de routage.

## Actions dans Render Dashboard

1. Ouvrir le Web Service backend et comparer son URL publique exacte à l'URL
   examinée. S'il est suspendu, traiter le motif affiché et le reprendre. S'il
   n'existe plus, sa restauration ou sa recréation relève du Dashboard ; modifier
   Express ne peut pas rétablir un nom de service absent.
2. Dans Settings / Build & Deploy, vérifier le dépôt connecté, puis appliquer
   les valeurs du tableau. Vérifier aussi Health Check Path et les variables dans
   Environment. Si le service est piloté par Blueprint, synchroniser `render.yaml`.
3. Vérifier dans Deploys le SHA du déploiement Live et les logs du dernier échec.
   La route est déjà sur `main` distante ; les ajouts de ce diagnostic nécessitent
   en revanche un commit et un push avant de pouvoir être déployés. Inclure les
   fichiers backend nécessaires aux changements en cours, sans secrets ni frontend.
4. Après mise à jour du dépôt/configuration, choisir Manual Deploy / Clear build
   cache & deploy. Cela reconstruit la branche sélectionnée ; un simple Restart
   service conserverait le commit actuellement déployé.
5. Attendre l'état Live, puis vérifier `/api/health` : HTTP 200, `status: "ok"`,
   `revision` correspondant exactement au SHA déployé.
6. Vérifier l'endpoint ci-dessous : HTTP 200 et un tableau JSON. Tant que l'en-tête
   `x-render-routing: no-server` persiste, poursuivre la résolution du service
   Render ou de son URL, pas celle des routes Express.

```bash
curl -i https://train-and-dare.onrender.com/api/health
curl -i https://train-and-dare.onrender.com/api/blogs/published
```

La production n'est pas déclarée réparée : le service distant n'a pas été modifié
ni redéployé depuis cet environnement. Frontend, `netlify.toml`, fallback `/spa.html`,
service de hook et logique de publication sont restés inchangés pendant ce diagnostic.

Références officielles : [monorepos](https://render.com/docs/monorepo-support),
[déploiements](https://render.com/docs/deploys),
[variables fournies par Render](https://render.com/docs/environment-variables),
[version Node](https://render.com/docs/node-version).
