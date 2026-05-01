import { api } from './api';

export const progressService = {
  updateProgress: (data: {
    lessonId: string;
    watchTimeSeconds: number;
    progressPercent: number;
    lastPositionSeconds: number;
    isCompleted: boolean;
  }) =>
    api.post(`/progress/lesson/${data.lessonId}`, {
      watchTimeSeconds: data.watchTimeSeconds,
      progressPercent: data.progressPercent,
      lastPositionSeconds: data.lastPositionSeconds,
      isCompleted: data.isCompleted,
    }) as Promise<{ success: boolean; message: string }>,

  getCourseProgress: (courseId: string) =>
    api.get(`/progress/course/${courseId}`) as Promise<{
      success: boolean;
      data: {
        enrollment: {
          id: string;
          progress_percent: string;
          completed_lessons: number;
          total_lessons: number;
        };
        lessonProgress: Array<{
          lesson_id: string;
          is_completed: number;
          progress_percent: string;
          last_position_seconds: number;
          watch_time_seconds: number;
        }>;
      };
    }>,
};
