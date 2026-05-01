import { api } from './api';

export const communityService = {
  getPosts: (page = 1, limit = 20) =>
    api.get(`/community/posts?page=${page}&limit=${limit}`) as Promise<{
      success: boolean;
      data: Array<{
        id: string;
        content: string;
        image_url: string | null;
        likes_count: number;
        comments_count: number;
        created_at: string;
        user_id: string;
        author: string;
        avatar_url: string | null;
        role: string;
        user_liked: number;
      }>;
      message: string;
    }>,

  createPost: (data: { content: string; imageUrl?: string | null }) =>
    api.post('/community/posts', data) as Promise<{ success: boolean; data: any; message: string }>,

  deletePost: (id: string) =>
    api.delete(`/community/posts/${id}`) as Promise<{ success: boolean; message: string }>,

  toggleLike: (id: string) =>
    api.post(`/community/posts/${id}/like`, {}) as Promise<{ success: boolean; data: { liked: boolean }; message: string }>,

  getComments: (postId: string) =>
    api.get(`/community/posts/${postId}/comments`) as Promise<{
      success: boolean;
      data: Array<{
        id: string;
        content: string;
        created_at: string;
        user_id: string;
        author: string;
        avatar_url: string | null;
        role: string;
      }>;
      message: string;
    }>,

  createComment: (postId: string, content: string) =>
    api.post(`/community/posts/${postId}/comments`, { content }) as Promise<{ success: boolean; data: any; message: string }>,

  deleteComment: (id: string) =>
    api.delete(`/community/comments/${id}`) as Promise<{ success: boolean; message: string }>,

  getTopMembers: () =>
    api.get('/community/top-members') as Promise<{
      success: boolean;
      data: Array<{
        id: string;
        name: string;
        avatar_url: string | null;
        role: string;
        posts_count: number;
        received_likes: number;
      }>;
      message: string;
    }>,
};
