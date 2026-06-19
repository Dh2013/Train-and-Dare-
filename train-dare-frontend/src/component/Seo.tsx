import { useEffect } from 'react';

interface SeoProps {
  title: string;
  description: string;
  image?: string;
  path?: string;
  type?: 'website' | 'article';
  keywords?: string[];
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
}

const SITE_NAME = 'Train & Dare Academy';
const DEFAULT_DESCRIPTION =
  'Train & Dare Academy partage des ressources sur l entrepreneuriat, le mindset, la PNL et le developpement jeunesse.';
const MANAGED_ATTR = 'data-seo-managed';

function getBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return import.meta.env.VITE_SITE_URL || 'http://localhost:5173';
}

function createMeta(attribute: 'name' | 'property', key: string, content: string): HTMLMetaElement {
  const meta = document.createElement('meta');
  meta.setAttribute(attribute, key);
  meta.content = content;
  meta.setAttribute(MANAGED_ATTR, 'true');
  return meta;
}

export default function Seo({
  title,
  description,
  image,
  path = '',
  type = 'website',
  keywords,
  structuredData,
}: SeoProps) {
  useEffect(() => {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}${path}`;
    const cleanDescription = description.trim() || DEFAULT_DESCRIPTION;
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    const imageUrl =
      image && !image.startsWith('data:') && !image.startsWith('http')
        ? `${baseUrl}${image.startsWith('/') ? image : `/${image}`}`
        : image;
    const defaultStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE_NAME,
      url: baseUrl,
      description: cleanDescription,
    };
    const jsonLd = structuredData ?? defaultStructuredData;

    document.title = fullTitle;
    document.head.querySelectorAll(`[${MANAGED_ATTR}="true"]`).forEach((element) => element.remove());

    const elements: HTMLElement[] = [
      createMeta('name', 'description', cleanDescription),
      createMeta('property', 'og:title', fullTitle),
      createMeta('property', 'og:description', cleanDescription),
      createMeta('property', 'og:type', type),
      createMeta('property', 'og:url', url),
      createMeta('property', 'og:site_name', SITE_NAME),
      createMeta('name', 'twitter:card', imageUrl ? 'summary_large_image' : 'summary'),
      createMeta('name', 'twitter:title', fullTitle),
      createMeta('name', 'twitter:description', cleanDescription),
    ];

    if (keywords && keywords.length > 0) {
      elements.push(createMeta('name', 'keywords', keywords.join(', ')));
    }

    if (imageUrl) {
      elements.push(createMeta('property', 'og:image', imageUrl));
      elements.push(createMeta('name', 'twitter:image', imageUrl));
    }

    const canonical = document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = url;
    canonical.setAttribute(MANAGED_ATTR, 'true');
    elements.push(canonical);

    const jsonLdScript = document.createElement('script');
    jsonLdScript.type = 'application/ld+json';
    jsonLdScript.text = JSON.stringify(jsonLd);
    jsonLdScript.setAttribute(MANAGED_ATTR, 'true');
    elements.push(jsonLdScript);

    document.head.append(...elements);
  }, [description, image, keywords, path, structuredData, title, type]);

  return null;
}
