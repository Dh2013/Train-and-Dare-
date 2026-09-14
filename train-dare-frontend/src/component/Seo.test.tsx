import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Seo from './Seo';
import { renderMetadata } from '../seo/metadata';
import { pageSeo } from '../seo/pages';

afterEach(() => {
  cleanup();
  document.head.querySelectorAll('[data-seo-managed]').forEach((element) => element.remove());
  vi.unstubAllEnvs();
});

describe('SEO canonical URLs', () => {
  it('replaces build metadata without duplicates and clears noindex on public navigation', () => {
    vi.stubEnv('VITE_SITE_URL', 'https://academy.example');
    document.head.innerHTML = renderMetadata(pageSeo('/administrateur'), 'https://academy.example');
    const { rerender } = render(<Seo {...pageSeo('/administrateur')} />);
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
    rerender(<Seo {...pageSeo('/blog')} />);
    expect(document.querySelectorAll('meta[name="description"]')).toHaveLength(1);
    expect(document.querySelectorAll('meta[property="og:title"]')).toHaveLength(1);
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'index, follow, max-image-preview:large');
    expect(document.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    const schemas = [...document.querySelectorAll('script[type="application/ld+json"]')].map((element) => JSON.parse(element.textContent!));
    expect(schemas.map((schema) => schema['@type'])).toEqual(['Organization', 'BreadcrumbList']);
  });
  it('uses the configured public origin for canonical, Open Graph and organization URLs', () => {
    vi.stubEnv('VITE_SITE_URL', 'https://academy.example/');
    render(<Seo title="Formation" description="Formation entrepreneuriale" path="/programmes/formation" />);
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute('href', 'https://academy.example/programmes/formation');
    expect(document.querySelector('meta[property="og:url"]')).toHaveAttribute('content', 'https://academy.example/programmes/formation');
    expect(JSON.parse(document.querySelector('script[type="application/ld+json"]')!.textContent!).url).toBe('https://academy.example');
  });

  it('excludes tracking parameters and fragments from the canonical URL', () => {
    vi.stubEnv('VITE_SITE_URL', 'https://academy.example');
    render(<Seo title="Blog" description="Articles" path="/blog?utm_source=test#articles" />);
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute('href', 'https://academy.example/blog');
  });

  it('updates the canonical during navigation and removes it when leaving SEO-managed pages', () => {
    vi.stubEnv('VITE_SITE_URL', 'https://academy.example');
    const { rerender, unmount } = render(<Seo title="Accueil" description="Accueil" path="/" />);
    rerender(<Seo title="Blog" description="Articles" path="/blog" />);
    expect(document.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute('href', 'https://academy.example/blog');
    unmount();
    expect(document.querySelectorAll('[data-seo-managed]')).toHaveLength(0);
  });

  it('keeps local development working when no public origin is configured', () => {
    vi.stubEnv('VITE_SITE_URL', '');
    render(<Seo title="Accueil" description="Accueil" path="/" />);
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute('href', `${window.location.origin}/`);
  });
});
