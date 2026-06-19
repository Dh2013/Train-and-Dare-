import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface NewsletterPayload {
  email: string;
  fullName?: string;
  source?: string;
  segments?: string[];
  tags?: string[];
}

export const newsletterApi = {
  subscribe: (data: NewsletterPayload) =>
    axios.post<{ status: string; message?: string }>(`${API_BASE}/newsletter`, data),
};
