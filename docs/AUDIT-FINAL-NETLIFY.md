# Audit final avant le premier déploiement Netlify

> Audit initial conserv? pour tra?abilit?. Les corrections et r?sultats ult?rieurs sont consign?s dans RELEASE-VALIDATION.md et RELEASE-DEPENDENCIES.md ; les constats ci-dessous d?crivent l??tat ant?rieur.

Date : 13 septembre 2026. Périmètre : état de travail et index Git, frontend React/Vite, backend Express, artefacts et configuration Render/Netlify.

## Verdict

**Validation partielle : pas de feu vert global pour la release.** Les tests fonctionnels et TypeScript passent, mais ESLint échoue et npm signale des dépendances vulnérables. L'origine frontend officielle manque encore. La dernière génération complète précède les ajouts JSON-LD de cet audit : un dernier build doit être relancé.

Aucun déploiement, commit ou push n'a été effectué pendant cet audit. Aucun fichier Git n'a été supprimé, aucune permission ni configuration antivirus n'a été modifiée. Le script de release n'a pas été exécuté. Le fallback Netlify reste `/* -> /spa.html`, HTTP 200.

## Résultats des commandes

| Contrôle | Résultat frais |
| --- | --- |
| Backend `npm test` | 22/22 à la relance isolée. Premier essai : 20/22, deux tests bloqués par le délai de démarrage de 15 secondes. Fragilité de temporisation encore présente. |
| Frontend `npm run test` | 23/23 après les ajouts JSON-LD, cinq fichiers de tests. |
| Racine `npm run check` | Réussi après les ajouts : TypeScript backend et frontend. |
| Frontend `npm run lint` | Échec : une erreur, trois avertissements. Pas de configuration ESLint backend dédiée. |
| Racine `npm run build` | Réussi avant les derniers ajouts JSON-LD : backend et frontend, quatre articles, 22 fichiers HTML au total. |
| Frontend `npm run check:production` | Échec attendu : `VITE_SITE_URL or Netlify URL is required before deployment`. Aucun domaine fictif n'a été configuré pour contourner ce contrôle. |
| API Render `/api/health` | HTTP 200, `status: "ok"`. |
| API Render `/api/blogs/published` | HTTP 200, tableau de quatre articles. |
| Simulation SEO isolée | Avant les derniers ajouts : 15 URL canoniques publiques, quatre vrais articles, métadonnées complètes, robots et sitemap cohérents. Domaine réservé de test, jamais écrit dans la configuration ni dans `dist`. |
| Git `fsck --connectivity-only` | Réussi ; objets non référencés issus de la préparation, sans corruption détectée. |

La revue automatique d'autorisation a ensuite refusé la simulation finale en raison du quota d'utilisation atteint. Le build final après les changements JSON-LD n'a pas été réexécuté. Il s'agit d'une limite de vérification, pas d'un résultat de build réussi ou échoué. Les tests frontend et TypeScript, eux, portent sur les derniers changements.

## Robots et indexation

Le plugin `train-dare-frontend/build/seoPlugin.ts` génère `robots.txt` au build. Le fichier local actuellement généré contient exactement :

```text
User-agent: *
Allow: /
```

Lorsque l'origine officielle est disponible, une troisième ligne est ajoutée :

```text
Sitemap: {ORIGINE_FRONTEND}/sitemap.xml
```

Cette notation décrit une substitution ; ce n'est pas une valeur à copier dans Netlify. L'origine vient de `VITE_SITE_URL`, prioritaire, sinon de `URL` fourni par Netlify.

Les pages `/administrateur`, `/editeur`, `/blog/admin` et `/404` contiennent `noindex, follow`, ne possèdent pas de canonical et sont exclues du sitemap. Les ressources CSS/JS restent explorables. Ne pas ajouter de `Disallow` empêchant Google de lire le `noindex` : [consigne officielle Google](https://developers.google.com/search/docs/crawling-indexing/block-indexing).

L'alias `/login` redirige côté React vers `/administrateur` ; sa réponse HTML initiale utilise la coquille SPA. Son comportement d'indexation après rendu reste à vérifier sur le site publié. Les previews Netlify reçoivent le `X-Robots-Tag: noindex, nofollow` prévu par le plugin.

## Sitemap

Sans origine frontend, aucun `sitemap.xml` n'est publié dans le `dist` local. Cela évite d'inventer des URL de production. Avec une origine, les tests et la simulation vérifient les 15 chemins suivants :

```text
/
/programmes/education
/programmes/formation
/programmes/parent-ado
/programmes/enseignants
/adult-plus-info
/blog
/inscription
/landing/education
/landing/formation
/landing/coaching
/blog/from-idea-to-action-in-7-days
/blog/entrepreneurial-mindset-for-adults
/blog/pnl-tools-for-better-communication
/blog/helping-young-people-dare-to-create
```

Les URL deviennent absolues à partir de l'origine frontend. Pas de doublons, brouillons, pages privées, localhost ou backend dans les entrées vérifiées. Les articles correspondent au tableau réellement renvoyé par Render et aux fichiers HTML générés. Le sitemap de simulation est conservé seulement dans `.netlify/final-audit/sitemap.fixture.xml` ; son domaine réservé n'est pas une URL officielle.

## Schema.org et modifications ciblées

Types réellement utilisés après cet audit :

| Type | Pages / rôle |
| --- | --- |
| `Organization` | Pages publiques principales ; éditeur des articles. Nom et description proviennent du projet, URL de l'origine frontend. |
| `BlogPosting` | Les quatre articles publiés ; titres, résumés, auteur et dates repris des données existantes. |
| `BreadcrumbList` | Ajout sur les pages publiques autres que l'accueil lorsque l'origine existe. Accueil → page ; pour un article : Accueil → Blog → article. |

Le générateur et le composant React partagent ces données : le HTML du build et les navigations React emploient la même logique. Les tests vérifient le remplacement des scripts sans doublons, les URL absolues, les positions du fil et l'échappement de texte hostile. Lorsque la signature de l'article est exactement `Train & Dare Academy`, l'auteur est désormais une `Organization`, plutôt qu'une `Person`.

Aucune adresse, note, évaluation, prix, date ou personne fictive n'a été ajouté. `Course`, `Event` et `LocalBusiness` n'ont pas été ajoutés : les pages inspectées présentent des parcours/offres générales, sans nouvelle modélisation validée d'une session ou d'un établissement local. Les prix et dates ne doivent pas être inventés pour obtenir un résultat enrichi.

Le nom et la description de l'organisation sont présents. `sameAs` est absent : les liens de partage Facebook/LinkedIn ne sont pas des profils officiels. Aucun logo autonome n'a été identifié et vérifié pour cette propriété. `public/social-cover.jpg` a été inspecté : c'est une vraie photographie d'atelier, utilisée comme image sociale de repli, pas un logo. Ne pas la déclarer comme logo.

Les pages privées n'émettent pas ces données structurées. En l'absence d'origine, les URL absolues et le fil structuré sont omis, avec avertissement de build. Une origine backend égale à `SEO_API_URL` est refusée par le plugin et `check:production`.

Limite conservée de l'architecture : le build prégénère les métadonnées HTML ; le corps principal de l'article reste rendu par React. Ne pas présenter ce mécanisme comme un rendu serveur complet du contenu.

## Procédure Google après déploiement

1. Configurer `VITE_SITE_URL` avec l'adresse HTTPS principale réelle du frontend, puis reconstruire. La variable `URL` de Netlify peut servir au premier build.
2. Ouvrir manuellement [Google Rich Results Test](https://search.google.com/test/rich-results).
3. Tester successivement la page d'accueil, `/programmes/formation` et `/blog/from-idea-to-action-in-7-days` sur le domaine réel.
4. Inspecter le HTML rendu et les éléments détectés : organisation, fil de navigation si présent, article sur la page article. Vérifier que les URL, dates et images correspondent au contenu visible. Ne pas exiger un résultat `Course` si aucun `Course` n'est publié.
5. Corriger les erreurs obligatoires ; examiner les avertissements sans remplir des propriétés avec des données inventées. Pour la validité Schema.org générale, compléter avec [Schema Markup Validator](https://validator.schema.org/).
6. Vérifier les réponses HTTP et les images accessibles, puis soumettre le sitemap dans Search Console. Contrôler aussi le `noindex` des espaces privés par l'inspection d'URL.

Aucun service Google n'a été automatisé. La validité du balisage ne garantit ni l'affichage d'un résultat enrichi ni le classement. Références : [Article](https://developers.google.com/search/docs/appearance/structured-data/article), [Organization](https://developers.google.com/search/docs/appearance/structured-data/organization).

## Sécurité, formulaires et authentification

### Contrôles satisfaits

- Aucun secret réel détecté par les recherches de motifs et la comparaison avec les valeurs locales connues dans les fichiers indexés. Les occurrences de noms de variables, valeurs factices de tests et exemples ne sont pas des secrets de production.
- `.env` et `train-dare-backend/render-variables.txt` sont ignorés ; seuls les `.env.example` sont destinés au dépôt. Aucun secret backend n'est défini dans `netlify.toml`.
- Les variables frontend identifiées sont `VITE_API_URL`, `VITE_SITE_URL`, `VITE_GA_MEASUREMENT_ID` : adresse API, origine publique et identifiant de mesure public. Le JWT de session reçu à la connexion est une donnée d'exécution, pas un secret de signature embarqué dans le build.
- Toutes les mutations blog et catégories utilisent `requireAdmin` : vérification JWT et rôle `admin`. Les tests existants couvrent les refus de mutations non autorisées et les transitions publiques/brouillons.
- DOMPurify est conservé à l'écriture backend, dans l'éditeur et avant `dangerouslySetInnerHTML` pour le contenu des articles. Le JSON-LD HTML échappe les caractères `<`.
- Le formulaire de contact actif de `HomePage.tsx` a des champs nom/email/message requis et un contrôle email. Le backend vérifie les mêmes données minimales. Le vieux `ContactSection.tsx` n'est pas monté dans la page d'accueil actuelle.
- L'inscription valide programme, nom et email ; le backend impose des limites sur plusieurs champs. Le login vérifie la présence des identifiants. L'éditeur vérifie les champs requis et assainit son HTML.
- Pas de journalisation explicite du mot de passe ou de l'URL du Build Hook dans les routes examinées. Aucun formulaire n'a été envoyé en production pendant l'audit.

### Problèmes à traiter

1. **Élevé : valeurs d'authentification par défaut acceptées.** `src/config/env.ts` fournit encore un secret JWT connu et `admin/admin` en l'absence de configuration. Le démarrage se contente d'un avertissement. Vérifier les variables Render sans les divulguer, puis prévoir un refus de démarrage en production lorsque ces valeurs sont absentes/faibles. L'audit n'a pas tenté ces identifiants en production.
2. **Élevé : révocation administrateur incomplète.** `requireAdmin` vérifie le JWT mais pas l'état actuel du compte MongoDB. `/api/auth/me` finit par renvoyer un rôle admin même si la recherche ne retrouve pas un compte actif. Un ancien jeton signé peut donc conserver ses droits jusqu'à son expiration. Constat statique, pas de tentative sur un compte réel.
3. **Modéré : absence de limitation des tentatives.** Aucun rate limiting visible sur le login, contact et inscription. La limite JSON globale de 1 Mo ne remplace pas une protection contre les tentatives répétées ou le spam.
4. **Modéré : consentement et validations divergents.** L'inscription impose une case côté frontend, mais le backend n'exige pas sa valeur vraie ; le stockage JSON ne conserve pas tous les champs supplémentaires de contact/préférence. Le contact n'impose pas les mêmes limites de longueur en mode JSON et MongoDB.
5. **À confirmer côté hébergement : persistance.** Les articles utilisent encore `src/data/*.json` ; sans disque persistant, un redéploiement Render peut perdre les mutations locales. Le Blueprint local ne prouve pas la configuration de stockage du service Live.
6. **Risque lié à XSS : token de session dans localStorage.** Architecture existante conservée. Cela renforce la priorité des correctifs DOMPurify et de l'absence d'injection HTML.

Les tests actuels ne constituent pas une validation de bout en bout des quatre formulaires, ni une preuve de configuration correcte des secrets Render.

## Audits npm

Résultats complets, dépendances de développement incluses. Les nombres comptent les paquets signalés, pas des failles uniques ; ne pas les additionner entre projets pour estimer un nombre de CVE.

| Projet | Critical | High | Moderate | Low |
| --- | ---: | ---: | ---: | ---: |
| Racine | 2 | 0 | 0 | 0 |
| Backend | 0 | 6 | 4 | 1 |
| Frontend | 3 | 13 | 5 | 1 |

Dépendances directes signalées :

- Racine : `concurrently` (critical, via `shell-quote`). Outil de développement.
- Backend : `express` (high), `mongoose` (moderate). DOMPurify et Undici apparaissent aussi dans les dépendances transitives ; revoir notamment la chaîne `isomorphic-dompurify`.
- Frontend : `axios`, `postcss`, `react-router-dom`, `vite` (high), `dompurify` (moderate), `vitest` (critical).
- Les trois paquets frontend classés critical sont `form-data`, `tar` et `vitest`. Leur présence dans le lockfile ne prouve pas que leur code vulnérable soit livré ou exploitable dans le navigateur. Le cas Vitest signalé concerne notamment son serveur UI ; celui-ci n'est pas le site statique Netlify.

npm indique une correction disponible pour les dépendances directes citées. Prévoir une mise à jour ciblée et une nouvelle validation des lockfiles, du HTML assaini, du routage et du build. Aucun `npm audit fix`, `--force`, changement de version ou suppression de fonctionnalité n'a été effectué. Les JSON bruts sont conservés localement dans `.netlify/final-audit/*-audit.json`.

## HTTPS et inspection de dist

Les deux références actives Render dans `netlify.toml` utilisent HTTPS. `check:production` exige aussi HTTPS pour l'origine frontend. Il n'existe pas encore de domaine frontend officiel à tester.

Le build inspecté contient quatre articles et les métadonnées textuelles, plus JSON-LD. Les canonical, images sociales absolues et sitemap sont absents faute d'origine, ce qui est signalé par Vite. Il ne faut pas publier directement ce `dist` de diagnostic.

Recherche dans le build : aucune ancienne URL Render, URI MongoDB, `JWT_SECRET`, `ADMIN_PASSWORD` ou référence au Build Hook détectée. Aucune URL backend ou localhost n'est utilisée dans ses métadonnées SEO. Le mot `localhost` apparaît dans le JavaScript compilé : des chemins de développement/bibliothèque existent encore ; ce n'est pas une canonical générée. Les clients API sont construits avec `VITE_API_URL=/api`.

Les namespaces XML `http://www.w3.org/...` des SVG ne sont pas des chargements HTTP. Le code accepte toutefois des images éditoriales `http:` : une image future saisie ainsi pourrait introduire du contenu mixte. Les valeurs réellement publiées devront rester HTTPS. Les tests ne prouvent pas la sûreté de toutes les futures données saisies dans l'éditeur.

## Navigation, 404, accessibilité et performances

- Les liens internes littéraux examinés correspondent aux routes ou ancres existantes. La navigation Blog pointe vers `/blog`. Les quatre liens d'articles correspondent à des slugs publics réels.
- Les alias et routes dynamiques React sont conservés. La route finale `*` affiche `NotFoundPage`, avec titre, liens de retour et `noindex` appliqué par React.
- Une URL inconnue sur Netlify est prévue pour recevoir HTTP 200 via `/spa.html`, puis la page React introuvable. Risque de soft 404 à vérifier après publication ; aucun changement du fallback n'a été effectué pour le masquer.
- Analyse statique de 24 balises image JSX : toutes possèdent `alt`. Cela ne valide ni la pertinence de chaque texte ni les images HTML ajoutées ensuite dans les articles.
- Le contact actif et l'inscription utilisent des labels. Les deux champs du login et l'email de newsletter n'ont pas de label explicite, seulement des placeholders. À corriger pour l'accessibilité. La case de consentement possède son propre texte.
- La page de login commence par un titre de niveau 3 ; l'éditeur permet d'insérer H1 dans un article qui a déjà un titre. La hiérarchie complète du contenu éditorial reste à contrôler.
- CSS responsive présent ; aucun test sur téléphone physique, Safari ou lecteur d'écran n'est revendiqué. Contrastes, clavier et rendu mobile ne sont pas certifiés par cet audit statique.
- Bundle principal : environ 1,287 Mo non compressé, 405 Ko gzip ; avertissement Vite au-dessus de 500 Ko. Imports synchrones de nombreuses pages et composants Ant Design ; pas de réécriture effectuée.
- Une image livrée dépasse 1 Mo ; plusieurs approchent 650–680 Ko. Un PNG source de 2,27 Mo n'apparaît pas parmi les ressources du build inspecté. Optimiser les ressources réellement chargées avant d'envisager une refonte.

## ESLint

- Erreur : `src/component/ErrorBoundary.tsx:16`, paramètre `_` inutilisé (`@typescript-eslint/no-unused-vars`).
- Avertissement : `BlogEditor.tsx:186`, dépendance de hook manquante `resetCategoryForm`.
- Avertissements Fast Refresh : `RichTextEditor.tsx:7` et `AuthContext.tsx:68`, mélange d'exports de composants et de fonctions.

L'erreur ESLint n'a pas été supprimée ou désactivée pour obtenir un résultat vert.

## Diagnostic Git et script de release

Constats frais :

- Environ 82 Gio libres : disque plein exclu au moment du contrôle.
- Aucun `.git/index.lock` ; aucun processus `git` concurrent observé.
- `.git/index` existe, environ 18 Ko, attribut Archive, pas lecture seule.
- Ouverture lecture/écriture autorisée lors du diagnostic, sans écriture de contenu.
- Aucune règle ACL de refus applicable au jeton courant détectée lors de ce contrôle autorisé.
- Windows Defender est actif ; aucun outil de suivi de handles disponible. Aucune preuve ne permet d'accuser Defender d'un verrouillage.
- `git fsck --connectivity-only` réussit. Les objets dangling proviennent de préparations non référencées ; ils ne justifient aucune suppression.
- `git update-index --refresh` n'a plus produit l'erreur d'écriture. Les mentions `needs update` concernent des changements locaux volontairement non sélectionnés.
- Une écriture forcée de la **même entrée README** avec `update-index --cacheinfo` a réussi, code 0. Les entrées indexées avant/après sont strictement identiques.

**Conclusion exacte : l'écriture de l'index fonctionne maintenant dans le contexte autorisé ; l'ancienne erreur n'est pas reproductible. Sa cause historique précise reste indéterminée.** Les restrictions d'environnement ou un verrou temporaire sont des hypothèses, pas des causes démontrées. Aucune réparation destructive n'a été nécessaire.

Le script `.netlify/finalize-release.cjs` a été lu et sa syntaxe vérifiée, sans exécution :

| Exigence | Résultat |
| --- | --- |
| Pas de secret réel | Aucun détecté dans le script. |
| Pas de suppression destructive | Aucune commande de suppression/reset/force-push. |
| Sélection maîtrisée | Compare l'index à `reviewed-index.txt`, ne fait pas `git add .`. |
| Données locales exclues | Les données backend, travaux Docker/Kubernetes et secrets locaux ne sont pas sélectionnés par le script. |
| Tests avant push | **Non : aucun appel aux tests, TypeScript, lint ou build.** Le script s'appuie sur une vérification antérieure. |
| Destination | Vérifie le dépôt et la branche `main`, pousse `origin main`, sans `--force`. |
| Derniers changements | Les ajouts JSON-LD et ce rapport ne sont pas encore incorporés dans la sélection figée. Révision de la sélection obligatoire. |

Il ne faut donc pas lancer ce script comme un contrôle final complet. Corriger/compléter son contrôle de release et revoir l'index après les corrections. La sélection comporte actuellement 71 fichiers issus de la préparation précédente, avec notamment le frontend et ses ressources, la configuration Render/Netlify, le service de hook, les tests et la documentation. Les quatre fichiers SEO modifiés pendant cet audit et ce nouveau rapport restent à revoir et à sélectionner.

Prochaine commande sûre, sans commit ni push :

```powershell
& 'C:/Program Files/Git/cmd/git.exe' diff --cached --check
```

Le README indexé a encore des fins de ligne non normalisées qui produisent des remarques de whitespace. Corriger uniquement la version sélectionnée en préservant les ajouts locaux exclus, puis revoir `git diff --cached`. Après résolution des problèmes retenus, relancer les contrôles sur la sélection exacte, actualiser son manifeste, et seulement alors préparer commit/push. Ne pas supprimer `.git/index` et ne pas utiliser `git add .` pour contourner ces étapes.

## Fichiers modifiés par cet audit

- `train-dare-frontend/src/seo/metadata.ts` : fil structuré et auteur organisation lorsque la signature est celle de l'académie.
- `train-dare-frontend/src/component/Seo.tsx` : mêmes scripts JSON-LD pendant la navigation React.
- `train-dare-frontend/src/seo/metadata.test.ts` et `src/component/Seo.test.tsx` : contrôles associés et conservation de l'échappement.
- `docs/AUDIT-FINAL-NETLIFY.md` : présent rapport et procédure Google.

Les artefacts auxiliaires sont dans `.netlify/final-audit/`, ignoré de Git. Aucun fichier de production ne contient le domaine réservé utilisé par la simulation.

## Recherche dans l?historique Git

10 commits accessibles et 918 versions de fichiers texte examin?s : 0 correspondance de secret r?el selon les motifs contr?l?s. Cette recherche ne constitue pas une preuve exhaustive pour tous les formats de secrets possibles.

## Annexe : s?lection Git existante (71 fichiers)

```text
.gitignore
README.md
docs/NETLIFY-BLOG-REBUILDS.md
docs/NETLIFY-DEPLOYMENT.md
netlify.toml
package.json
render.yaml
train-dare-backend/.env.example
train-dare-backend/README.md
train-dare-backend/RENDER-DIAGNOSTIC.md
train-dare-backend/package.json
train-dare-backend/src/index.ts
train-dare-backend/src/routes/blogs.ts
train-dare-backend/src/services/netlifyBuild.ts
train-dare-backend/tests/blogRebuild.test.cjs
train-dare-backend/tests/netlifyBuild.test.cjs
train-dare-backend/tests/productionEndpoint.test.cjs
train-dare-frontend/.env.example
train-dare-frontend/README.md
train-dare-frontend/build/seoPlugin.ts
train-dare-frontend/index.html
train-dare-frontend/package-lock.json
train-dare-frontend/package.json
train-dare-frontend/public/social-cover.jpg
train-dare-frontend/scripts/check-production.mjs
train-dare-frontend/scripts/verify-deployment.mjs
train-dare-frontend/src/App.tsx
train-dare-frontend/src/api/inscriptions.ts
train-dare-frontend/src/assets/TRAIN&DARE ACADEMY 2.jpg
train-dare-frontend/src/assets/education-cooperation.jpg
train-dare-frontend/src/assets/lyvee.jpg
train-dare-frontend/src/component/Acceuil.tsx
train-dare-frontend/src/component/AdultPlusInfo.tsx
train-dare-frontend/src/component/Apropos.css
train-dare-frontend/src/component/Apropos.tsx
train-dare-frontend/src/component/Blog.tsx
train-dare-frontend/src/component/BlogEditor.tsx
train-dare-frontend/src/component/BlogPost.tsx
train-dare-frontend/src/component/ContactSection.tsx
train-dare-frontend/src/component/EducationPage.css
train-dare-frontend/src/component/EducationPage.tsx
train-dare-frontend/src/component/EspaceEnseignants.css
train-dare-frontend/src/component/EspaceEnseignants.tsx
train-dare-frontend/src/component/EspaceParentAdo.css
train-dare-frontend/src/component/EspaceParentAdo.tsx
train-dare-frontend/src/component/FAQ.tsx
train-dare-frontend/src/component/FormationPage.tsx
train-dare-frontend/src/component/HomePage.css
train-dare-frontend/src/component/HomePage.tsx
train-dare-frontend/src/component/InscriptionForm.tsx
train-dare-frontend/src/component/InscriptionPage.css
train-dare-frontend/src/component/InscriptionPage.tsx
train-dare-frontend/src/component/LandingPage.tsx
train-dare-frontend/src/component/LoginPage.tsx
train-dare-frontend/src/component/MarketingSections.css
train-dare-frontend/src/component/MarketingSections.tsx
train-dare-frontend/src/component/NotFoundPage.tsx
train-dare-frontend/src/component/ProtectedRoute.tsx
train-dare-frontend/src/component/Seo.test.tsx
train-dare-frontend/src/component/Seo.tsx
train-dare-frontend/src/component/SiteFooter.css
train-dare-frontend/src/component/SiteFooter.tsx
train-dare-frontend/src/component/SocialShareButtons.tsx
train-dare-frontend/src/constants/navigation.test.ts
train-dare-frontend/src/constants/navigation.ts
train-dare-frontend/src/seo/build.test.ts
train-dare-frontend/src/seo/metadata.test.ts
train-dare-frontend/src/seo/metadata.ts
train-dare-frontend/src/seo/pages.ts
train-dare-frontend/tsconfig.node.json
train-dare-frontend/vite.config.ts
```
