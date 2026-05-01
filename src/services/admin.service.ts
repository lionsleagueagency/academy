import { api } from './api';

export const adminService = {
  getStats: () =>
    api.get('/admin/stats') as Promise<{ success: boolean; data: unknown }>,

  getUsers: (params?: { page?: number; limit?: number; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.search) query.set('search', params.search);
    return api.get(`/admin/users?${query.toString()}`) as Promise<{ success: boolean; data: unknown[]; pagination: unknown }>;
  },

  getAdministrators: (params?: { search?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    return api.get(`/admin/administrators?${query.toString()}`) as Promise<{ success: boolean; data: unknown[] }>;
  },

  createAdministrator: (data: { name: string; email: string; password: string; avatarUrl?: string | null }) =>
    api.post('/admin/administrators', data) as Promise<{ success: boolean; data: unknown; message: string }>,

  updateAdministrator: (id: string, data: { name?: string; status?: string; password?: string; avatarUrl?: string | null }) =>
    api.patch(`/admin/administrators/${id}`, data) as Promise<{ success: boolean; data: unknown; message: string }>,

  deleteAdministrator: (id: string) =>
    api.delete(`/admin/administrators/${id}`) as Promise<{ success: boolean; message: string }>,

  getCourses: (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return api.get(`/admin/courses?${query.toString()}`) as Promise<{ success: boolean; data: unknown[]; pagination: unknown }>;
  },
};
