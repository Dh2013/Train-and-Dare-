# Déploiement Netlify — Train & Dare

## Architecture

Netlify héberge le frontend React et ses pages HTML SEO. L’API Express reste un service séparé : les appels `/api/*` sont transmis au backend par la règle de proxy de `netlify.toml`. Le backend actuel n’est pas une fonction Netlify et ne peut pas être publié en copiant son dossier dans `dist`.

L’adresse Render configurée renvoyait HTTP 404 lors de la préparation. La remplacer par le service réel dans **les deux emplacements** de `netlify.toml` : `SEO_API_URL` et la destination `/api/*`. Le contrôle avant build refuse des destinations différentes ou une API indisponible.

La persistance doit être vérifiée sur le backend : certains modules utilisent MongoDB, tandis que les articles du blog restent enregistrés dans des fichiers JSON. Ces fichiers nécessitent un disque persistant ou une migration vers une base de données ; un filesystem éphémère ne conserve pas les modifications après redéploiement. Les identifiants administrateur et `JWT_SECRET` se configurent uniquement sur le backend, jamais dans `VITE_*`.

## Paramètres

Le fichier `netlify.toml` à la racine du dépôt définit :

- Base directory : `train-dare-frontend`.
- Publish directory : `dist`, relatif à la base.
- Node.js : version majeure 22.
- Build : installation depuis le lockfile (`npm ci`), tests, contrôle de production, compilation.
- `VITE_API_URL=/api` : les navigateurs utilisent le proxy Netlify.
- `SEO_API_URL` : URL HTTPS du backend public, avec `/api`.
- `VITE_SITE_URL` : origine HTTPS officielle, sans chemin. Si elle est absente, l’adresse principale `URL` fournie par Netlify est utilisée. Ne pas remplacer cette valeur par une URL de Deploy Preview.

## Connexion et publication

Depuis la racine du dépôt, avec Node.js 22 installé :

```powershell
npx --yes netlify-cli@27.5.2 login
npx --yes netlify-cli@27.5.2 link
npx --yes netlify-cli@27.5.2 status
npx --yes netlify-cli@27.5.2 build --context production
npx --yes netlify-cli@27.5.2 deploy --no-build
```

Pour un nouveau site, utiliser `sites:create` à la place de `link` et sélectionner le compte prévu. Pour le déploiement continu, connecter le dépôt GitHub dans Netlify et publier les modifications vérifiées dans la branche configurée. Un déploiement CLI de l’état local ne configure pas à lui seul la synchronisation Git.

Inspecter le déploiement de prévisualisation, puis publier le même build :

```powershell
npx --yes netlify-cli@27.5.2 deploy --no-build --prod
```

Ne pas utiliser l’ancien `dist` construit avec une origine localhost. Le build Netlify doit être exécuté avec l’URL officielle et l’API réelle avant publication.

## Vérification après déploiement

Depuis `train-dare-frontend` :

```powershell
npm run verify:deployment -- https://ADRESSE-REELLE-DU-SITE
```

Pour vérifier une URL de prévisualisation, définir `VITE_SITE_URL` sur l’origine de production avant cette commande. Le script lit les pages principales, leurs balises SEO, les ressources publiques et les endpoints API. Il n’envoie aucun formulaire.

Vérifier aussi dans le navigateur le menu mobile, un article, l’inscription, le formulaire de contact et la connexion administrateur. La vérification visuelle automatisée n’était pas disponible dans l’environnement de préparation.

Le build produit `robots.txt`, un sitemap des pages publiques et articles publiés, et des en-têtes `X-Robots-Tag: noindex` pour les builds de prévisualisation Netlify. Configurer le [Build Hook du blog Express](NETLIFY-BLOG-REBUILDS.md) sur Render pour automatiser la reconstruction après modification des articles publics ; une reconstruction manuelle reste nécessaire si le hook est absent ou échoue.

## Retour arrière

Dans Netlify, sélectionner un déploiement précédemment validé et utiliser l’action de restauration/publication de ce déploiement. Cela restaure les fichiers du frontend ; les données et modifications du backend ne sont pas annulées.
