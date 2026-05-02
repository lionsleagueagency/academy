import { query } from '../config/database.js';
import { successResponse } from '../utils/response.js';

export const getAgentDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [stats] = await query(
      `SELECT
        (SELECT COUNT(*) FROM enrollments WHERE user_id = ? AND status = 'active') as active_courses,
        (SELECT COUNT(*) FROM enrollments WHERE user_id = ? AND status = 'completed') as completed_courses,
        (SELECT COUNT(*) FROM certificates WHERE user_id = ?) as certificates,
        (SELECT COALESCE(SUM(total_seconds), 0) FROM daily_study_logs WHERE user_id = ?) / 3600 as hours_watched`,
      [userId, userId, userId, userId]
    );

    const inProgress = await query(
      `SELECT e.id, e.progress_percent, e.completed_lessons, e.total_lessons,
        c.id as course_id, c.title, c.slug, c.thumbnail_url, c.level,
        i.name as instructor_name
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       LEFT JOIN users i ON c.instructor_id = i.id AND i.role = 'admin' AND i.deleted_at IS NULL
       WHERE e.user_id = ? AND e.status = 'active' AND e.progress_percent > 0 AND e.progress_percent < 100
       ORDER BY e.last_accessed_at DESC
       LIMIT 5`,
      [userId]
    );

    const recommended = await query(
      `SELECT c.id, c.title, c.slug, c.thumbnail_url, c.level, c.duration_minutes,
        cat.name as category_name,
        i.name as instructor_name
       FROM courses c
       LEFT JOIN categories cat ON c.category_id = cat.id
       LEFT JOIN users i ON c.instructor_id = i.id AND i.role = 'admin' AND i.deleted_at IS NULL
       WHERE c.status = 'published'
         AND c.id NOT IN (SELECT course_id FROM enrollments WHERE user_id = ?)
       ORDER BY c.featured DESC, c.students_count DESC
       LIMIT 6`,
      [userId]
    );

    const recentActivity = await query(
      `SELECT lp.*, l.title as lesson_title, m.title as module_title, c.title as course_title
       FROM lesson_progress lp
       JOIN lessons l ON lp.lesson_id = l.id
       JOIN modules m ON lp.module_id = m.id
       JOIN courses c ON lp.course_id = c.id
       WHERE lp.user_id = ?
       ORDER BY lp.last_watched_at DESC
       LIMIT 10`,
      [userId]
    );

    const weeklyData = await query(
      `SELECT study_date, total_seconds / 3600 as hours
       FROM daily_study_logs
       WHERE user_id = ? AND study_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       ORDER BY study_date ASC`,
      [userId]
    );

    const [streak] = await query(
      'SELECT current_streak, longest_streak FROM learning_streaks WHERE user_id = ?',
      [userId]
    );

    const achievements = await query(
      `SELECT a.*, ua.earned_at
       FROM achievements a
       JOIN user_achievements ua ON a.id = ua.achievement_id
       WHERE ua.user_id = ?`,
      [userId]
    );

    return successResponse(res, {
      stats,
      inProgress,
      recommended,
      recentActivity,
      weeklyData,
      streak: streak || { current_streak: 0, longest_streak: 0 },
      achievements,
    }, 'Dashboard carregado');
  } catch (error) {
    next(error);
  }
};

export const getAgentCertificates = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const certificates = await query(
      `SELECT cert.*, c.title as course_title, c.thumbnail_url as course_thumbnail
       FROM certificates cert
       JOIN courses c ON cert.course_id = c.id
       WHERE cert.user_id = ? AND cert.revoked_at IS NULL
       ORDER BY cert.issue_date DESC`,
      [userId]
    );

    return successResponse(res, certificates, 'Certificados carregados');
  } catch (error) {
    next(error);
  }
};
