# Conventions de code – Train & Dare

Document de référence pour le style de code et les bonnes pratiques du projet (rendu académique / professionnel).

---

## 1. Formatage et outils

- **Prettier** : configuré à la racine (`.prettierrc`). À lancer avant commit ou en format on save.
  - Guillemets simples, point-virgules, indent 2 espaces, `trailingComma: "es5"`, `printWidth: 100`.
- **EditorConfig** (`.editorconfig`) : indent 2 espaces, fin de ligne LF, UTF-8, trim trailing spaces, final newline.
- **ESLint** : frontend (`train-dare-frontend/eslint.config.js`). Respecter les règles pour TypeScript et React.

---

## 2. TypeScript

- Utiliser des **interfaces** pour les props de composants, les payloads API et les objets métier.
- Éviter `any` ; préférer `unknown` ou des types précis.
- Types partagés : les placer dans `src/types/` (frontend) ou les exporter depuis les modules concernés (backend).
- Exporter les types utilisés par l’API (ex. `ContactPayload`, `Programme`, `Univers`) pour faciliter la réutilisation.

---

## 3. React (frontend)

- **Composants** : privilégier les composants fonctionnels et les hooks.
- **Nommage** : PascalCase pour les composants et les fichiers de composants (ex. `ContactSection.tsx`).
- **Props** : typer avec une interface (ex. `interface ContactSectionProps { ... }`).
- **Commentaires** : JSDoc pour les composants ou fonctions exposées (résumé en une ligne + détails si besoin).
- **État** : Context pour l’auth (`AuthContext`), état local sinon. Éviter les props en chaîne trop longues.
- **Routes** : constantes ou configuration centralisée (ex. `constants/navigation.ts` pour les sections).

---

## 4. Backend (Express)

- **Routes** : un fichier par ressource (`programs`, `blogs`, `contact`, `inscriptions`, `auth`).
- **Commentaires** : bloc JSDoc pour chaque route (méthode, chemin, body/query, rôle).
- **Validation** : vérifier et normaliser les entrées (trim, types). Répondre avec des messages d’erreur en français quand c’est pertinent.
- **Typage** : interfaces pour les payloads (ex. `ContactPayload`, `ContactRecord`).

---

## 5. API et données

- **REST** : GET pour lecture, POST pour création / envoi (contact, inscriptions), PUT/PATCH pour mise à jour, DELETE pour suppression.
- **Réponses** : JSON. Codes HTTP cohérents (200, 201, 400, 401, 403, 404).
- **Erreurs** : objet `{ error: string }` ou équivalent, message clair pour le frontend.

---

## 6. Fichiers et dossiers

- **Frontend** : `api/` (clients), `component/` (composants/pages), `constants/`, `context/`, `types/`.
- **Backend** : `data/` (JSON), `middleware/`, `routes/`.
- **Documentation** : `docs/` à la racine (architecture, auth, blog, conventions).

---

## 7. Tests

- **Frontend** : Vitest + React Testing Library. Fichiers `*.test.ts` / `*.test.tsx` à côté des modules ou dans un dossier dédié.
- **Backend** : à définir (Jest ou Vitest). Tester au minimum les routes critiques et la validation des entrées.

---

## 8. Sécurité et production

- Ne pas commiter de secrets (`.env` dans `.gitignore`).
- En production : `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` robustes ; CORS restreint aux origines autorisées.
- Contenu utilisateur (blog, messages) : validation + sanitization (DOMPurify côté client, nettoyage côté serveur si applicable).

Ces conventions permettent de garder le code lisible, maintenable et prêt pour un rendu académique ou professionnel.
