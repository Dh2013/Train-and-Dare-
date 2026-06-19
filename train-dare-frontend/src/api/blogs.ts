import axios from 'axios';
import { getStoredToken } from './auth';
import type { BlogCategory, BlogCategoryInput, BlogFilters, BlogPost, BlogPostInput } from '../types/blog';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function authHeaders(): { Authorization?: string } {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const blogsApi = {
  list: (params?: BlogFilters) =>
    axios.get<BlogPost[]>(`${API_BASE}/blogs`, {
      headers: authHeaders(),
      params,
    }),

  listPublished: (params?: Omit<BlogFilters, 'status'>) =>
    axios.get<BlogPost[]>(`${API_BASE}/blogs/published`, {
      headers: authHeaders(),
      params,
    }),

  get: (id: string) =>
    axios.get<BlogPost>(`${API_BASE}/blogs/${id}`, {
      headers: authHeaders(),
    }),

  create: (data: BlogPostInput) =>
    axios.post<BlogPost>(`${API_BASE}/blogs`, data, {
      headers: authHeaders(),
    }),

  update: (id: string, data: Partial<BlogPostInput>) =>
    axios.put<BlogPost>(`${API_BASE}/blogs/${id}`, data, {
      headers: authHeaders(),
    }),

  delete: (id: string) =>
    axios.delete(`${API_BASE}/blogs/${id}`, {
      headers: authHeaders(),
    }),

  publish: (id: string) =>
    axios.patch<BlogPost>(`${API_BASE}/blogs/${id}/publish`, null, {
      headers: authHeaders(),
    }),

  unpublish: (id: string) =>
    axios.patch<BlogPost>(`${API_BASE}/blogs/${id}/unpublish`, null, {
      headers: authHeaders(),
    }),

  categories: {
    list: () =>
      axios.get<BlogCategory[]>(`${API_BASE}/blogs/categories`, {
        headers: authHeaders(),
      }),

    create: (data: BlogCategoryInput) =>
      axios.post<BlogCategory>(`${API_BASE}/blogs/categories`, data, {
        headers: authHeaders(),
      }),

    update: (slug: string, data: BlogCategoryInput) =>
      axios.put<BlogCategory>(`${API_BASE}/blogs/categories/${slug}`, data, {
        headers: authHeaders(),
      }),

    delete: (slug: string) =>
      axios.delete(`${API_BASE}/blogs/categories/${slug}`, {
        headers: authHeaders(),
      }),
  },
};
