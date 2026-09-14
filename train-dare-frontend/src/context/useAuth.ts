import { createContext, useContext } from 'react';

export interface AuthState {
  isAdmin: boolean;
  loading: boolean;
  checked: boolean;
}

export interface AuthContextValue extends AuthState {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  getToken: () => string | null;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
