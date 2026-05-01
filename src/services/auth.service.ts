import { api } from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      avatar_url: string | null;
      theme_preference?: string;
    };
    token: string;
    refreshToken: string;
  };
}

export const authService = {
  login: (credentials: LoginCredentials) =>
    api.post('/auth/login', credentials) as Promise<AuthResponse>,

  register: (data: RegisterData) =>
    api.post('/auth/register', data) as Promise<AuthResponse>,

  getMe: () =>
    api.get('/auth/me') as Promise<AuthResponse>,

  updateProfile: (data: Partial<{ name: string; phone: string; bio: string; avatar_url: string; theme_preference: string }>) =>
    api.patch('/auth/me', data) as Promise<AuthResponse>,

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.patch('/auth/change-password', data) as Promise<{ success: boolean; message: string }>,
};
