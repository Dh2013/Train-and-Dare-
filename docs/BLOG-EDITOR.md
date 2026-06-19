# Éditeur de blog — Architecture et bonnes pratiques

## 1. Description de l’architecture

### Vue d’ensemble

- **Frontend (React + Vite)** : page blog publique (`/blog`, `/blog/:slug`) et interface d’administration (`/blog/admin`).
- **Backend (Express)** : API REST pour les articles (CRUD), stockage dans un fichier JSON.

```
┌─────────────────┐     HTTP (JSON)      ┌──────────────────┐
│  React (Vite)   │ ◄──────────────────► │  Express (Node)  │
│  - Blog list    │   GET/POST/PUT/DELETE │  - routes/blogs  │
│  - BlogPost     │                      │  - data/blogs.json
│  - BlogEditor   │                      │  - sanitization  │
└─────────────────┘                      └──────────────────┘
```

### Flux de données

- **Lecture** : `Blog` et `BlogPost` appellent `GET /api/blogs` et `GET /api/blogs/:id|:slug`. En cas d’erreur (backend indisponible), repli sur les données locales (`BlogData.tsx`).
- **Édition** : `BlogEditor` utilise les cinq verbes (list, get, create, update, delete). Les formulaires envoient titre, slug, date, tags, extrait et contenu HTML.
- **Contenu riche** : l’éditeur produit du HTML (titres, paragraphes, listes, liens, images). Le HTML est **sanitisé** côté client (avant envoi) et côté serveur (avant enregistrement) avec une liste blanche de balises et d’attributs.

### Fichiers principaux

| Rôle | Fichier |
|------|--------|
| API blogs frontend | `train-dare-frontend/src/api/blogs.ts` |
| Liste + détail blog | `Blog.tsx`, `BlogPost.tsx` |
| Admin blog | `BlogEditor.tsx` |
| Éditeur riche | `RichTextEditor.tsx` |
| API CRUD + sanitization | `train-dare-backend/src/routes/blogs.ts` |
| Données | `train-dare-backend/src/data/blogs.json` |

---

## 2. Fonctionnalités clés

- **Création** : formulaire (titre, slug optionnel, date, tags, extrait) + éditeur visuel pour le contenu ; enregistrement via `POST /api/blogs`.
- **Modification** : même formulaire prérempli ; mise à jour via `PUT /api/blogs/:id`.
- **Suppression** : confirmation puis `DELETE /api/blogs/:id`.
- **Éditeur visuel** : barre d’outils (gras, italique, souligné, titres H2/H3, paragraphe, lien, image, listes à puces/numérotées) ; zone éditable en HTML ; aperçu en direct.
- **Gestion d’état** : modes « liste », « création », « édition » ; chargement et enregistrement avec retours utilisateur (messages, désactivation des boutons).
- **Sécurité** : validation et sanitization des entrées (voir section 4).

---

## 3. Exemple d’implémentation

### Backend — Création d’un article avec sanitization

```ts
// routes/blogs.ts (extrait)
import DOMPurify from 'isomorphic-dompurify';

function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h2', 'h3', 'ul', 'ol', 'li', 'a', 'img'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title'],
  });
}

router.post('/', (req, res) => {
  const content = sanitizeHtml(String(req.body.content || ''));
  // ... validation titre, slug, etc.
  const newPost = { id: generateId(), slug, title, date, tags, excerpt, content };
  blogs.push(newPost);
  writeBlogs(blogs);
  res.status(201).json(newPost);
});
```

### Frontend — Éditeur riche et affichage sécurisé

```tsx
// RichTextEditor : valeur contrôlée + sanitization à la sortie
onChange(sanitizeHtml(ref.current.innerHTML));

// BlogPost : affichage du contenu
dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
```

---

## 4. Bonnes pratiques UX

- **Navigation** : « Retour à la liste » / « Retour au blog » clairs ; lien « Administration du blog » depuis la liste des articles.
- **Feedback** : messages de succès/erreur (Ant Design `message`), états de chargement (boutons désactivés, `loading` sur les listes).
- **Confirmation** : suppression avec `Popconfirm` pour éviter les clics accidentels.
- **Aperçu** : panneau d’aperçu du contenu à côté de l’éditeur ; possibilité de le masquer.
- **Formulaires** : champs labellisés, placeholders, règles de validation (titre requis, slug optionnel).
- **Responsive** : grille et boutons adaptés (Tailwind / Ant Design).

---

## 5. Bonnes pratiques sécurité

- **Sanitization HTML** : tout contenu HTML est passé dans DOMPurify (côté client et serveur) avec une **liste blanche** de balises (`p`, `strong`, `em`, `h2`, `h3`, `ul`, `ol`, `li`, `a`, `img`) et d’attributs (`href`, `src`, `alt`, `title`). Réduit les risques XSS.
- **Validation des entrées** : longueurs max (titre, extrait, contenu), format du slug (alphanumérique + tirets), nombre max de tags.
- **Slug** : génération automatique à partir du titre si non fourni ; unicité vérifiée avant création et mise à jour.
- **Pas d’exécution de code** : pas d’`eval`, pas de rendu de HTML non sanitisé (sauf via `dangerouslySetInnerHTML` avec contenu sanitisé).
- **Tags** : nettoyage des caractères dangereux (`<`, `>`, `"`, `'`) et longueur limitée.

Pour aller plus loin en production : authentification (JWT, session) pour protéger les routes d’administration, limitation de débit (rate limiting), et sauvegarde régulière de `blogs.json`.
