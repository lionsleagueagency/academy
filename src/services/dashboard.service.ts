import { api } from './api';

export interface DashboardData {
  stats: {
    active_courses: number;
    completed_courses: number;
    certificates: number;
    hours_watched: number | null;
  };
  inProgress: Array<{
    id: string;
    progress_percent: string;
    completed_lessons: number;
    total_lessons: number;
    course_id: string;
    title: string;
    slug: string;
    thumbnail_url: string | null;
    level: string;
    instructor_name: string;
  }>;
  recommended: Array<{
    id: string;
    title: string;
    slug: string;
    thumbnail_url: string | null;
    level: string;
    duration_minutes: number;
    category_name: string;
    instructor_name: string;
  }>;
  weeklyData: Array<{ study_date: string; hours: number }>;
  streak: { current_streak: number; longest_streak: number };
  achievements: Array<{
    id: string;
    name: string;
    slug: string;
    description: string;
    icon_url: string | null;
    color: string;
    earned_at: string;
  }>;
}

export const dashboardService = {
  getAgentDashboard: () =>
    api.get('/dashboard') as Promise<{ success: boolean; data: DashboardData }>,

  getCertificates: () =>
    api.get('/dashboard/certificates') as Promise<{ success: boolean; data: unknown[] }>,
};
