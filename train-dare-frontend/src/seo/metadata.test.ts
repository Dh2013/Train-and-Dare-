import { describe, expect, it } from 'vitest';
import { buildMetadata, canonicalUrl, renderMetadata, siteOrigin } from './metadata';
import { pages, pageSeo } from './pages';

describe('public page metadata', () => {
  it('provides distinct descriptions and one canonical per indexable page in raw HTML', () => {
    const descriptions = new Set<string>();
    for (const [path, page] of Object.entries(pages)) {
      const doc = new DOMParser().parseFromString(renderMetadata(pageSeo(path), 'https://academy.example'), 'text/html');
      expect(doc.title).toContain(page.title);
      expect(doc.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(page.description);
      expect(doc.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe(doc.title);
      expect(doc.querySelector('meta[name="twitter:description"]')?.getAttribute('content')).toBe(page.description);
      expect(doc.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe('https://academy.example/social-cover.jpg');
      expect(doc.querySelectorAll('link[rel="canonical"]')).toHaveLength(page.noindex ? 0 : 1);
      if (!page.noindex) {
        expect(descriptions.has(page.description)).toBe(false);
        descriptions.add(page.description);
      }
    }
  });

  it('escapes CMS text in HTML attributes and JSON-LD without executing markup', () => {
    const title = 'Un titre "test" </script><script>alert(1)</script>';
    const doc = new DOMParser().parseFromString(renderMetadata({ title, description: title, path: '/blog/test', type: 'article' }, 'https://academy.example'), 'text/html');
    expect(doc.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(title);
    expect(doc.querySelectorAll('script')).toHaveLength(2);
    expect(doc.querySelectorAll('script:not([type="application/ld+json"])')).toHaveLength(0);
    expect(JSON.parse(doc.querySelector('script')!.textContent!).headline).toBe(title);
  });

  it('replaces inline images with a fetchable JPEG and supplies article context', () => {
    const data = buildMetadata({ title: 'Article', description: 'Résumé', type: 'article', image: 'data:image/svg+xml,test', author: 'Autrice', publishedTime: '2026-01-01', path: '/blog/article' }, 'https://academy.example');
    expect(data.meta.find((meta) => meta.key === 'og:image')?.content).toBe('https://academy.example/social-cover.jpg');
    expect(data.structuredData).toMatchObject({ '@type': 'BlogPosting', author: { name: 'Autrice' }, mainEntityOfPage: 'https://academy.example/blog/article' });
  });

  it('does not invent a production canonical when the origin is unknown', () => {
    expect(renderMetadata(pageSeo('/blog'))).not.toContain('rel="canonical"');
    expect(siteOrigin()).toBeUndefined();
    expect(() => siteOrigin('https://academy.example/path')).toThrow();
  });

  it('normalizes trailing slashes and excludes tracking from canonical URLs', () => {
    expect(canonicalUrl('/blog/?utm_source=social#article', 'https://academy.example')).toBe('https://academy.example/blog');
  });

  it('uses the real blog hierarchy and recognizes an organization author', () => {
    const data = buildMetadata({ title: 'Article', description: 'Résumé', type: 'article', author: 'Train & Dare Academy', path: '/blog/article' }, 'https://academy.example');
    expect(data.structuredData).toMatchObject({ author: { '@type': 'Organization', name: 'Train & Dare Academy' } });
    expect(data.breadcrumbData?.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://academy.example/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://academy.example/blog' },
      { '@type': 'ListItem', position: 3, name: 'Article', item: 'https://academy.example/blog/article' },
    ]);
    expect(buildMetadata(pageSeo('/administrateur'), 'https://academy.example').breadcrumbData).toBeUndefined();
    expect(buildMetadata(pageSeo('/blog')).breadcrumbData).toBeUndefined();
  });
});
