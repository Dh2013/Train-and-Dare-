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

export interface BlogPostInput {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  author: string;
  category: string;
  tags: string[];
  date: string;
  status: BlogStatus;
  scheduledFor?: string;
  metaTitle: string;
  metaDescription: string;
}

export interface BlogCategoryInput {
  name: string;
  slug?: string;
  description: string;
  color: string;
  audience: CategoryAudience;
}

export interface BlogFilters {
  search?: string;
  category?: string;
  tag?: string;
  status?: BlogStatus;
  limit?: number;
}
