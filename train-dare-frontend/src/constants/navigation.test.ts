import { describe, it, expect } from 'vitest';
import { SECTION_IDS, NAV_SECTION_IDS, SECTION_LABELS } from './navigation';

describe('navigation constants', () => {
  it('SECTION_IDS includes accueil, contact, blog', () => {
    expect(SECTION_IDS).toContain('accueil');
    expect(SECTION_IDS).toContain('contact');
    expect(SECTION_IDS).toContain('blog');
  });

  it('NAV_SECTION_IDS excludes temoignages and faq', () => {
    expect(NAV_SECTION_IDS).not.toContain('temoignages');
    expect(NAV_SECTION_IDS).not.toContain('faq');
    expect(NAV_SECTION_IDS).toContain('accueil');
    expect(NAV_SECTION_IDS).toContain('contact');
  });

  it('SECTION_LABELS returns French labels for known sections', () => {
    expect(SECTION_LABELS['accueil']).toBe('Accueil');
    expect(SECTION_LABELS['apropos']).toBe('À propos');
    expect(SECTION_LABELS['blog']).toBe('Blog');
    expect(SECTION_LABELS['contact']).toBe('Contact');
  });
});
