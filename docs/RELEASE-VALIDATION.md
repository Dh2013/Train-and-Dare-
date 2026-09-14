# Validation finale avant commit

Cette validation porte sur le code local préparé pour Render et Netlify. Aucun commit, push ou déploiement n'a été lancé. La branche reste `main` et HEAD reste `27b6555862724ae433cca3a061318e89d23eb778`.

## Corrections incluses

- Suppression du paramètre inutilisé de ErrorBoundary ; stabilisation de resetCategoryForm avec useCallback ; déplacement du hook useAuth et du sanitizer dans leurs modules dédiés pour supprimer les trois avertissements sans modifier les fonctionnalités.
- Labels visibles Ant Design associés aux champs Identifiant, Mot de passe et Adresse e-mail. Alignement du bouton newsletter conservé. Tests rendus avec les vrais composants.
- Authentification de production : validation de configuration au démarrage, suppression du secours par identifiants d'environnement lorsque MongoDB est configuré, contrôle uniforme des comptes et de leur version de mot de passe sur les accès protégés et les lectures privées.
- Limitation du login à 10 tentatives par connexion sur 15 minutes, HTTP 429 + Retry-After, mémoire bornée, aucune dépendance supplémentaire. Limites des proxies, redémarrages et multi-instance explicitement documentées dans le README backend.
- Correctifs npm compatibles détaillés dans [RELEASE-DEPENDENCIES.md](RELEASE-DEPENDENCIES.md). Aucune migration majeure directe ni commande audit fix --force.
- JSON-LD Organization, BlogPosting et BreadcrumbList ; classification de l'auteur collectif comme Organization. Les erreurs natives de récupération SEO sont normalisées pour que Rollup puisse afficher le vrai motif sans échouer sur DOMException.code.

## Vérifications et limites

Installations propres backend/frontend avec npm ci 10.9.4 réussies. Le CLI concurrently racine corrigé répond en version 9.2.4. Les 29 tests backend compilés finaux passent, dont GET /api/blogs/published en HTTP 200/JSON, health/revision, connexion JSON explicite et refus des identifiants par défaut. Les tests de révocation simulent seulement la frontière MongoDB ; aucun essai avec les secrets ou la base Render réels n'a été effectué.

Un premier lancement backend concurrent avait atteint le timeout de démarrage de 15 secondes. Capture stdout/stderr ajoutée et exécution des fichiers en série pour limiter la pression mémoire : le délai n'a pas été augmenté, aucun test n'est ignoré. Les validations finales ont passé, avec démarrage du serveur compilé en environ 5,2 puis 3,4 secondes. La cause exacte du premier ralentissement n'est pas démontrée ; conserver ce diagnostic si le CI reproduit le problème.

Le premier build après mises à jour a échoué pendant la requête réseau avec une DOMException masquée par Rollup. Le probe suivant a obtenu HTTP 200 sur health en 788 ms et quatre articles publiés en 641 ms. Le timeout réseau reste fixé à 30 secondes ; aucune donnée de secours n'est substituée en cas d'échec. Un test de régression couvre la compatibilité des exceptions avec Rollup.

Les tests d'accessibilité importent Ant Design et peuvent porter la suite frontend à environ deux minutes sur ce poste. Leurs assertions se terminent normalement ; aucun délai de test n'est augmenté.

## SEO avant URL officielle

Le build réel utilise exclusivement `SEO_API_URL=https://train-and-dare.onrender.com/api`. Sans origine frontend officielle, canonical, og:url, images sociales absolues, sitemap et BreadcrumbList avec URLs sont volontairement omis. Organization et BlogPosting sans URL restent présents. `robots.txt` ne doit pas inventer une adresse de sitemap.

Les tests isolés valident aussi le mode avec origine, les URLs absolues, les 15 entrées de sitemap dont quatre articles, les données structurées et l'exclusion des pages privées. Les domaines réservés des fixtures ne sont jamais injectés dans le build de production. `check:production` échoue uniquement sur VITE_SITE_URL/URL absent ; cet état est accepté avant le premier déploiement et ne bloque pas le commit.

Les HTML générés contiennent les métadonnées propres à chaque route ; le corps éditorial continue à être rendu par React. Aucun nouveau moteur de rendu complet n'est ajouté.

## Actions avant déploiement

Vérifier les variables d'authentification sur Render, sans divulgation : JWT_SECRET robuste, et soit compte MongoDB actif provisionné, soit ADMIN_USERNAME/ADMIN_PASSWORD explicites en mode JSON. En mode MongoDB, les anciennes sessions sans passwordVersion peuvent devoir se reconnecter. Le logout navigateur ne révoque pas individuellement les JWT ; les limites exactes sont documentées dans le README backend.

Configurer l'origine officielle frontend dans Netlify quand elle sera connue, puis refaire check:production et la validation SEO publique. Aucun nom de site fictif n'est configuré.

`netlify.toml` reste strictement identique à son état validé (SHA-256 EB7ECDF5E81D76395C6E2209CD6F61AC6BC3D206DDA9165ECD3D0B4B2FD4D2B2), nouvelle API Render et fallback `/* → /spa.html` inclus.

## Script de finalisation et exclusions

`.netlify/finalize-release.cjs` a été relu et vérifié syntaxiquement. Il ne lance aucun test : contrôle branche/remote/HEAD/index, scan de secrets, normalisation du README indexé, diff --check, commit, push, vérification SHA distant. Il n'a pas été exécuté. Un futur usage exige un index inchangé et une validation fraîche ; la prochaine commande proposée dans le rapport crée uniquement le commit.

Les données locales, .env, render-variables.txt, dist, node_modules, scripts temporaires .netlify et travaux Docker/Kubernetes restent exclus. Les versions partielles indexées de README.md et package.json à la racine doivent préserver cette exclusion. Le rapport initial AUDIT-FINAL-NETLIFY.md est historique ; ce document et RELEASE-DEPENDENCIES.md décrivent les corrections ultérieures.

## Contr?les finaux du code

- Backend : 29/29 tests r?ussis, derni?re ex?cution sur le code compil? final en 14,4 secondes.
- Frontend : 27/27 tests r?ussis (6 fichiers), derni?re ex?cution compl?te en 25,6 secondes.
- TypeScript backend/frontend et commande racine npm run check : r?ussis.
- ESLint : 0 erreur, 0 avertissement.
- check:production : ?chec attendu, uniquement VITE_SITE_URL/URL absent.
- Deux revues ind?pendantes en lecture seule : aucune omission bloquante d?tect?e dans l?authentification ni l?analyse des 24 entr?es critical/high initiales.

## Reprise de validation du 14 septembre 2026

Le probe Render depuis le même dossier que Vite a obtenu HTTP 200 et quatre articles. Une exécution Vite instrumentée a reçu les en-têtes HTTP et produit les quatre pages ; le build standard suivant a réussi en 28,34 secondes. Le build racine relancé ensuite a été bloqué avant Vite par la restriction sandbox d'esbuild (`Cannot read directory "../../..": Access is denied`), alors que TypeScript et le build frontend instrumenté restent verts.

L'inspection locale du `dist` final confirme les quatre slugs, le titre, la meta description, og:title/description/type, twitter:card/title/description et BlogPosting pour chaque page. Canonical, og:url et images absolues sont volontairement absents tant que `VITE_SITE_URL` n'est pas défini ; robots.txt contient seulement `User-agent: *` et `Allow: /`, et aucun sitemap n'est émis. La simulation structurée a déjà validé, avec une origine réservée isolée, les 15 URLs, les quatre articles, Organization, BlogPosting et BreadcrumbList. Une nouvelle exécution du script de simulation a été empêchée par l'accès sandbox d'esbuild ; les tests SEO ciblés 7/7 ont passé.

Le staging automatique des corrections n'a pas pu créer `.git/index.lock` (`Permission denied`). Le dossier `.git` contient une règle ACL de refus pour le contexte sandbox ; l'index existant n'a pas été supprimé ou remplacé. `git diff --cached --check` reste donc en échec sur les fins de ligne CRLF du README déjà indexé, et les fichiers de cette reprise restent marqués unstaged/untracked. Après rétablissement d'un contexte Git autorisé, exécuter le script de staging préparé, inspecter son diff, puis seulement décider du commit.

## Performance (sans blocage de release)

Le build instrument? final comporte un bundle principal de 1 315,20 Ko (414,92 Ko gzip) et 81,42 Ko de CSS (14,58 Ko gzip). Les images les plus lourdes sont IMG_20220812_093123 (2) (~1,04 Mo), lyvee (~684 Ko), education-cooperation (~679 Ko), IMG_20240228_144718 (~647 Ko), IMG_20220812_115832 (1) (~626 Ko) et IMG_20240228_150738 (3) (~619 Ko).

Optimisations propos?es, non appliqu?es dans cette release : chargement React.lazy/Suspense du tableau de bord BlogEditor et des routes admin, tailles responsives et formats WebP/AVIF pour les photos, loading=lazy pour les images hors premier ?cran. Conserver l?image principale sans lazy loading si elle d?termine le LCP. Aucun d?coupage global du routing ni changement d?architecture.

## Dernier contrôle local

Le contrôle TypeScript racine et ESLint frontend terminent encore avec succès. Le dernier `npm test` frontend et le dernier build frontend lancés dans le sandbox ont été arrêtés avant le chargement de `vite.config.ts` par `esbuild` (`Cannot read directory "../../..": Access is denied`) ; ils ne révèlent pas une erreur applicative. Le dernier run backend reste à 29/29 et le build backend passe. Le `dist` produit lors du build réussi précédent a été relu sans réseau : quatre pages d’articles et leurs métadonnées sont présentes. Les sondes Render ne sont pas joignables depuis cette exécution locale ; les réponses HTTP 200 précédemment observées sont conservées comme preuve de déploiement.
