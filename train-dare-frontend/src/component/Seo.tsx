import { useEffect } from 'react';
import { buildMetadata, MANAGED_ATTR, siteOrigin } from '../seo/metadata';
import type { PageSeo } from '../seo/pages';

export default function Seo(props: PageSeo) {
  useEffect(() => {
    const origin = siteOrigin(import.meta.env.VITE_SITE_URL, window.location.origin);
    const data = buildMetadata(props, origin);
    const previousTitle = document.title;
    document.title = data.title;
    document.head.querySelectorAll(`[${MANAGED_ATTR}]`).forEach((element) => element.remove());
    const elements: HTMLElement[] = data.meta.map(({ attribute, key, content }) => {
      const meta = document.createElement('meta');
      meta.setAttribute(attribute, key);
      meta.content = content;
      return meta;
    });
    if (data.canonical) {
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = data.canonical;
      elements.push(link);
    }
    for (const schema of [data.structuredData, data.breadcrumbData]) {
      if (!schema) continue;
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(schema);
      elements.push(script);
    }
    elements.forEach((element) => element.setAttribute(MANAGED_ATTR, 'true'));
    document.head.append(...elements);
    return () => {
      elements.forEach((element) => element.remove());
      document.title = previousTitle;
    };
  }, [props]);
  return null;
}
