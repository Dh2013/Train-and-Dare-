import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface AuthUser {
  role: string;
  username?: string;
  id?: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

const AUTH_TOKEN_KEY = 'train_dare_admin_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export const authApi = {
  login: (username: string, password: string) =>
    axios.post<LoginResponse>(`${API_BASE}/auth/login`, { username, password }),

  me: (token: string) =>
    axios.get<{ user: AuthUser }>(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
};
