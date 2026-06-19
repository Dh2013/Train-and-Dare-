export function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function truncateText(value: string, maxLength: number): string {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  const sliced = trimmed.slice(0, maxLength).trim();
  const lastWordBoundary = sliced.lastIndexOf(' ');
  return `${(lastWordBoundary > 40 ? sliced.slice(0, lastWordBoundary) : sliced).trim()}...`;
}

export function estimateReadingTime(value: string): number {
  const words = stripHtml(value).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 180));
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

