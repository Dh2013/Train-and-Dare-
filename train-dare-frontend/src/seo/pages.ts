import type { BlogPost } from '../types/blog';

export const SITE_NAME = 'Train & Dare Academy';
export const SITE_DESCRIPTION = 'Train & Dare Academy accompagne jeunes, adultes et porteurs de projet avec des formations en entrepreneuriat et du coaching en développement personnel.';

export interface PageSeo {
  title: string;
  description: string;
  path?: string;
  image?: string;
  imageAlt?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
}

export const pages: Record<string, PageSeo> = {
  '/': { title: 'Entrepreneuriat, formation et coaching', description: SITE_DESCRIPTION },
  '/programmes/education': {
    title: 'Éducation entrepreneuriale pour jeunes et adolescents',
    description: 'Des ateliers pour développer la confiance, la créativité et l’esprit entrepreneurial des jeunes : projets concrets, coopération et prise de parole.',
  },
  '/programmes/formation': {
    title: 'Formation entrepreneuriale pour adultes',
    description: 'Transformez votre idée en projet : formation entrepreneuriale pour adultes, porteurs de projet et personnes en reconversion, avec un accompagnement pratique.',
  },
  '/programmes/parent-ado': {
    title: 'Parent & ado : confiance, orientation et projets',
    description: 'Accompagnez votre adolescent dans sa confiance, son orientation et ses projets grâce aux ateliers et à l’accompagnement familial de Train & Dare Academy.',
  },
  '/programmes/enseignants': {
    title: 'Entrepreneuriat : formations pour enseignants',
    description: 'Formations et ressources pour enseignants et éducateurs : pédagogie entrepreneuriale, compétences relationnelles et projets en établissement scolaire.',
  },
  '/adult-plus-info': {
    title: 'Parcours adulte : de l’idée au projet entrepreneurial',
    description: 'Découvrez le parcours adulte : validation de l’idée, business model, marketing, financement et coaching pour structurer et lancer votre projet.',
  },
  '/blog': {
    title: 'Blog : entrepreneuriat, mindset et développement personnel',
    description: 'Explorez les articles Train & Dare Academy sur l’entrepreneuriat, la confiance, la PNL et le développement des jeunes pour passer de l’idée à l’action.',
  },
  '/inscription': {
    title: 'Inscription aux programmes et accompagnements',
    description: 'Choisissez votre parcours Train & Dare Academy et envoyez votre demande d’inscription : programmes jeunes, formations adultes et accompagnement familial.',
  },
  '/landing/education': {
    title: 'Ateliers d’entrepreneuriat pour les jeunes',
    description: 'Aidez les jeunes à oser, créer et présenter leurs idées grâce à des ateliers d’entrepreneuriat fondés sur les projets, la confiance et la coopération.',
  },
  '/landing/formation': {
    title: 'Donnez forme à votre projet entrepreneurial',
    description: 'Clarifiez votre idée, votre positionnement et vos prochaines étapes grâce à une formation entrepreneuriale adaptée aux adultes et aux porteurs de projet.',
  },
  '/landing/coaching': {
    title: 'Coaching mindset et passage à l’action',
    description: 'Identifiez vos blocages, clarifiez vos objectifs et construisez un plan d’action avec le coaching Train & Dare Academy pour jeunes, adultes et équipes.',
  },
  '/administrateur': { title: 'Connexion administration', description: 'Connexion à l’espace d’administration de Train & Dare Academy.', noindex: true },
  '/editeur': { title: 'Administration du blog', description: 'Gestion des articles du blog Train & Dare Academy.', noindex: true },
  '/blog/admin': { title: 'Administration du blog', description: 'Gestion des articles du blog Train & Dare Academy.', noindex: true },
  '/404': { title: 'Page introuvable', description: 'Cette page est introuvable. Retrouvez les programmes et les articles de Train & Dare Academy.', noindex: true },
};

export function pageSeo(path: string): PageSeo {
  return { ...pages[path], path };
}

export function articleSeo(post: BlogPost): PageSeo {
  return {
    title: post.metaTitle?.trim() || post.title,
    description: post.metaDescription?.trim() || post.excerpt,
    path: `/blog/${post.slug}`, image: post.featuredImage,
    imageAlt: post.featuredImageAlt || post.title, type: 'article',
    author: post.author, publishedTime: post.publishedAt || post.date, modifiedTime: post.updatedAt,
  };
}
