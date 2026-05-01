import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/auth.service';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url: string | null;
  theme_preference?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('lions-token');
      if (token) {
        try {
          const response = await authService.getMe();
          if (response.success && response.data) {
            const userData = (response.data as any).user || response.data;
            setUser(userData);
          } else {
            localStorage.removeItem('lions-token');
          }
        } catch {
          localStorage.removeItem('lions-token');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const response = await authService.login({ email, password });
    if (response.success && response.data) {
      localStorage.setItem('lions-token', response.data.token);
      localStorage.setItem('lions-refresh', response.data.refreshToken);
      const userData = (response.data as any).user || response.data;
      setUser(userData);
      return userData as User;
    }
    throw new Error('Login falhou');
  };

  const logout = () => {
    localStorage.removeItem('lions-token');
    localStorage.removeItem('lions-refresh');
    setUser(null);
    window.location.href = '/login';
  };

  const refreshUser = async () => {
    try {
      const response = await authService.getMe();
      if (response.success && response.data) {
        const userData = (response.data as any).user || response.data;
        setUser(userData);
      }
    } catch {}
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
