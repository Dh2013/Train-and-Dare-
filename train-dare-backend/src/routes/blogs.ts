import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import DOMPurify from 'isomorphic-dompurify';
import { getJwtSecret, requireAdmin } from '../middleware/auth';

const router = Router();
const dataDir = path.join(process.cwd(), 'src', 'data');
const blogsFile = path.join(dataDir, 'blogs.json');
const categoriesFile = path.join(dataDir, 'blog-categories.json');

export type BlogStatus = 'draft' | 'scheduled' | 'published';
export type CategoryAudience = 'adult' | 'youth' | 'all';

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  audience: CategoryAudience;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  featuredImageAlt: string;
  author: string;
  category: string;
  tags: string[];
  date: string;
  status: BlogStatus;
  scheduledFor?: string;
  publishedAt?: string;
  metaTitle: string;
  metaDescription: string;
  readingTimeMinutes: number;
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_CATEGORIES: BlogCategory[] = [
  {
    id: 'cat-entrepreneuriat',
    name: 'Entrepreneuriat',
    slug: 'entrepreneuriat',
    description: 'Idees, methodes et outils pour lancer des projets utiles et durables.',
    color: '#0E9F6E',
    audience: 'adult',
    createdAt: '2026-01-01T09:00:00.000Z',
    updatedAt: '2026-01-01T09:00:00.000Z',
  },
  {
    id: 'cat-mindset',
    name: 'Mindset',
    slug: 'mindset',
    description: 'Clarte mentale, discipline et confiance pour passer a l action.',
    color: '#166534',
    audience: 'adult',
    createdAt: '2026-01-01T09:00:00.000Z',
    updatedAt: '2026-01-01T09:00:00.000Z',
  },
  {
    id: 'cat-pnl',
    name: 'PNL',
    slug: 'pnl',
    description: 'Outils de communication et de transformation personnelle appliques au terrain.',
    color: '#F97316',
    audience: 'all',
    createdAt: '2026-01-01T09:00:00.000Z',
    updatedAt: '2026-01-01T09:00:00.000Z',
  },
  {
    id: 'cat-youth-development',
    name: 'Developpement jeunesse',
    slug: 'youth-development',
    description: 'Contenus dynamiques pour aider les jeunes a creer, cooperer et oser.',
    color: '#F43F5E',
    audience: 'youth',
    createdAt: '2026-01-01T09:00:00.000Z',
    updatedAt: '2026-01-01T09:00:00.000Z',
  },
];

const HTML_ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'em',
  'u',
  'h1',
  'h2',
  'h3',
  'ul',
  'ol',
  'li',
  'blockquote',
  'a',
  'img',
];
const HTML_ALLOWED_ATTR = ['href', 'src', 'alt', 'title'];
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const COLOR_REGEX = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
const MAX_TITLE = 200;
const MAX_EXCERPT = 320;
const MAX_CONTENT = 120_000;
const MAX_TAGS = 20;
const MAX_TAG_LENGTH = 50;
const MAX_AUTHOR = 100;
const MAX_META_TITLE = 70;
const MAX_META_DESCRIPTION = 170;
const MAX_IMAGE_URL = 2_000;
const MAX_CATEGORY_NAME = 80;
const MAX_CATEGORY_DESCRIPTION = 240;

function ensureDataFile(filePath: string, fallback: unknown): void {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), 'utf8');
  }
}

function readJsonArray(filePath: string, fallback: unknown[]): unknown[] {
  ensureDataFile(filePath, fallback);
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(filePath: string, value: unknown): void {
  ensureDataFile(filePath, value);
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf8');
}

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: HTML_ALLOWED_TAGS,
    ALLOWED_ATTR: HTML_ALLOWED_ATTR,
  });
}

function plainTextFromHtml(html: string): string {
  return sanitizeHtml(html)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncateText(value: string, maxLength: number): string {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  const sliced = trimmed.slice(0, maxLength).trim();
  const lastWord = sliced.lastIndexOf(' ');
  return `${(lastWord > 40 ? sliced.slice(0, lastWord) : sliced).trim()}...`;
}

function sanitizeTag(tag: string): string {
  return tag.slice(0, MAX_TAG_LENGTH).replace(/[<>"']/g, '').trim();
}

function normalizeIso(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.trim()) {
    return undefined;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }
  return parsed.toISOString();
}

function estimateReadingTime(content: string): number {
  const words = plainTextFromHtml(content).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 180));
}

function encodeSvg(svg: string): string {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function createPlaceholderImage(title: string, audience: CategoryAudience): string {
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
      <rect width="1200" height="720" fill="url(#bg)" rx="40" />
      <circle cx="990" cy="120" r="190" fill="${palette.accent}" opacity="0.16" />
      <circle cx="160" cy="610" r="220" fill="${palette.accent}" opacity="0.12" />
      <rect x="76" y="70" width="280" height="52" rx="26" fill="rgba(255,255,255,0.18)" />
      <text x="112" y="103" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#FFFFFF">Train &amp; Dare Academy</text>
      <text x="78" y="262" font-family="Arial, sans-serif" font-size="74" font-weight="800" fill="#FFFFFF">${shortTitle}</text>
      <text x="80" y="332" font-family="Arial, sans-serif" font-size="26" fill="rgba(255,255,255,0.82)">Blog article</text>
    </svg>
  `;
  return encodeSvg(svg);
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

function getCategoryAudience(categorySlug: string, categories: BlogCategory[]): CategoryAudience {
  return categories.find((category) => category.slug === categorySlug)?.audience ?? 'adult';
}

function pickFallbackCategory(tags: string[], categories: BlogCategory[]): string {
  const joined = tags.join(' ').toLowerCase();
  if (joined.includes('pnl')) {
    return 'pnl';
  }
  if (joined.includes('ado') || joined.includes('youth') || joined.includes('jeun')) {
    return 'youth-development';
  }
  if (joined.includes('mindset') || joined.includes('neuro')) {
    return 'mindset';
  }
  return categories[0]?.slug ?? 'entrepreneuriat';
}

function normalizeCategory(category: unknown, index: number): BlogCategory {
  const record = (typeof category === 'object' && category ? category : {}) as Record<string, unknown>;
  const fallback = DEFAULT_CATEGORIES[index] ?? DEFAULT_CATEGORIES[0];
  const name = String(record.name ?? fallback.name).trim().slice(0, MAX_CATEGORY_NAME) || fallback.name;
  const slug = slugify(String(record.slug ?? name)) || fallback.slug;
  const now = new Date().toISOString();
  const color = String(record.color ?? fallback.color).trim();
  const audience: CategoryAudience =
    record.audience === 'adult' || record.audience === 'youth' || record.audience === 'all'
      ? record.audience
      : fallback.audience;

  return {
    id: String(record.id ?? fallback.id ?? generateId('cat')),
    name,
    slug,
    description: truncateText(String(record.description ?? fallback.description), MAX_CATEGORY_DESCRIPTION) || fallback.description,
    color: COLOR_REGEX.test(color) ? color : fallback.color,
    audience,
    createdAt: String(record.createdAt ?? fallback.createdAt ?? now),
    updatedAt: String(record.updatedAt ?? fallback.updatedAt ?? now),
  };
}

function loadCategories(): BlogCategory[] {
  const raw = readJsonArray(categoriesFile, DEFAULT_CATEGORIES);
  const normalized = raw.map((category, index) => normalizeCategory(category, index));
  const unique = normalized.filter(
    (category, index, list) =>
      list.findIndex((candidate) => candidate.slug === category.slug || candidate.id === category.id) === index
  );

  if (JSON.stringify(raw, null, 2) !== JSON.stringify(unique, null, 2)) {
    writeJson(categoriesFile, unique);
  }

  return unique;
}

function normalizePost(post: unknown, categories: BlogCategory[]): BlogPost {
  const record = (typeof post === 'object' && post ? post : {}) as Record<string, unknown>;
  const now = new Date().toISOString();
  const title = String(record.title ?? '').trim().slice(0, MAX_TITLE) || 'Article Train & Dare';
  const rawSlug = slugify(String(record.slug ?? title));
  const slug = rawSlug || slugify(title) || generateId('post');
  const content = sanitizeHtml(String(record.content ?? ''));
  const tags = Array.isArray(record.tags)
    ? record.tags.map((tag) => sanitizeTag(String(tag))).filter(Boolean).slice(0, MAX_TAGS)
    : [];
  const categorySlug = String(record.category ?? '').trim();
  const category = categories.some((item) => item.slug === categorySlug)
    ? categorySlug
    : pickFallbackCategory(tags, categories);
  const featuredImage = truncateText(String(record.featuredImage ?? '').trim(), MAX_IMAGE_URL);
  const featuredImageAlt = truncateText(String(record.featuredImageAlt ?? '').trim(), 180) || title;
  const excerptSource = String(record.excerpt ?? '').trim();
  const excerpt = truncateText(excerptSource || plainTextFromHtml(content), MAX_EXCERPT);
  const createdAt = String(record.createdAt ?? now);
  const updatedAt = String(record.updatedAt ?? createdAt ?? now);
  const requestedStatus = record.status === 'published' || record.status === 'scheduled' ? record.status : 'draft';
  const scheduledFor = normalizeIso(record.scheduledFor);
  const publishedAtCandidate = normalizeIso(record.publishedAt) ?? normalizeIso(updatedAt);
  const status: BlogStatus = requestedStatus === 'scheduled' && scheduledFor ? 'scheduled' : requestedStatus;
  const publishedAt = status === 'published' ? publishedAtCandidate ?? now : undefined;
  const dateSource = String(record.date ?? (publishedAt ?? scheduledFor ?? createdAt).slice(0, 10)).trim();
  const date = /^\d{4}-\d{2}-\d{2}$/.test(dateSource) ? dateSource : (publishedAt ?? scheduledFor ?? createdAt).slice(0, 10);
  const metaTitle = truncateText(String(record.metaTitle ?? '').trim() || title, MAX_META_TITLE);
  const metaDescription = truncateText(
    String(record.metaDescription ?? '').trim() || excerpt || plainTextFromHtml(content),
    MAX_META_DESCRIPTION
  );

  return {
    id: String(record.id ?? `post-${slug}`),
    slug,
    title,
    excerpt,
    content,
    featuredImage: featuredImage || createPlaceholderImage(title, getCategoryAudience(category, categories)),
    featuredImageAlt,
    author: truncateText(String(record.author ?? 'Train & Dare Academy').trim() || 'Train & Dare Academy', MAX_AUTHOR),
    category,
    tags,
    date,
    status,
    scheduledFor: status === 'scheduled' ? scheduledFor : undefined,
    publishedAt,
    metaTitle,
    metaDescription,
    readingTimeMinutes: estimateReadingTime(content),
    createdAt,
    updatedAt,
  };
}

function sortPosts(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((left, right) => {
    const leftTime = Date.parse(left.publishedAt ?? left.scheduledFor ?? `${left.date}T00:00:00.000Z`);
    const rightTime = Date.parse(right.publishedAt ?? right.scheduledFor ?? `${right.date}T00:00:00.000Z`);
    return rightTime - leftTime;
  });
}

function syncScheduledPosts(posts: BlogPost[]): { posts: BlogPost[]; changed: boolean } {
  const now = new Date();
  let changed = false;

  const synced = posts.map((post) => {
    if (post.status !== 'scheduled' || !post.scheduledFor) {
      return post;
    }
    const scheduledDate = new Date(post.scheduledFor);
    if (Number.isNaN(scheduledDate.getTime()) || scheduledDate.getTime() > now.getTime()) {
      return post;
    }

    changed = true;
    return {
      ...post,
      status: 'published' as const,
      publishedAt: post.publishedAt ?? post.scheduledFor,
      scheduledFor: undefined,
      date: (post.publishedAt ?? post.scheduledFor).slice(0, 10),
      updatedAt: now.toISOString(),
    };
  });

  return { posts: sortPosts(synced), changed };
}

function loadPosts(): BlogPost[] {
  const categories = loadCategories();
  const raw = readJsonArray(blogsFile, []);
  const normalized = raw.map((post) => normalizePost(post, categories));
  const synced = syncScheduledPosts(normalized);
  const sorted = sortPosts(synced.posts);

  if (JSON.stringify(raw, null, 2) !== JSON.stringify(sorted, null, 2)) {
    writeJson(blogsFile, sorted);
  } else if (synced.changed) {
    writeJson(blogsFile, sorted);
  }

  return sorted;
}

function writePosts(posts: BlogPost[]): void {
  writeJson(blogsFile, sortPosts(posts));
}

function writeCategories(categories: BlogCategory[]): void {
  writeJson(categoriesFile, categories);
}

function getOptionalAdmin(req: Request): boolean {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  if (!token) {
    return false;
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { role?: string };
    return decoded.role === 'admin';
  } catch {
    return false;
  }
}

interface PostFilters {
  search?: string;
  category?: string;
  tag?: string;
  status?: BlogStatus;
  limit?: number;
}

function filterPosts(posts: BlogPost[], filters: PostFilters): BlogPost[] {
  const search = filters.search?.trim().toLowerCase();
  const category = filters.category?.trim().toLowerCase();
  const tag = filters.tag?.trim().toLowerCase();

  return posts
    .filter((post) => !filters.status || post.status === filters.status)
    .filter((post) => !category || category === 'all' || post.category.toLowerCase() === category)
    .filter((post) => !tag || post.tags.some((item) => item.toLowerCase() === tag))
    .filter((post) => {
      if (!search) {
        return true;
      }
      const haystack = [
        post.title,
        post.excerpt,
        post.author,
        post.metaTitle,
        post.metaDescription,
        post.category,
        post.tags.join(' '),
        plainTextFromHtml(post.content),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(search);
    })
    .slice(0, filters.limit && filters.limit > 0 ? filters.limit : posts.length);
}

function validateScheduledStatus(status: BlogStatus, scheduledFor?: string): string | null {
  if (status !== 'scheduled') {
    return null;
  }
  if (!scheduledFor) {
    return 'Ajoutez une date de publication pour programmer cet article';
  }
  if (Date.parse(scheduledFor) <= Date.now()) {
    return 'La date planifiee doit etre dans le futur';
  }
  return null;
}

function normalizeIncomingCategory(category: unknown, categories: BlogCategory[]): string {
  const slug = slugify(String(category ?? ''));
  return categories.some((item) => item.slug === slug) ? slug : categories[0]?.slug ?? 'entrepreneuriat';
}

router.get('/categories', (_req: Request, res: Response) => {
  res.json(loadCategories());
});

router.post('/categories', requireAdmin, (req: Request, res: Response) => {
  const categories = loadCategories();
  const now = new Date().toISOString();
  const name = String(req.body?.name ?? '').trim().slice(0, MAX_CATEGORY_NAME);
  const slug = slugify(String(req.body?.slug ?? name));
  const description = truncateText(String(req.body?.description ?? '').trim(), MAX_CATEGORY_DESCRIPTION);
  const color = String(req.body?.color ?? '#0E9F6E').trim();
  const audience: CategoryAudience =
    req.body?.audience === 'adult' || req.body?.audience === 'youth' || req.body?.audience === 'all'
      ? req.body.audience
      : 'all';

  if (!name) {
    res.status(400).json({ error: 'Le nom de la categorie est requis' });
    return;
  }
  if (!slug || !SLUG_REGEX.test(slug)) {
    res.status(400).json({ error: 'Slug de categorie invalide' });
    return;
  }
  if (categories.some((category) => category.slug === slug)) {
    res.status(409).json({ error: 'Cette categorie existe deja' });
    return;
  }
  if (!COLOR_REGEX.test(color)) {
    res.status(400).json({ error: 'Couleur invalide' });
    return;
  }

  const category: BlogCategory = {
    id: generateId('cat'),
    name,
    slug,
    description,
    color,
    audience,
    createdAt: now,
    updatedAt: now,
  };

  const updatedCategories = [...categories, category];
  writeCategories(updatedCategories);
  res.status(201).json(category);
});

router.put('/categories/:slug', requireAdmin, (req: Request, res: Response) => {
  const categories = loadCategories();
  const index = categories.findIndex((category) => category.slug === req.params.slug);

  if (index === -1) {
    res.status(404).json({ error: 'Categorie introuvable' });
    return;
  }

  const current = categories[index];
  const nextName = String(req.body?.name ?? current.name).trim().slice(0, MAX_CATEGORY_NAME);
  const nextSlug = slugify(String(req.body?.slug ?? current.slug));
  const nextDescription = truncateText(
    String(req.body?.description ?? current.description).trim(),
    MAX_CATEGORY_DESCRIPTION
  );
  const nextColor = String(req.body?.color ?? current.color).trim();
  const nextAudience: CategoryAudience =
    req.body?.audience === 'adult' || req.body?.audience === 'youth' || req.body?.audience === 'all'
      ? req.body.audience
      : current.audience;

  if (!nextName) {
    res.status(400).json({ error: 'Le nom de la categorie est requis' });
    return;
  }
  if (!nextSlug || !SLUG_REGEX.test(nextSlug)) {
    res.status(400).json({ error: 'Slug de categorie invalide' });
    return;
  }
  if (!COLOR_REGEX.test(nextColor)) {
    res.status(400).json({ error: 'Couleur invalide' });
    return;
  }
  if (categories.some((category, categoryIndex) => categoryIndex !== index && category.slug === nextSlug)) {
    res.status(409).json({ error: 'Une autre categorie utilise deja ce slug' });
    return;
  }

  const now = new Date().toISOString();
  const updatedCategory: BlogCategory = {
    ...current,
    name: nextName,
    slug: nextSlug,
    description: nextDescription,
    color: nextColor,
    audience: nextAudience,
    updatedAt: now,
  };

  categories[index] = updatedCategory;
  writeCategories(categories);

  if (current.slug !== nextSlug) {
    const posts = loadPosts().map((post) =>
      post.category === current.slug ? { ...post, category: nextSlug, updatedAt: now } : post
    );
    writePosts(posts);
  }

  res.json(updatedCategory);
});

router.delete('/categories/:slug', requireAdmin, (req: Request, res: Response) => {
  const categories = loadCategories();
  const index = categories.findIndex((category) => category.slug === req.params.slug);

  if (index === -1) {
    res.status(404).json({ error: 'Categorie introuvable' });
    return;
  }

  const posts = loadPosts();
  if (posts.some((post) => post.category === req.params.slug)) {
    res.status(409).json({ error: 'Cette categorie est deja utilisee par des articles' });
    return;
  }

  categories.splice(index, 1);
  writeCategories(categories);
  res.status(204).send();
});

router.get('/published', (req: Request, res: Response) => {
  const posts = loadPosts().filter((post) => post.status === 'published');
  const filtered = filterPosts(posts, {
    search: typeof req.query.search === 'string' ? req.query.search : undefined,
    category: typeof req.query.category === 'string' ? req.query.category : undefined,
    tag: typeof req.query.tag === 'string' ? req.query.tag : undefined,
    limit: typeof req.query.limit === 'string' ? Number(req.query.limit) : undefined,
  });

  res.json(filtered);
});

router.get('/', requireAdmin, (req: Request, res: Response) => {
  const status =
    req.query.status === 'draft' || req.query.status === 'scheduled' || req.query.status === 'published'
      ? req.query.status
      : undefined;

  const filtered = filterPosts(loadPosts(), {
    search: typeof req.query.search === 'string' ? req.query.search : undefined,
    category: typeof req.query.category === 'string' ? req.query.category : undefined,
    tag: typeof req.query.tag === 'string' ? req.query.tag : undefined,
    limit: typeof req.query.limit === 'string' ? Number(req.query.limit) : undefined,
    status,
  });

  res.json(filtered);
});

router.get('/:id', (req: Request, res: Response) => {
  const isAdmin = getOptionalAdmin(req);
  const post = loadPosts().find((item) => item.id === req.params.id || item.slug === req.params.id);

  if (!post) {
    res.status(404).json({ error: 'Article non trouve' });
    return;
  }

  if (!isAdmin && post.status !== 'published') {
    res.status(404).json({ error: 'Article non trouve' });
    return;
  }

  res.json(post);
});

router.post('/', requireAdmin, (req: Request, res: Response) => {
  const categories = loadCategories();
  const posts = loadPosts();
  const title = String(req.body?.title ?? '').trim().slice(0, MAX_TITLE);
  const slug = slugify(String(req.body?.slug ?? title));
  const content = sanitizeHtml(String(req.body?.content ?? ''));
  const featuredImage = truncateText(String(req.body?.featuredImage ?? '').trim(), MAX_IMAGE_URL);
  const featuredImageAlt = truncateText(String(req.body?.featuredImageAlt ?? '').trim(), 180) || title;
  const author = truncateText(String(req.body?.author ?? 'Train & Dare Academy').trim(), MAX_AUTHOR) || 'Train & Dare Academy';
  const tags = Array.isArray(req.body?.tags)
    ? req.body.tags.map((tag: unknown) => sanitizeTag(String(tag))).filter(Boolean).slice(0, MAX_TAGS)
    : [];
  const category = normalizeIncomingCategory(req.body?.category, categories);
  const status: BlogStatus =
    req.body?.status === 'published' || req.body?.status === 'scheduled' ? req.body.status : 'draft';
  const scheduledFor = normalizeIso(req.body?.scheduledFor);
  const scheduleError = validateScheduledStatus(status, scheduledFor);
  const now = new Date().toISOString();
  const publicationSource = status === 'published' ? now : scheduledFor ?? now;
  const date = String(req.body?.date ?? publicationSource.slice(0, 10)).trim();
  const excerpt = truncateText(
    String(req.body?.excerpt ?? '').trim() || plainTextFromHtml(content),
    MAX_EXCERPT
  );
  const metaTitle = truncateText(String(req.body?.metaTitle ?? '').trim() || title, MAX_META_TITLE);
  const metaDescription = truncateText(
    String(req.body?.metaDescription ?? '').trim() || excerpt,
    MAX_META_DESCRIPTION
  );

  if (!title) {
    res.status(400).json({ error: 'Le titre est requis' });
    return;
  }
  if (!slug || !SLUG_REGEX.test(slug)) {
    res.status(400).json({ error: 'Slug invalide' });
    return;
  }
  if (!content) {
    res.status(400).json({ error: 'Le contenu est requis' });
    return;
  }
  if (content.length > MAX_CONTENT) {
    res.status(400).json({ error: 'Contenu trop long' });
    return;
  }
  if (posts.some((post) => post.slug === slug)) {
    res.status(409).json({ error: 'Un article avec ce slug existe deja' });
    return;
  }
  if (scheduleError) {
    res.status(400).json({ error: scheduleError });
    return;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    res.status(400).json({ error: 'Date invalide' });
    return;
  }

  const created: BlogPost = {
    id: generateId('blog'),
    slug,
    title,
    excerpt,
    content,
    featuredImage: featuredImage || createPlaceholderImage(title, getCategoryAudience(category, categories)),
    featuredImageAlt,
    author,
    category,
    tags,
    date,
    status,
    scheduledFor: status === 'scheduled' ? scheduledFor : undefined,
    publishedAt: status === 'published' ? now : undefined,
    metaTitle,
    metaDescription,
    readingTimeMinutes: estimateReadingTime(content),
    createdAt: now,
    updatedAt: now,
  };

  const updatedPosts = sortPosts([created, ...posts]);
  writePosts(updatedPosts);
  res.status(201).json(created);
});

router.put('/:id', requireAdmin, (req: Request, res: Response) => {
  const categories = loadCategories();
  const posts = loadPosts();
  const index = posts.findIndex((post) => post.id === req.params.id);

  if (index === -1) {
    res.status(404).json({ error: 'Article non trouve' });
    return;
  }

  const current = posts[index];
  const title = String(req.body?.title ?? current.title).trim().slice(0, MAX_TITLE);
  const slug = slugify(String(req.body?.slug ?? current.slug));
  const content = sanitizeHtml(String(req.body?.content ?? current.content));
  const featuredImage = truncateText(String(req.body?.featuredImage ?? current.featuredImage).trim(), MAX_IMAGE_URL);
  const featuredImageAlt =
    truncateText(String(req.body?.featuredImageAlt ?? current.featuredImageAlt).trim(), 180) || title;
  const author =
    truncateText(String(req.body?.author ?? current.author).trim(), MAX_AUTHOR) || current.author;
  const tags = Array.isArray(req.body?.tags)
    ? req.body.tags.map((tag: unknown) => sanitizeTag(String(tag))).filter(Boolean).slice(0, MAX_TAGS)
    : current.tags;
  const category = normalizeIncomingCategory(req.body?.category ?? current.category, categories);
  const status: BlogStatus =
    req.body?.status === 'published' || req.body?.status === 'scheduled' || req.body?.status === 'draft'
      ? req.body.status
      : current.status;
  const scheduledFor =
    req.body?.scheduledFor !== undefined ? normalizeIso(req.body.scheduledFor) : current.scheduledFor;
  const scheduleError = validateScheduledStatus(status, scheduledFor);
  const date = String(req.body?.date ?? current.date).trim();
  const excerpt = truncateText(
    String(req.body?.excerpt ?? current.excerpt).trim() || plainTextFromHtml(content),
    MAX_EXCERPT
  );
  const metaTitle = truncateText(String(req.body?.metaTitle ?? current.metaTitle).trim() || title, MAX_META_TITLE);
  const metaDescription = truncateText(
    String(req.body?.metaDescription ?? current.metaDescription).trim() || excerpt,
    MAX_META_DESCRIPTION
  );

  if (!title) {
    res.status(400).json({ error: 'Le titre est requis' });
    return;
  }
  if (!slug || !SLUG_REGEX.test(slug)) {
    res.status(400).json({ error: 'Slug invalide' });
    return;
  }
  if (!content) {
    res.status(400).json({ error: 'Le contenu est requis' });
    return;
  }
  if (content.length > MAX_CONTENT) {
    res.status(400).json({ error: 'Contenu trop long' });
    return;
  }
  if (posts.some((post, postIndex) => postIndex !== index && post.slug === slug)) {
    res.status(409).json({ error: 'Ce slug est deja utilise' });
    return;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    res.status(400).json({ error: 'Date invalide' });
    return;
  }
  if (scheduleError) {
    res.status(400).json({ error: scheduleError });
    return;
  }

  const now = new Date().toISOString();
  const updated: BlogPost = {
    ...current,
    slug,
    title,
    excerpt,
    content,
    featuredImage: featuredImage || createPlaceholderImage(title, getCategoryAudience(category, categories)),
    featuredImageAlt,
    author,
    category,
    tags,
    date,
    status,
    scheduledFor: status === 'scheduled' ? scheduledFor : undefined,
    publishedAt: status === 'published' ? current.publishedAt ?? now : undefined,
    metaTitle,
    metaDescription,
    readingTimeMinutes: estimateReadingTime(content),
    updatedAt: now,
  };

  posts[index] = updated;
  writePosts(posts);
  res.json(updated);
});

router.patch('/:id/publish', requireAdmin, (req: Request, res: Response) => {
  const posts = loadPosts();
  const index = posts.findIndex((post) => post.id === req.params.id);

  if (index === -1) {
    res.status(404).json({ error: 'Article non trouve' });
    return;
  }

  const now = new Date().toISOString();
  posts[index] = {
    ...posts[index],
    status: 'published',
    scheduledFor: undefined,
    publishedAt: posts[index].publishedAt ?? now,
    date: now.slice(0, 10),
    updatedAt: now,
  };

  writePosts(posts);
  res.json(posts[index]);
});

router.patch('/:id/unpublish', requireAdmin, (req: Request, res: Response) => {
  const posts = loadPosts();
  const index = posts.findIndex((post) => post.id === req.params.id);

  if (index === -1) {
    res.status(404).json({ error: 'Article non trouve' });
    return;
  }

  const now = new Date().toISOString();
  posts[index] = {
    ...posts[index],
    status: 'draft',
    scheduledFor: undefined,
    publishedAt: undefined,
    updatedAt: now,
  };

  writePosts(posts);
  res.json(posts[index]);
});

router.delete('/:id', requireAdmin, (req: Request, res: Response) => {
  const posts = loadPosts();
  const index = posts.findIndex((post) => post.id === req.params.id);

  if (index === -1) {
    res.status(404).json({ error: 'Article non trouve' });
    return;
  }

  posts.splice(index, 1);
  writePosts(posts);
  res.status(204).send();
});

export default router;
