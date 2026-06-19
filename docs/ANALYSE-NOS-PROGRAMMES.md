# Analyse – Page 3 « Nos programmes » (Train&Dare)

Document de référence basé sur le fichier « Page 3 NOS PROGRAMMES.docx.pdf ».

---

## 1. Contenu du fichier (synthèse)

### 1.1 Structure demandée

- **Titre** : Nos Programmes
- **Deux blocs principaux côte à côte** :
  - **Éducation à l’entrepreneuriat** (adolescents et jeunes adultes)
  - **Formation en entrepreneuriat** (adultes et porteurs de projets)
- **Design conseillé** : Tailwind/Bootstrap, deux cartes interactives, couleurs différenciées (bleu / orange), animations au survol, icônes modernes (🧠, 🎓, 💬, 🚀, 💼).

### 1.2 Éducation entrepreneuriale (👧)

- **Accroche** : « Planter la graine entrepreneuriale dès l’adolescence pour cultiver un avenir audacieux. »
- **Contexte** : Éducation entrepreneuriale pour ados et jeunes adultes, en lien avec le fonctionnement neurologique de cette période.
- **Objectifs** :
  - Stimuler l’esprit d’initiative
  - Développer la confiance en soi et l’autonomie
  - Aider à faire des choix éclairés
  - Initier à la gestion de projet, à la créativité et à l’innovation
- **Les trois espaces** :
  1. **Espace Ado’preneur** : activités, ateliers, PNL, pédagogie par projet, travail en équipe, prise de parole
  2. **Espace Parents** : sessions d’information, cercles d’échange, coaching pour accompagner le jeune
  3. **Espace Enseignants** : formations pour introduire l’esprit entrepreneurial en classe
- **Liens attendus** :
  - « Voir le programme complet » → page détaillée
  - « Voir le blog : Neurosciences & Adolescence » → blog

### 1.3 Formation en entrepreneuriat – Adultes (👨🏫)

- **Accroche** : « Transformer ses idées en projet. Devenir acteur de sa vie professionnelle. »
- **Cible** : Adultes, jeunes diplômés, chercheurs d’emploi, reconversion.
- **Objectif** : Outils pratiques et état d’esprit pour concrétiser un projet entrepreneurial.
- **Contenu des formations** :
  - Idéation, design thinking, reconnaissance d’opportunité
  - Étude de marché, BMC, business plan
  - Soft skills et compétences entrepreneuriales
  - Marketing et négociation
  - Accompagnement au financement / pitch
- **Méthodes** : Cas pratiques, ateliers, accompagnement personnalisé.
- **Section PNL & Mindset** :
  - Comprendre le cerveau pour apprendre, décider, agir
  - Communication interne/externe, intelligence émotionnelle
  - Croyances limitantes, reprogrammation, passage à l’action
  - Motivation et créativité
  - Gestion du stress, de l’incertitude et de l’échec
- **Concrètement** : Ateliers PNL, modules « cerveau entrepreneurial », visualisation/ancrage, accompagnement posture.
- **Structure en 6 modules** (détail pour page formation) :
  - M1 Se connaître (PNL & neurosciences)
  - M2 De l’idée à l’opportunité
  - M3 Business model solide
  - M4 Plan d’affaires
  - M5 Posture entrepreneuriale (PNL & coaching)
  - M6 Pitcher et passer à l’action
- **Bonus** : Communauté, fiches outils, coaching individuel ou petit groupe.
- **Liens** : « Voir le programme détaillé », « Voir blog entrepreneuriat comme parcours de transformation ».

---

## 2. Manques et incomplet (par rapport au fichier)

| Élément | Attendu (PDF) | État actuel |
|--------|----------------|-------------|
| Deux cartes principales côte à côte | Éducation (bleu) vs Formation (orange) | Page Programmes affiche 3 cartes (Jeunes, Adultes, Workshops) sur une seule ligne, pas de distinction visuelle forte « 2 piliers ». |
| Taglines officielles | Citations exactes du PDF | Partiellement présentes sur FormationPage, pas sur la section Programmes. |
| Les trois espaces (Ado’preneur, Parents, Enseignants) | Visibles depuis la carte Éducation | Liens en bas de page, pas intégrés dans la carte Éducation. |
| Liens « Voir programme complet » / « Voir programme détaillé » | Explicites sur chaque carte | Boutons « Découvrir » existent mais libellés différents. |
| Liens blog | Neurosciences & Adolescence ; parcours de transformation | Non présents sur la section Programmes. |
| Micro-interactions / design moderne | Animations douces, hover, icônes | Hover scale léger uniquement ; pas de transitions avancées ni de hiérarchie visuelle forte. |
| Parcours progressif et visuel | Lecture claire : d’abord 2 choix, puis détails | Un peu mélangé avec Workshops ; pas de « parcours » explicite. |
| Accessibilité | Contrastes, focus, sémantique | Non audité spécifiquement pour cette section. |

---

## 3. Compléments proposés (fidèles à Train&Dare)

- **Section « Nos programmes »** :
  - Un hero court (titre « Nos Programmes », sous-titre aligné vision Train&Dare).
  - **Deux cartes « hero »** côte à côte (Éducation Entrepreneuriale | Formation Entrepreneuriale) avec :
    - Couleurs : bleu pour Éducation, orange pour Formation.
    - Taglines du PDF, objectifs/contenu en listes courtes.
    - Pour la carte Éducation : afficher les **3 espaces** (Ado’preneur, Parents, Enseignants) avec liens vers les pages existantes.
    - CTAs : « Voir le programme complet » → `/programmes/education`, « Voir le programme détaillé » → `/programmes/formation`.
    - Liens secondaires vers le blog (Neurosciences ; parcours de transformation).
  - **Micro-interactions** : hover (scale, ombre, bordure), transitions fluides, feedback au clic.
  - **Typographie** : titres nets, sous-titres lisibles, listes aérées.
- **Conserver** : la 3ᵉ carte Workshops en dessous ou en ligne secondaire, et les boutons « Espace Parent & Ado », « Espace Enseignants », « S’inscrire ».
- **Ne pas supprimer** : contenu existant (ProgramCard, routes, pages détaillées).

---

## 4. Recommandations UX

- **Hiérarchie** : Les deux parcours (Éducation / Formation) doivent être le premier niveau de choix ; Workshops et espaces complémentaires en second.
- **Mobile** : Les deux cartes en pile (une sous l’autre), boutons pleine largeur, espacement tactile suffisant.
- **Accessibilité** : Contraste suffisant (bleu/orange sur fond clair), focus visible sur cartes et boutons, labels explicites pour les liens.
- **Feedback** : Message ou état visuel après clic (ex. navigation immédiate vers la page détaillée).

---

## 5. Recommandations pédagogiques

- **Clarté des cibles** : Toujours préciser « adolescents et jeunes adultes » vs « adultes et porteurs de projets » sur les cartes.
- **Objectifs visibles** : Garder les listes d’objectifs/contenu courtes et scannables pour aider au choix de parcours.
- **Trois espaces** : Les présenter comme le prolongement naturel de l’Éducation (parents et enseignants comme partenaires).

---

## 6. Recommandations techniques

- **Composants** : Une carte « hero » réutilisable (ProgrammeHeroCard) avec props (couleur, tagline, objectifs, espaces, liens) pour éviter la duplication.
- **Styles** : Variables CSS ou Tailwind pour les deux couleurs principales ; transitions via Framer Motion ou CSS.
- **Données** : À terme, contenu (taglines, objectifs, liens) peut venir de l’API programmes pour une seule source de vérité.

---

## 7. Résultat livré (code)

- **ProgrammeHeroCard.tsx** : Carte réutilisable pour les deux piliers (Éducation | Formation) avec tagline, objectifs, 3 espaces (pour Éducation), bouton principal et lien blog. Variantes `education` (bleu) et `formation` (orange). Micro-interactions : `whileHover={{ y: -4 }}`, transitions CSS sur la carte.
- **Programmes.css** : Variables `--color-education` / `--color-formation`, styles des listes d’objectifs, chips des 3 espaces, actions, focus visible pour l’accessibilité.
- **Programmes.tsx** : Section « Nos Programmes » avec hero (titre + sous-titre), deux `ProgrammeHeroCard` côte à côte (Row/Col responsive), bloc « En complément » avec la carte Workshops (ProgramCard existant), puis boutons Espace Parent & Ado, Espace Enseignants, S’inscrire. Contenu des cartes aligné sur le PDF (taglines, objectifs, liens).
- **Aucune suppression** : ProgramCard et routes existantes conservés ; FormationPage et EducationPage inchangées.
