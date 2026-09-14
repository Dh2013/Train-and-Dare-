# Authentification admin – Train&Dare

## Rôle des rôles

- **Visiteur (non authentifié)** : accès uniquement à la page blog publique (`/blog`, `/blog/:slug`). Aucun bouton « Éditeur / Administration ».
- **Admin** : après connexion, accès à `/editeur` et `/blog/admin`, et affichage du bouton sur `/blog`.

## Côté client (frontend)

- **Token** : stocké dans `localStorage` sous la clé `train_dare_admin_token`.
- **Vérification** : au chargement, l’appel à `GET /api/auth/me` avec ce token détermine si l’utilisateur est admin (`isAdmin`).
- **Bouton sur /blog** : rendu uniquement si `useAuth().isAdmin === true`. Sinon, aucun lien ni bouton vers l’éditeur.
- **Routes protégées** : `/editeur` et `/blog/admin` sont enveloppées dans `ProtectedRoute`. Si l’utilisateur n’est pas admin, redirection vers `/login` (sans exposer le contenu de l’éditeur).
- **Requêtes API** : les appels qui modifient les articles (liste complète, création, modification, publication, suppression) envoient l’en-tête `Authorization: Bearer <token>`.

## Côté serveur (backend)

- **Login** : `POST /api/auth/login` avec `{ username, password }`. Si les identifiants correspondent à l’admin, retour d’un JWT (et `user.role: 'admin'`).
- **Vérification** : `GET /api/auth/me` exige `Authorization: Bearer <token>` et retourne l’utilisateur si le token est valide et rôle admin.
- **Routes protégées** :
  - `GET /api/blogs` (liste complète) → middleware `requireAdmin`.
  - `POST /api/blogs`, `PUT /api/blogs/:id`, `PATCH /api/blogs/:id/publish`, `PATCH /api/blogs/:id/unpublish`, `DELETE /api/blogs/:id` → `requireAdmin`.
- **Routes publiques** :
  - `GET /api/blogs/published` → liste des articles publiés (sans auth).
  - `GET /api/blogs/:id` → détail d’un article (sans auth).

## Configuration (backend)

Variables d’environnement recommandées :

- `MONGODB_URI` : connexion MongoDB. Quand elle est définie, les comptes MongoDB actifs (`editor` ou `super_admin`) sont la seule source d’authentification.
- `ADMIN_USERNAME` : identifiant explicite du mode JSON, utilisé uniquement quand `MONGODB_URI` est absente.
- `ADMIN_PASSWORD` : mot de passe explicite du mode JSON (au moins 12 caractères en production), utilisé uniquement quand `MONGODB_URI` est absente.
- `JWT_SECRET` : secret aléatoire indépendant d’au moins 32 caractères, obligatoire en production.
- `JWT_EXPIRES_IN` : expiration du token en **secondes** (défaut : 604800 = 7 jours).

Exemple `.env` :

```
MONGODB_URI=
ADMIN_USERNAME=VotreIdentifiantAdmin
ADMIN_PASSWORD=VotreMotDePasseLongEtUnique
JWT_SECRET=UneChaineAleatoireDauMoins32Caracteres
JWT_EXPIRES_IN=604800
```

En production, aucune valeur par défaut (`admin`, `admin` ou le secret de démonstration) n’est acceptée. Ne commitez jamais les valeurs réelles ; configurez-les dans Render.

## Flux

1. Visiteur sur `/blog` : pas de bouton admin, page 100 % publique.
2. Accès direct à `/editeur` sans être connecté : redirection vers `/login`.
3. Sur `/login`, saisie des identifiants admin → en cas de succès, token stocké et redirection vers `/editeur`.
4. Sur `/blog`, si token valide et rôle admin : le bouton « Éditeur / Administration » s’affiche.
5. Déconnexion (bouton dans l’éditeur) : suppression du token et redirection vers `/blog` ; le bouton disparaît.
