import { api } from './api';

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string | null;
  thumbnail_url: string | null;
  instructor_id: string;
  category_id: string;
  level: string;
  duration_minutes: number;
  status: string;
  featured: number;
  total_modules: number;
  total_lessons: number;
  rating_avg: string;
  students_count: number;
  category_name: string;
  category_slug: string;
  category_color: string;
  instructor_name: string;
  instructor_avatar: string | null;
  progress?: number;
}

export interface CourseDetail extends Course {
  modules: Array<{
    id: string;
    title: string;
    description: string | null;
    sort_order: number;
    duration_minutes: number;
    lessons: Array<{
      id: string;
      title: string;
      video_duration_seconds: number;
      video_url: string | null;
      is_free_preview: number;
      sort_order: number;
      completed?: boolean;
    }>;
  }>;
  enrollment?: {
    id: string;
    status: string;
    progress_percent: string;
    completed_lessons: number;
    started_at: string;
    lessonProgress: Array<{
      lesson_id: string;
      is_completed: number;
      progress_percent: string;
    }>;
  } | null;
}

export interface CoursesResponse {
  success: boolean;
  data: Course[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const courseService = {
  getCourses: (params?: { category?: string; level?: string; search?: string; featured?: boolean; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.level) query.set('level', params.level);
    if (params?.search) query.set('search', params.search);
    if (params?.featured) query.set('featured', 'true');
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return api.get(`/courses?${query.toString()}`) as Promise<CoursesResponse>;
  },

  getCourseById: (id: string) =>
    api.get(`/courses/${id}`) as Promise<{ success: boolean; data: CourseDetail; message: string }>,

  getCategories: () =>
    api.get('/courses/categories') as Promise<{ success: boolean; data: Array<{ id: string; name: string; slug: string; color: string }> }>,

  getInstructors: () =>
    api.get('/courses/instructors') as Promise<{ success: boolean; data: Array<{ id: string; name: string; email: string; avatar_url: string | null; specialty: string }> }>,

  createCourse: (data: any) =>
    api.post('/courses', data) as Promise<{ success: boolean; data: any; message: string }>,

  updateCourse: (id: string, data: any) =>
    api.patch(`/courses/${id}`, data) as Promise<{ success: boolean; data: any; message: string }>,

  deleteCourse: (id: string) =>
    api.delete(`/courses/${id}`) as Promise<{ success: boolean; message: string }>,

  createModule: (data: any) =>
    api.post('/courses/modules', data) as Promise<{ success: boolean; data: any }>,

  updateModule: (id: string, data: any) =>
    api.patch(`/courses/modules/${id}`, data) as Promise<{ success: boolean; data: any }>,

  deleteModule: (id: string) =>
    api.delete(`/courses/modules/${id}`) as Promise<{ success: boolean; message: string }>,

  createLesson: (data: any) =>
    api.post('/courses/lessons', data) as Promise<{ success: boolean; data: any }>,

  updateLesson: (id: string, data: any) =>
    api.patch(`/courses/lessons/${id}`, data) as Promise<{ success: boolean; data: any }>,

  deleteLesson: (id: string) =>
    api.delete(`/courses/lessons/${id}`) as Promise<{ success: boolean; message: string }>,
};
