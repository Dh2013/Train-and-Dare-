# Reconstruction Netlify après modification du blog Express

## Chaîne de traitement

Admin React → mutation authentifiée `/api/blogs/*` → validation → sauvegarde JSON réussie → appel backend asynchrone du Build Hook → build Netlify de la branche configurée → lecture des articles publics Express → HTML SEO/social et sitemap régénérés → nouveau déploiement si le build réussit.

Le service est `train-dare-backend/src/services/netlifyBuild.ts`. Il utilise Fetch natif Node.js, un POST, un timeout de 5 secondes et des logs fixes ne contenant ni URL, ni corps de réponse, ni erreur brute. Le frontend ne connaît pas le hook. Les événements détaillés et les limites du traitement sont décrits dans le [README backend](../train-dare-backend/README.md#reconstruction-automatique-du-frontend).

## Configuration

1. Connecter le site Netlify au dépôt Git et déployer au moins une fois la branche de production contenant ces changements. Un hook reconstruit une branche du dépôt, pas les fichiers locaux non publiés.
2. Dans Netlify : **Project configuration → Build & deploy → Continuous deployment → Build hooks**, créer un hook nommé par exemple `Blog Express`, associé à cette branche. Les builds du site doivent être actifs.
3. Dans le service **backend Render**, créer la variable secrète `NETLIFY_BUILD_HOOK` avec l’URL fournie par Netlify. Redémarrer/redéployer le backend pour charger son environnement. Ne pas copier la valeur dans Git, dans le frontend, dans une variable `VITE_*` ou dans le chat.
4. Conserver côté build Netlify `SEO_API_URL=https://train-and-dare.onrender.com/api` et `VITE_API_URL=/api`. `VITE_SITE_URL` doit être l’origine publique officielle, ou être remplacée automatiquement par la variable principale `URL` de Netlify.
5. Vérifier que `GET /api/blogs/published` renvoie HTTP 200 et un tableau JSON avant de tester le hook. Le plugin Vite lit cet endpoint avec l’en-tête `Cache-Control: no-cache, no-store`. Seuls les articles `published` sont générés ; un nouveau build retire les anciens fichiers des articles supprimés, dépubliés ou renommés.

Le fallback `/* → /spa.html` avec statut 200 reste inchangé.

## Test manuel recommandé

1. Depuis l’éditeur React, créer puis modifier un **brouillon** : sauvegarde réussie, aucun nouveau build demandé.
2. Publier cet article : vérifier la réponse API de succès puis le log backend `[Netlify] Build requested successfully`. Dans Netlify, vérifier qu’un déploiement a été déclenché par le hook.
3. Une fois le déploiement terminé, ouvrir directement `/blog/SLUG` et afficher son **code source HTML**. Vérifier `title`, `meta[name=description]`, `link[rel=canonical]`, `og:title`, `og:description`, `og:type`, `og:url`, `og:image`, ainsi que `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`.
4. Modifier les métadonnées d’un article publié : attendre le nouveau déploiement et vérifier les nouvelles valeurs dans le HTML.
5. Dépublier puis supprimer un article public de test : vérifier les builds correspondants, l’absence dans `/api/blogs/published` et dans le sitemap. Une URL retirée utilise le fallback SPA et affiche la page introuvable après exécution de React.
6. Pour vérifier les pannes, utiliser les tests automatisés (`npm test` côté backend), qui simulent les réponses 503, erreurs réseau et timeout sans modifier la configuration de production.

Pour demander un build directement depuis le shell du backend Render, sans afficher l’URL ni l’inscrire dans l’historique :

```sh
node -e "require('./dist/services/netlifyBuild').requestNetlifyBuild()"
```

Cette commande lit la variable déjà configurée sur Render et déclenche réellement un build. Sans variable, elle ne fait rien. Un log de succès indique une requête acceptée ; consulter Netlify pour connaître le résultat final.

## Vérifications et limites

À la racine : `npm run check`, puis `npm run build`. Tests : `npm test --prefix train-dare-backend` et `npm test --prefix train-dare-frontend`. Pour reproduire le build SEO local, fournir explicitement `SEO_API_URL` et l’origine du site dans l’environnement ; le build Netlify reçoit ces valeurs via sa configuration.

Lors de l’implémentation, l’endpoint Render demandé renvoyait HTTP 404. Un Build Hook ne corrige pas cette indisponibilité : le build de production doit échouer plutôt que publier un instantané incomplet. Un build de diagnostic avec l’API locale permet de vérifier la génération sans prétendre valider Render.

Validation réalisée : 20 tests backend, 19 tests frontend et `npm run check` réussis. Le build complet avec l’API Render échoue sur HTTP 404 ; celui avec une copie locale isolée de l’API réussit. Les quatre pages d’articles ont été contrôlées dans `dist`, dont `blog/from-idea-to-action-in-7-days/index.html`, avec toutes les métadonnées SEO/sociales demandées. Le `dist` de diagnostic utilise des URL localhost et ne doit pas être publié tel quel : reconstruire avec l’API et l’origine de production fonctionnelles. Aucun vrai Build Hook n’a été appelé pendant ces vérifications.

La livraison du hook est au mieux : pas de file durable ni de retry automatique. Le backend doit rester actif le temps de la demande. Les articles programmés sont promus à la lecture, pas par un ordonnanceur autonome. Les articles restent dans des fichiers JSON et nécessitent un stockage persistant sur Render. Enfin, les aperçus des réseaux sociaux peuvent rester en cache après le déploiement.

Référence : [Netlify Build Hooks](https://docs.netlify.com/build/configure-builds/build-hooks/).
