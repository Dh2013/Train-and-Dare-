# Analyse du projet Train&Dare – Éducation Entrepreneuriale

Document de référence basé sur la description officielle du projet (sous-page 3 – Programme EE) et l’état actuel de la plateforme.

---

## 1. Vision et identité (alignement PDF)

- **Mission** : Donner aux jeunes (13–25 ans) les clés pour imaginer, créer et agir, en mobilisant parents et enseignants.
- **Cible** : Adolescence étendue (neurosciences) = 13–25 ans pour l’Ado-preneur ; parents et enseignants pour les deux autres espaces.
- **Trois univers** :
  - **Ado-preneur** : initiation à l’entrepreneuriat (ateliers, projets, PNL, éducation financière, bootcamp).
  - **Parent & Ado** : outiller les parents, dialogue constructif, complicité intergénérationnelle.
  - **Espace Enseignants** : former les éducateurs, pédagogie entrepreneuriale, ressources clés en main.

Ces éléments doivent rester la boussole du produit et du contenu.

---

## 2. Forces actuelles

| Élément | État |
|--------|------|
| **Identité visuelle** | Cohérente (Train & Dare Academy, couleurs, ton). |
| **Structure site** | Accueil, À propos, Programmes, Coaching, Blog, FAQ, Contact. |
| **Blog** | Liste, détail, administration avec éditeur riche et API CRUD. |
| **Backend** | Express, CORS, routes programmes / blogs / contact. |
| **Stack** | React 19, Vite, Ant Design, Tailwind, Framer Motion. |
| **Contenu Programme Ado** | Formation Jeunes (Ado’preneur 13–25 ans) déjà présent dans Programmes et FormationPage. |
| **Contact** | Formulaire + API qui enregistre les messages. |

---

## 3. Manques et imprécisions (par rapport au PDF)

### 3.1 Contenu et structure des programmes

- **PDF** décrit **4 programmes** dans l’Espace Ado-preneur :
  1. Éducation à l’entrepreneuriat (48 h / 6 mois, deux volets : esprit d’entreprendre + esprit d’entreprise).
  2. PNL pour Ados – « Inside Out » (5 modules détaillés, 5 semaines ou 5 jours intensif).
  3. Éducation financière pour Ados et jeunes adultes.
  4. Stage vacances (Bootcamp).

- **Site actuel** : un bloc « Programme Jeunes » / Éducation, sans détail par sous-programme (PNL Inside Out, Éducation financière, Bootcamp) ni durée/format alignés sur le PDF.

- **Parent & Ado** : le PDF liste 3 programmes (Éducation entrepreneuriale familiale, Softskills parents, PNL au service des parents). **Aucune page dédiée** sur le site.

- **Espace Enseignants** : le PDF liste 3 programmes (Pédagogie entrepreneuriale, Softskills, PNL). **Aucune page dédiée** sur le site.

### 3.2 Parcours utilisateur et inscriptions

- **PDF** : boutons « S’inscrire au programme » / « Choisir le programme » sans flux décrit.
- **Site** : boutons « S’inscrire » sans formulaire d’inscription ni envoi à un backend (candidature par programme).
- **Manque** : parcours clair (choix du programme → formulaire candidature → accusé de réception / confirmation).

### 3.3 Données et API

- **programs.json** actuel : contenu générique (Fullstack, Data Science), non aligné avec les trois univers et les programmes du PDF.
- **Manque** : modèle de données « univers → programmes » avec champs (titre, durée, public, objectifs, lien inscription).

### 3.4 UX et accessibilité

- Pas de fil d’Ariane.
- Pas de page « Nos programmes » listant explicitement les 3 espaces (Ado-preneur, Parent & Ado, Enseignants).
- Liens « Découvrir » / « S’inscrire » sans destination unique (inscription par programme).

### 3.5 Sécurité et conformité

- Pas d’authentification (admin blog exposée sans protection).
- Pas de politique de confidentialité ni de gestion du consentement (RGPD) pour formulaires (contact, inscription).
- Pas de rate limiting ni validation stricte des champs côté API.

### 3.6 Pédagogie et contenu

- Les 5 modules PNL « Inside Out » du PDF ne sont pas reflétés dans une page dédiée (objectifs, activités, focus neurosciences).
- Pas de distinction claire 13–18 vs 19–25 ans dans les parcours affichés.

---

## 4. Améliorations proposées (compléments cohérents)

- **Données** : Aligner `programs.json` (ou équivalent) sur les 3 univers et les programmes du PDF ; exposer une API programmes (liste, par univers, par slug).
- **Inscriptions** : API « candidatures » (programme, nom, email, tranche d’âge, message) + formulaire d’inscription par programme avec message de confirmation.
- **Pages dédiées** : 
  - **Espace Parent & Ado** : une page présentant les 3 programmes et un CTA vers l’inscription.
  - **Espace Enseignants** : idem.
- **Page Ado-preneur** : conserver l’existant et compléter avec les 4 programmes (Éducation, PNL Inside Out, Éducation financière, Bootcamp) et liens « S’inscrire » pointant vers le formulaire d’inscription avec programme pré-sélectionné.
- **Sécurité** : Validation et sanitization des entrées (déjà en place pour le blog) ; à terme : auth admin, rate limiting, politique de confidentialité et mentions légales.
- **Cohérence du nommage** : Utiliser partout « Ado-preneur », « Parent & Ado », « Espace Enseignants », « Train&Dare » / « Train & Dare Academy » comme dans le PDF et la charte.

Ces compléments ne remplacent pas les blocs existants ; ils les enrichissent et les rendent cohérents avec la description officielle.

---

## 5. Recommandations UX

- **Navigation** : Un lien « Nos espaces » ou « Programmes » qui mène à une page listant les 3 univers ; depuis chaque univers, accès aux sous-programmes et à « S’inscrire ».
- **Formulaires** : Champs courts, labels clairs, message de succès explicite (« Votre demande d’inscription a bien été enregistrée ») et indication du traitement (ex. « Nous vous recontacterons sous 48 h »).
- **Mobile** : Conserver la priorité mobile (cartes, boutons, formulaires déjà adaptés).
- **Accessibilité** : Contraste suffisant, libellés sur les champs, messages d’erreur associés aux bons champs.

---

## 6. Recommandations pédagogiques

- **Clarté des publics** : Toujours indiquer « 13–18 ans » / « 19–25 ans » ou « 13–25 ans » selon le programme, comme dans le PDF.
- **Objectifs et activités** : Pour chaque programme (surtout PNL Inside Out), afficher objectifs et types d’activités (ex. « test sensoriel, jeu des valeurs », « mur des freins, visualisation ») pour rassurer et orienter.
- **Durée et format** : Afficher systématiquement (ex. « 48 h sur 6 mois », « 5 modules sur 5 semaines ou 5 jours intensif »).
- **Parents et enseignants** : Mettre en avant le rôle de « coach » et « passeur d’initiatives » pour renforcer l’alignement avec le PDF.

---

## 7. Recommandations techniques

- **Backend** : Garder Express ; structurer les données (programmes, candidatures) en JSON ou, à l’échelle, migrer vers une base (SQLite/PostgreSQL) avec schéma clair.
- **Frontend** : Conserver React/Vite ; charger les programmes depuis l’API pour une seule source de vérité.
- **Sécurité** : Validation + sanitization sur toutes les entrées ; HTTPS en production ; à terme : auth (JWT/session) pour `/blog/admin`, rate limiting, CORS restreint.
- **Maintenabilité** : Code commenté, types TypeScript partagés (front/back), noms de routes et de champs cohérents (slug, `programmeId`, etc.).

---

*Document produit pour aligner la plateforme avec la description officielle Train&Dare – Éducation Entrepreneuriale (sous-page 3 – programme EE) sans modifier l’identité ni les blocs existants.*
