import { Helmet } from 'react-helmet-async';

interface SeoProps {
  title: string;
  description: string;
  image?: string;
  path?: string;
  type?: 'website' | 'article';
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
}: SeoProps) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${path}`;
  const cleanDescription = description.trim() || DEFAULT_DESCRIPTION;
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={cleanDescription} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={cleanDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={SITE_NAME} />
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={cleanDescription} />
      {image && <meta name="twitter:image" content={image} />}
      <link rel="canonical" href={url} />
    </Helmet>
  );
}
