import { api } from './api';

export interface Enrollment {
  id: string;
  course_id: string;
  status: string;
  progress_percent: string;
  completed_lessons: number;
  total_lessons: number;
  course_title: string;
  course_slug: string;
  course_thumbnail: string | null;
  level: string;
  instructor_name: string;
}

export const enrollmentService = {
  getMyEnrollments: () =>
    api.get('/enrollments') as Promise<{ success: boolean; data: Enrollment[] }>,

  enrollInCourse: (courseId: string) =>
    api.post(`/enrollments/course/${courseId}`) as Promise<{ success: boolean; message: string; data: Enrollment }>,
};
