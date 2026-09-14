import { SITE_NAME, SITE_DESCRIPTION } from './pages';
import type { PageSeo } from './pages';

export const MANAGED_ATTR = 'data-seo-managed';
export const DEFAULT_IMAGE = '/social-cover.jpg';

export function siteOrigin(configured?: string, fallback?: string): string | undefined {
  const value = configured?.trim() || fallback;
  if (!value) return undefined;
  const url = new URL(value);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password ||
      url.pathname !== '/' || url.search || url.hash) {
    throw new Error('VITE_SITE_URL must be an HTTP(S) origin without a path, query or credentials.');
  }
  return url.origin;
}

export function canonicalUrl(path: string, origin: string): string {
  const url = new URL(`/${path.replace(/^\/+/, '')}`, origin);
  url.search = '';
  url.hash = '';
  url.pathname = url.pathname.replace(/\/+$/, '') || '/';
  return url.href;
}

function socialImage(image: string | undefined, origin: string): string {
  try {
    const url = new URL(image || DEFAULT_IMAGE, origin);
    if (['https:', 'http:'].includes(url.protocol)) return url.href;
  } catch { /* Invalid or inline images use the public JPEG instead. */ }
  return new URL(DEFAULT_IMAGE, origin).href;
}

export function buildMetadata(page: PageSeo, origin?: string) {
  const title = page.title.includes(SITE_NAME) ? page.title : `${page.title} | ${SITE_NAME}`;
  const description = page.description.trim() || SITE_DESCRIPTION;
  const url = origin ? canonicalUrl(page.path || '/', origin) : undefined;
  const image = origin ? socialImage(page.image, origin) : undefined;
  const imageAlt = page.imageAlt || SITE_NAME;
  const meta: { attribute: 'name' | 'property'; key: string; content: string }[] = [];
  const add = (attribute: 'name' | 'property', key: string, content?: string) => {
    if (content) meta.push({ attribute, key, content });
  };
  add('name', 'description', description);
  add('name', 'robots', page.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large');
  add('property', 'og:title', title);
  add('property', 'og:description', description);
  add('property', 'og:type', page.type || 'website');
  add('property', 'og:site_name', SITE_NAME);
  add('property', 'og:locale', 'fr_FR');
  add('property', 'og:url', url);
  add('property', 'og:image', image);
  add('property', 'og:image:alt', image ? imageAlt : undefined);
  add('name', 'twitter:card', image ? 'summary_large_image' : 'summary');
  add('name', 'twitter:title', title);
  add('name', 'twitter:description', description);
  add('name', 'twitter:image', image);
  add('name', 'twitter:image:alt', image ? imageAlt : undefined);
  add('name', 'author', page.author);
  if (page.type === 'article') {
    add('property', 'article:published_time', page.publishedTime);
    add('property', 'article:modified_time', page.modifiedTime);
  }
  const organization = {
    '@context': 'https://schema.org', '@type': 'Organization',
    '@id': origin ? `${origin}/#organization` : undefined,
    name: SITE_NAME, url: origin, description: SITE_DESCRIPTION,
  };
  const structuredData = page.noindex ? undefined : page.structuredData || (page.type === 'article' ? {
    '@context': 'https://schema.org', '@type': 'BlogPosting',
    headline: page.title, description, image, url, mainEntityOfPage: url,
    author: page.author === SITE_NAME ? organization : page.author ? { '@type': 'Person', name: page.author } : undefined,
    publisher: organization, datePublished: page.publishedTime, dateModified: page.modifiedTime, inLanguage: 'fr',
  } : organization);
  // Use only existing navigation: home, the public blog list, and the current page.
  const breadcrumbItems = origin && url && !page.noindex && new URL(url).pathname !== '/' ? [
    { name: 'Accueil', item: canonicalUrl('/', origin) },
    ...(page.type === 'article' ? [{ name: 'Blog', item: canonicalUrl('/blog', origin) }] : []),
    { name: page.title, item: url },
  ] : [];
  const breadcrumbData = breadcrumbItems.length ? {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, index) => ({ '@type': 'ListItem', position: index + 1, ...item })),
  } : undefined;
  return { title, meta, canonical: page.noindex ? undefined : url, structuredData, breadcrumbData };
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
}

export function renderMetadata(page: PageSeo, origin?: string): string {
  const data = buildMetadata(page, origin);
  const managed = `${MANAGED_ATTR}="true"`;
  return [
    `<title>${escapeHtml(data.title)}</title>`,
    ...data.meta.map(({ attribute, key, content }) => `<meta ${managed} ${attribute}="${key}" content="${escapeHtml(content)}" />`),
    data.canonical ? `<link ${managed} rel="canonical" href="${escapeHtml(data.canonical)}" />` : '',
    ...[data.structuredData, data.breadcrumbData].filter(Boolean).map((schema) =>
      `<script ${managed} type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>`),
  ].filter(Boolean).join('\n');
}
