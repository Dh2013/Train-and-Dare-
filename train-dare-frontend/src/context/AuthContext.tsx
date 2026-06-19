import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, getStoredToken, setStoredToken, clearStoredToken } from '../api/auth';

interface AuthState {
  isAdmin: boolean;
  loading: boolean;
  checked: boolean;
}

interface AuthContextValue extends AuthState {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ isAdmin: false, loading: true, checked: false });

  const checkAuth = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setState({ isAdmin: false, loading: false, checked: true });
      return;
    }
    try {
      const { data } = await authApi.me(token);
      setState({ isAdmin: data.user?.role === 'admin', loading: false, checked: true });
    } catch {
      clearStoredToken();
      setState({ isAdmin: false, loading: false, checked: true });
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      const { data } = await authApi.login(username, password);
      setStoredToken(data.token);
      setState({ isAdmin: data.user?.role === 'admin', loading: false, checked: true });
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    clearStoredToken();
    setState({ isAdmin: false, loading: false, checked: true });
  }, []);

  const getToken = useCallback(() => getStoredToken(), []);

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    getToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
