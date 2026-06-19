import { Helmet } from 'react-helmet-async';

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

function getBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return import.meta.env.VITE_SITE_URL || 'http://localhost:5173';
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

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={cleanDescription} />
      {keywords && keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={cleanDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={SITE_NAME} />
      {imageUrl && <meta property="og:image" content={imageUrl} />}
      <meta name="twitter:card" content={imageUrl ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={cleanDescription} />
      {imageUrl && <meta name="twitter:image" content={imageUrl} />}
      <link rel="canonical" href={url} />
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
}
