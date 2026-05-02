import { query, transaction } from '../config/database.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { v4 as uuidv4 } from 'uuid';

async function generateCertificate(userId, courseId, enrollmentId) {
  // Check if certificate already exists
  const [existing] = await query(
    'SELECT id FROM certificates WHERE user_id = ? AND course_id = ? AND revoked_at IS NULL',
    [userId, courseId]
  );
  
  if (existing) return existing.id;

  // Generate certificate number: LLA-YYYY-XXXXX
  const year = new Date().getFullYear();
  const [countResult] = await query(
    'SELECT COUNT(*) as count FROM certificates WHERE YEAR(created_at) = ?',
    [year]
  );
  const sequence = String(countResult.count + 1).padStart(5, '0');
  const certificateNumber = `LLA-${year}-${sequence}`;

  const certId = uuidv4();
  await query(
    `INSERT INTO certificates (id, user_id, course_id, enrollment_id, certificate_number, 
      issue_date, verified, created_at)
     VALUES (?, ?, ?, ?, ?, NOW(), TRUE, NOW())`,
    [certId, userId, courseId, enrollmentId, certificateNumber]
  );

  return certId;
}

export const updateProgress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { lessonId } = req.params;
    const { watchTimeSeconds, progressPercent, lastPositionSeconds, isCompleted } = req.body;

    const [lesson] = await query(
      'SELECT course_id, module_id, video_duration_seconds FROM lessons WHERE id = ?',
      [lessonId]
    );

    if (!lesson) {
      return errorResponse(res, 'Aula não encontrada', 404);
    }

    const [enrollment] = await query(
      'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ? AND status = ?',
      [userId, lesson.course_id, 'active']
    );

    if (!enrollment) {
      return errorResponse(res, 'Você não está matriculado neste curso', 403);
    }

    const [existingProgress] = await query(
      'SELECT id, is_completed FROM lesson_progress WHERE user_id = ? AND lesson_id = ?',
      [userId, lessonId]
    );

    const completedAt = isCompleted ? 'NOW()' : null;
    const wasCompleted = existingProgress?.is_completed || false;

    if (existingProgress) {
      await query(
        `UPDATE lesson_progress SET
          watch_time_seconds = watch_time_seconds + ?,
          progress_percent = GREATEST(progress_percent, ?),
          last_position_seconds = ?,
          is_completed = ?,
          completed_at = COALESCE(?, completed_at),
          watch_count = watch_count + 1,
          last_watched_at = NOW(),
          updated_at = NOW()
         WHERE id = ?`,
        [watchTimeSeconds || 0, progressPercent || 0, lastPositionSeconds || 0,
         isCompleted || wasCompleted, isCompleted && !wasCompleted ? 'NOW()' : null,
         existingProgress.id]
      );
    } else {
      await query(
        `INSERT INTO lesson_progress (id, user_id, lesson_id, course_id, module_id, enrollment_id,
          watch_time_seconds, progress_percent, last_position_seconds, is_completed, completed_at,
          first_started_at, last_watched_at, created_at)
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
        [userId, lessonId, lesson.course_id, lesson.module_id, enrollment.id,
         watchTimeSeconds || 0, progressPercent || 0, lastPositionSeconds || 0,
         isCompleted || false, completedAt]
      );
    }

    if (isCompleted && !wasCompleted) {
      await query(
        'UPDATE enrollments SET completed_lessons = completed_lessons + 1 WHERE id = ?',
        [enrollment.id]
      );

      const [stats] = await query(
        `SELECT
          (SELECT COUNT(*) FROM lessons WHERE course_id = ? AND is_published = TRUE) as total,
          (SELECT COUNT(*) FROM lesson_progress WHERE user_id = ? AND course_id = ? AND is_completed = TRUE) as completed`,
        [lesson.course_id, userId, lesson.course_id]
      );

      const newProgress = Math.round((stats.completed / stats.total) * 100);
      let status = 'active';
      let certificateId = null;
      if (newProgress === 100) {
        status = 'completed';
        await query(
          'UPDATE courses SET completions_count = completions_count + 1 WHERE id = ?',
          [lesson.course_id]
        );
        // Generate certificate
        certificateId = await generateCertificate(userId, lesson.course_id, enrollment.id);
      }

      await query(
        `UPDATE enrollments SET progress_percent = ?, status = ?, last_accessed_at = NOW(),
         ${status === 'completed' ? 'completed_at = NOW(),' : ''} updated_at = NOW()
         WHERE id = ?`,
        [newProgress, status, enrollment.id]
      );
    } else {
      await query(
        'UPDATE enrollments SET last_accessed_at = NOW() WHERE id = ?',
        [enrollment.id]
      );
    }

    return successResponse(res, null, 'Progresso atualizado');
  } catch (error) {
    next(error);
  }
};

export const getLessonProgress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { lessonId } = req.params;

    const [progress] = await query(
      `SELECT lp.*, l.title as lesson_title, l.video_duration_seconds
       FROM lesson_progress lp
       JOIN lessons l ON lp.lesson_id = l.id
       WHERE lp.user_id = ? AND lp.lesson_id = ?`,
      [userId, lessonId]
    );

    if (!progress) {
      return successResponse(res, {
        lessonId,
        isCompleted: false,
        progressPercent: 0,
        lastPositionSeconds: 0,
        watchTimeSeconds: 0,
        watchCount: 0,
      }, 'Progresso carregado');
    }

    return successResponse(res, progress, 'Progresso carregado');
  } catch (error) {
    next(error);
  }
};

export const getCourseProgress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    const [enrollment] = await query(
      'SELECT id, progress_percent, completed_lessons, total_lessons FROM enrollments WHERE user_id = ? AND course_id = ?',
      [userId, courseId]
    );

    const lessonProgress = await query(
      `SELECT lp.lesson_id, lp.is_completed, lp.progress_percent, lp.last_position_seconds, lp.watch_time_seconds
       FROM lesson_progress lp
       WHERE lp.user_id = ? AND lp.course_id = ?`,
      [userId, courseId]
    );

    return successResponse(res, {
      enrollment,
      lessonProgress,
    }, 'Progresso do curso carregado');
  } catch (error) {
    next(error);
  }
};
