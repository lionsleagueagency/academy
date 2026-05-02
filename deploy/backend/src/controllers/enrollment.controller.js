import { query, transaction } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import { successResponse, errorResponse } from '../utils/response.js';

export const getMyEnrollments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const status = req.query.status;

    let sql = `
      SELECT e.*,
        c.title as course_title, c.slug as course_slug, c.thumbnail_url as course_thumbnail,
        c.level, c.duration_minutes, c.total_lessons,
        cat.name as category_name, cat.color as category_color,
        i.name as instructor_name
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN users i ON c.instructor_id = i.id AND i.role = 'admin' AND i.deleted_at IS NULL
      WHERE e.user_id = ?
    `;
    const params = [userId];

    if (status) {
      sql += ' AND e.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY e.last_accessed_at DESC, e.created_at DESC';

    const enrollments = await query(sql, params);
    return successResponse(res, enrollments, 'Matrículas carregadas');
  } catch (error) {
    next(error);
  }
};

export const enrollInCourse = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    const [existing] = await query(
      'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?',
      [userId, courseId]
    );

    if (existing) {
      return errorResponse(res, 'Você já está matriculado neste curso', 409);
    }

    const [course] = await query(
      'SELECT total_lessons FROM courses WHERE id = ? AND status = ?',
      [courseId, 'published']
    );

    if (!course) {
      return errorResponse(res, 'Curso não encontrado ou indisponível', 404);
    }

    const id = uuidv4();
    await query(
      `INSERT INTO enrollments (id, user_id, course_id, status, total_lessons, started_at, created_at)
       VALUES (?, ?, ?, 'active', ?, NOW(), NOW())`,
      [id, userId, courseId, course.total_lessons]
    );

    await query(
      'UPDATE courses SET students_count = students_count + 1 WHERE id = ?',
      [courseId]
    );

    const [enrollment] = await query('SELECT * FROM enrollments WHERE id = ?', [id]);
    return successResponse(res, enrollment, 'Matrícula realizada com sucesso', 201);
  } catch (error) {
    next(error);
  }
};

export const getEnrollmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [enrollment] = await query(
      `SELECT e.*,
        c.title as course_title, c.thumbnail_url as course_thumbnail
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       WHERE e.id = ? AND e.user_id = ?`,
      [id, userId]
    );

    if (!enrollment) {
      return errorResponse(res, 'Matrícula não encontrada', 404);
    }

    return successResponse(res, enrollment, 'Matrícula encontrada');
  } catch (error) {
    next(error);
  }
};

export const dropEnrollment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await query(
      "UPDATE enrollments SET status = 'dropped', updated_at = NOW() WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    return successResponse(res, null, 'Matrícula cancelada');
  } catch (error) {
    next(error);
  }
};
