import type { BlogCategory, CategoryAudience } from '../types/blog';

const DATE_FORMATTER = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export function formatBlogDate(value?: string): string {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return DATE_FORMATTER.format(date);
}

export function slugifyBlogValue(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function truncateBlogText(value: string, maxLength: number): string {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  const sliced = trimmed.slice(0, maxLength).trim();
  const lastWord = sliced.lastIndexOf(' ');
  return `${(lastWord > 30 ? sliced.slice(0, lastWord) : sliced).trim()}...`;
}

export function getAudienceFromCategory(categorySlug: string, categories: BlogCategory[]): CategoryAudience {
  return categories.find((category) => category.slug === categorySlug)?.audience ?? 'adult';
}

export function getCategoryBySlug(categorySlug: string, categories: BlogCategory[]): BlogCategory | undefined {
  return categories.find((category) => category.slug === categorySlug);
}

export function buildBlogPlaceholder(title: string, audience: CategoryAudience = 'adult'): string {
  const tones: Record<CategoryAudience, { primary: string; secondary: string; accent: string }> = {
    adult: { primary: '#0E9F6E', secondary: '#052E2B', accent: '#D1FAE5' },
    youth: { primary: '#F43F5E', secondary: '#7C2D12', accent: '#FFF7ED' },
    all: { primary: '#0F766E', secondary: '#172554', accent: '#EFF6FF' },
  };
  const palette = tones[audience];
  const safeTitle = title.replace(/[<>&'"]/g, '');
  const shortTitle = safeTitle.length > 42 ? `${safeTitle.slice(0, 39)}...` : safeTitle;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${palette.primary}" />
          <stop offset="100%" stop-color="${palette.secondary}" />
        </linearGradient>
      </defs>
      <rect width="1200" height="720" rx="40" fill="url(#bg)" />
      <circle cx="1000" cy="120" r="180" fill="${palette.accent}" opacity="0.18" />
      <circle cx="180" cy="610" r="210" fill="${palette.accent}" opacity="0.12" />
      <rect x="78" y="74" width="312" height="54" rx="27" fill="rgba(255,255,255,0.16)" />
      <text x="116" y="108" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#FFFFFF">Train &amp; Dare Academy</text>
      <text x="80" y="258" font-family="Arial, sans-serif" font-size="72" font-weight="800" fill="#FFFFFF">${shortTitle}</text>
      <text x="82" y="328" font-family="Arial, sans-serif" font-size="26" fill="rgba(255,255,255,0.82)">Blog article</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function toDatetimeLocal(value?: string): string {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  const hours = `${date.getHours()}`.padStart(2, '0');
  const minutes = `${date.getMinutes()}`.padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function fromDatetimeLocal(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  return date.toISOString();
}
