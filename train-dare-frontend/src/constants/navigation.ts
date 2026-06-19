/**
 * Identifiants des sections de la page d'accueil (ancres).
 * Utilisés pour le menu, le scroll et le footer.
 */
export const SECTION_IDS = [
  'accueil',
  'apropos',
  'programmes',
  'coaching',
  'temoignages',
  'blog',
  'faq',
  'contact',
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

/** Libellés affichés dans le menu et le footer */
export const SECTION_LABELS: Record<string, string> = {
  accueil: 'Accueil',
  apropos: 'À propos',
  programmes: 'Programmes',
  coaching: 'Coaching',
  temoignages: 'Témoignages',
  blog: 'Blog',
  faq: 'FAQ',
  contact: 'Contact',
};

/** Sections visibles dans la barre de navigation (sans temoignages et faq) */
export const NAV_SECTION_IDS = SECTION_IDS.filter(
  (s) => s !== 'temoignages' && s !== 'faq'
);
