# Architecture – Éditeur de blog & page blog publique

## 1. Vue d’ensemble

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Utilisateur                                                              │
└─────────────────────────────────────────────────────────────────────────┘
         │
         ├── Éditeur (/editeur ou /blog/admin)
         │   • Créer / modifier / supprimer des articles
         │   • Publier / Dépublier
         │   • WYSIWYG, auteur, dates, statut
         │
         └── Page blog publique (/blog)
             • Liste des articles publiés uniquement
             • Clic → détail (/blog/:slug)
             •
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Frontend (React + Vite)                                                  │
│  • Blog.tsx        → GET /api/blogs?status=published                      │
│  • BlogPost.tsx    → GET /api/blogs/:slug                                 │
│  • BlogEditor.tsx  → GET/POST/PUT/DELETE /api/blogs + PATCH publish       │
└─────────────────────────────────────────────────────────────────────────┘
         │ REST (JSON)
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Backend (Express)                                                        │
│  • GET  /api/blogs           → liste (admin : tous ; public : ?status=published) │
│  • GET  /api/blogs/:id       → détail (par id ou slug)                    │
│  • POST /api/blogs           → créer (draft par défaut)                    │
│  • PUT  /api/blogs/:id       → modifier                                    │
│  • PATCH /api/blogs/:id/publish   → publier                                │
│  • PATCH /api/blogs/:id/unpublish → dépublier                              │
│  • DELETE /api/blogs/:id     → supprimer                                   │
│  • Validation + sanitization HTML (DOMPurify)                              │
└─────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Base de données (fichier JSON)                                           │
│  • train-dare-backend/src/data/blogs.json                                 │
│  • Un enregistrement = un article (voir schéma ci‑dessous)                 │
└─────────────────────────────────────────────────────────────────────────┘
```

## 2. Schéma de la base de données (articles)

Structure d’un article (document JSON) :

| Champ         | Type     | Obligatoire | Description |
|---------------|----------|-------------|-------------|
| id            | string   | oui         | Identifiant unique (ex. b1, b2) |
| slug          | string   | oui         | URL (ex. mon-article) |
| title         | string   | oui         | Titre |
| excerpt       | string   | oui         | Résumé / extrait |
| content       | string   | oui         | Contenu HTML (sanitisé) |
| tags          | string[] | oui         | Liste de tags |
| date          | string   | oui         | Date d’affichage (YYYY-MM-DD) |
| author        | string   | oui         | Nom de l’auteur |
| status        | string   | oui         | `draft` \| `published` |
| publishedAt   | string   | non         | Date/heure de publication (ISO 8601) |
| createdAt     | string   | oui         | Création (ISO 8601) |
| updatedAt     | string   | oui         | Dernière modification (ISO 8601) |

Règles métier :
- La page blog publique n’affiche que les articles avec `status === 'published'`.
- L’éditeur affiche tous les articles (draft + published) et permet de publier/dépublier.

## 3. Connexion éditeur ↔ base de données ↔ page blog

1. **Création**  
   Éditeur → POST /api/blogs (title, slug, excerpt, content, tags, date, author, status: draft) → enregistrement en base → liste de l’éditeur rafraîchie.

2. **Publication**  
   Éditeur → PATCH /api/blogs/:id/publish → backend met `status: 'published'`, `publishedAt: now` → article visible sur la page blog au prochain chargement.

3. **Page blog**  
   Frontend → GET /api/blogs?status=published → backend renvoie uniquement les articles publiés → affichage dynamique de la liste.

4. **Modification / suppression**  
   Éditeur → PUT ou DELETE → base mise à jour → liste éditeur + liste blog (si publié) cohérentes après rechargement ou refetch.

## 4. Sécurité

- **XSS** : contenu HTML sanitisé côté backend (DOMPurify, liste blanche de balises/attributs) avant enregistrement ; affichage côté frontend via `dangerouslySetInnerHTML` uniquement après sanitization.
- **Injections** : validation des champs (longueurs, format slug), pas de requêtes SQL (stockage JSON).
- **Authentification** : non implémentée ici ; en production, protéger les routes POST/PUT/DELETE/PATCH par une authentification (ex. JWT, session).

## 5. Routes frontend

| Route            | Composant   | Rôle |
|------------------|------------|------|
| /blog            | Blog       | Page blog publique (articles publiés) |
| /blog/:slug      | BlogPost   | Détail d’un article |
| /editeur         | BlogEditor | Éditeur (créer, modifier, supprimer, publier/dépublier) |
| /blog/admin      | BlogEditor | Alias vers l’éditeur |

## 6. Logique de connexion éditeur ↔ base de données ↔ page blog

1. **Création** : L’éditeur envoie `POST /api/blogs` avec `status: 'draft'` ou `'published'`. Le backend enregistre dans `blogs.json` avec `createdAt`, `updatedAt`, et si publié `publishedAt`. La page blog appelle `GET /api/blogs?status=published` donc un nouvel article publié apparaît au prochain chargement.
2. **Publication** : Clic « Publier » → `PATCH /api/blogs/:id/publish` → `status: 'published'` et `publishedAt` → l’article est renvoyé par `GET /api/blogs?status=published` et s’affiche sur la page blog.
3. **Dépublication** : « Dépublier » → `PATCH /api/blogs/:id/unpublish` → `status: 'draft'` → l’article disparaît de la page blog.
4. **Modification / suppression** : `PUT` ou `DELETE` mettent à jour ou suppriment l’enregistrement ; la page blog et l’éditeur restent cohérents après refetch ou rechargement.
