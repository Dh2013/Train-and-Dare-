import type { BlogCategory, BlogPost } from '../types/blog';
import { buildBlogPlaceholder } from './blogUtils';

export const fallbackBlogCategories: BlogCategory[] = [
  {
    id: 'fallback-entrepreneuriat',
    name: 'Entrepreneuriat',
    slug: 'entrepreneuriat',
    description: 'Idees, methodes et outils pour lancer des projets utiles et durables.',
    color: '#0E9F6E',
    audience: 'adult',
    createdAt: '2026-01-10T09:00:00.000Z',
    updatedAt: '2026-01-10T09:00:00.000Z',
  },
  {
    id: 'fallback-mindset',
    name: 'Mindset',
    slug: 'mindset',
    description: 'Clarte mentale, discipline et confiance pour passer a l action.',
    color: '#166534',
    audience: 'adult',
    createdAt: '2026-01-10T09:00:00.000Z',
    updatedAt: '2026-01-10T09:00:00.000Z',
  },
  {
    id: 'fallback-pnl',
    name: 'PNL',
    slug: 'pnl',
    description: 'Outils de communication et de transformation personnelle appliques au terrain.',
    color: '#F97316',
    audience: 'all',
    createdAt: '2026-01-10T09:00:00.000Z',
    updatedAt: '2026-01-10T09:00:00.000Z',
  },
  {
    id: 'fallback-youth',
    name: 'Developpement jeunesse',
    slug: 'youth-development',
    description: 'Contenus dynamiques pour aider les jeunes a creer, cooperer et oser.',
    color: '#F43F5E',
    audience: 'youth',
    createdAt: '2026-01-10T09:00:00.000Z',
    updatedAt: '2026-01-10T09:00:00.000Z',
  },
];

export const posts: BlogPost[] = [
  {
    id: 'fallback-post-1',
    slug: 'entrepreneurial-mindset-for-adults',
    title: 'Construire un mindset entrepreneurial solide a l age adulte',
    excerpt:
      'Trois leviers simples pour passer de l idee a l action sans perdre votre energie ni votre clarte.',
    content: `
      <p>Un projet avance quand il est porte par une vision claire, mais aussi par un rythme realiste. Chez Train &amp; Dare Academy, nous accompagnons les adultes qui veulent transformer une envie en initiative concrete.</p>
      <h2>1. Clarifier ce qui compte vraiment</h2>
      <p>Avant de chercher plus d outils, prenez le temps de repondre a trois questions : quel probleme voulez-vous resoudre, pour qui, et pourquoi maintenant ? Cette clarte vous aide a faire de meilleurs choix et a prioriser.</p>
      <h2>2. Travailler la confiance en action</h2>
      <p>La confiance ne tombe pas du ciel. Elle se construit par de petites preuves repetees :</p>
      <ul>
        <li>poser une decision claire chaque semaine ;</li>
        <li>tester une idee a petite echelle ;</li>
        <li>observer ce qui fonctionne sans se juger trop vite.</li>
      </ul>
      <h3>Le bon reflexe</h3>
      <p>Quand un blocage apparait, remplacez la question <strong>"Suis-je pret ?"</strong> par <strong>"Quel est mon prochain pas utile ?"</strong>.</p>
    `,
    featuredImage: buildBlogPlaceholder('Mindset entrepreneurial', 'adult'),
    featuredImageAlt: 'Illustration mindset entrepreneurial Train & Dare',
    author: 'Train & Dare Academy',
    category: 'mindset',
    tags: ['mindset', 'entrepreneuriat', 'adultes'],
    date: '2026-02-16',
    status: 'published',
    publishedAt: '2026-02-16T09:00:00.000Z',
    metaTitle: 'Mindset entrepreneurial adulte | Train & Dare Academy',
    metaDescription:
      'Les habitudes qui aident les adultes a lancer un projet avec plus de clarte, de confiance et de discipline.',
    readingTimeMinutes: 3,
    createdAt: '2026-02-15T17:00:00.000Z',
    updatedAt: '2026-02-16T09:00:00.000Z',
  },
  {
    id: 'fallback-post-2',
    slug: 'pnl-tools-for-better-communication',
    title: 'Des outils de PNL pour mieux communiquer et convaincre',
    excerpt:
      'Reformulation, ecoute active et alignement du message : une boite a outils concrete pour les entrepreneurs.',
    content: `
      <p>La PNL est utile quand elle reste pratique. Dans nos ateliers, nous la relions toujours a des situations reelles : presenter son projet, animer un groupe, negocier avec un partenaire ou mieux accompagner un adolescent.</p>
      <h2>Trois outils faciles a tester</h2>
      <ul>
        <li><strong>La reformulation</strong> pour verifier que le message est bien compris.</li>
        <li><strong>Le recadrage</strong> pour transformer un obstacle en piste d action.</li>
        <li><strong>L ancrage</strong> pour retrouver un etat de confiance avant une prise de parole.</li>
      </ul>
      <h3>Pourquoi cela marche ?</h3>
      <p>Parce que la communication devient plus intentionnelle : vous parlez moins pour remplir l espace et davantage pour faire avancer la relation.</p>
    `,
    featuredImage: buildBlogPlaceholder('PNL et communication', 'all'),
    featuredImageAlt: 'Illustration PNL et communication',
    author: 'Equipe pedagogique Train & Dare',
    category: 'pnl',
    tags: ['pnl', 'communication', 'leadership'],
    date: '2026-02-03',
    status: 'published',
    publishedAt: '2026-02-03T10:15:00.000Z',
    metaTitle: 'PNL et communication | Blog Train & Dare',
    metaDescription:
      'Comment utiliser la PNL pour mieux communiquer, presenter ses idees et renforcer son leadership au quotidien.',
    readingTimeMinutes: 4,
    createdAt: '2026-02-01T12:00:00.000Z',
    updatedAt: '2026-02-03T10:15:00.000Z',
  },
  {
    id: 'fallback-post-3',
    slug: 'helping-young-people-dare-to-create',
    title: 'Aider les jeunes a oser creer, collaborer et entreprendre',
    excerpt:
      'Des activites ludiques et energiques pour reveler l initiative, la cooperation et la creativite chez les jeunes.',
    content: `
      <p>Le developpement jeunesse passe par des experiences qui donnent envie d essayer. Un jeune apprend mieux quand il peut imaginer, fabriquer, presenter et recevoir un retour bienveillant.</p>
      <h2>Ce que nous encourageons</h2>
      <ul>
        <li>prendre la parole pour partager une idee ;</li>
        <li>co-creer un mini projet avec un groupe ;</li>
        <li>faire un bilan simple apres chaque experience.</li>
      </ul>
      <h3>Notre conviction</h3>
      <p>L entrepreneuriat chez les jeunes ne commence pas par l entreprise. Il commence par la curiosite, l autonomie et le courage d essayer.</p>
    `,
    featuredImage: buildBlogPlaceholder('Jeunes et initiative', 'youth'),
    featuredImageAlt: 'Illustration developpement jeunesse',
    author: 'Najla Ben Haj Maouia',
    category: 'youth-development',
    tags: ['jeunes', 'leadership', 'creativite'],
    date: '2026-01-24',
    status: 'published',
    publishedAt: '2026-01-24T08:30:00.000Z',
    metaTitle: 'Developpement jeunesse et entrepreneuriat | Train & Dare',
    metaDescription:
      'Des pistes concretes pour accompagner les jeunes vers plus d initiative, de creativite et de confiance.',
    readingTimeMinutes: 3,
    createdAt: '2026-01-21T14:00:00.000Z',
    updatedAt: '2026-01-24T08:30:00.000Z',
  },
];
