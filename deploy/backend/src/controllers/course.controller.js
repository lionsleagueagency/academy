import { query } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response.js';

export const getCourses = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const category = req.query.category;
    const level = req.query.level;
    const search = req.query.search || '';
    const featured = req.query.featured;
    const status = req.query.status || 'published';

    let whereClause = 'WHERE c.status = ?';
    const params = [status];

    if (category) {
      whereClause += ' AND c.category_id = ?';
      params.push(category);
    }
    if (level) {
      whereClause += ' AND c.level = ?';
      params.push(level);
    }
    if (search) {
      whereClause += ' AND (c.title LIKE ? OR c.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (featured === 'true') {
      whereClause += ' AND c.featured = TRUE';
    }

    const countResult = await query(`SELECT COUNT(*) as total FROM courses c ${whereClause}`, params);
    const total = countResult[0].total;

    const courses = await query(
      `SELECT c.*,
        cat.name as category_name, cat.slug as category_slug, cat.color as category_color,
        i.name as instructor_name, i.avatar_url as instructor_avatar
       FROM courses c
       LEFT JOIN categories cat ON c.category_id = cat.id
       LEFT JOIN users i ON c.instructor_id = i.id AND i.role = 'admin' AND i.deleted_at IS NULL
       ${whereClause}
       ORDER BY c.featured DESC, c.created_at DESC
       LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`,
      params
    );

    return paginatedResponse(res, courses, {
      page, limit, total, totalPages: Math.ceil(total / limit),
    }, 'Cursos listados');
  } catch (error) {
    next(error);
  }
};

export const getCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const [course] = await query(
      `SELECT c.*,
        cat.name as category_name, cat.slug as category_slug,
        i.name as instructor_name, i.avatar_url as instructor_avatar, i.bio as instructor_bio
       FROM courses c
       LEFT JOIN categories cat ON c.category_id = cat.id
       LEFT JOIN users i ON c.instructor_id = i.id AND i.role = 'admin' AND i.deleted_at IS NULL
       WHERE c.id = ?`,
      [id]
    );

    if (!course) {
      return errorResponse(res, 'Curso não encontrado', 404);
    }

    const modules = await query(
      `SELECT id, title, description, sort_order, duration_minutes
       FROM modules WHERE course_id = ? AND is_published = TRUE
       ORDER BY sort_order ASC`,
      [id]
    );

    for (const mod of modules) {
      const lessons = await query(
        `SELECT id, title, description, video_duration_seconds, video_url, thumbnail_url,
                sort_order, is_free_preview
         FROM lessons WHERE module_id = ? AND is_published = TRUE
         ORDER BY sort_order ASC`,
        [mod.id]
      );
      mod.lessons = lessons;
    }

    let enrollment = null;
    if (userId) {
      const [enr] = await query(
        'SELECT id, status, progress_percent, completed_lessons, started_at FROM enrollments WHERE user_id = ? AND course_id = ?',
        [userId, id]
      );
      if (enr) {
        enrollment = enr;
        const lessonProgress = await query(
          'SELECT lesson_id, is_completed, progress_percent FROM lesson_progress WHERE user_id = ? AND course_id = ?',
          [userId, id]
        );
        enrollment.lessonProgress = lessonProgress;
      }
    }

    return successResponse(res, { ...course, modules, enrollment }, 'Curso encontrado');
  } catch (error) {
    next(error);
  }
};

export const createCourse = async (req, res, next) => {
  try {
    const {
      title, slug, description, shortDescription, instructorId, categoryId,
      level, durationMinutes, thumbnailUrl, featured
    } = req.body;

    const id = uuidv4();
    await query(
      `INSERT INTO courses (id, title, slug, description, short_description, instructor_id, category_id,
        level, duration_minutes, thumbnail_url, featured, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', NOW())`,
      [id, title, slug, description, shortDescription || null, instructorId, categoryId,
       level, durationMinutes || 0, thumbnailUrl || null, featured || false]
    );

    const [course] = await query('SELECT * FROM courses WHERE id = ?', [id]);
    return successResponse(res, course, 'Curso criado com sucesso', 201);
  } catch (error) {
    next(error);
  }
};

export const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const allowedFields = ['title', 'slug', 'description', 'short_description', 'instructor_id',
      'category_id', 'level', 'duration_minutes', 'thumbnail_url', 'trailer_url', 'status',
      'featured', 'total_modules', 'total_lessons'];

    const fields = [];
    const values = [];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(updates[field] === undefined ? null : updates[field]);
      }
    }

    if (fields.length === 0) {
      return errorResponse(res, 'Nenhum campo para atualizar', 400);
    }

    values.push(id);
    await query(`UPDATE courses SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`, values);

    const [course] = await query('SELECT * FROM courses WHERE id = ?', [id]);
    return successResponse(res, course, 'Curso atualizado');
  } catch (error) {
    next(error);
  }
};

export const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Delete lesson progress
    const lessons = await query('SELECT id FROM lessons WHERE course_id = ?', [id]);
    for (const l of lessons) {
      await query('DELETE FROM lesson_progress WHERE lesson_id = ?', [l.id]);
    }

    // Delete lessons, modules, enrollments, certificates
    await query('DELETE FROM lessons WHERE course_id = ?', [id]);
    await query('DELETE FROM modules WHERE course_id = ?', [id]);
    await query('DELETE FROM enrollments WHERE course_id = ?', [id]);
    await query('DELETE FROM certificates WHERE course_id = ?', [id]);
    await query('DELETE FROM courses WHERE id = ?', [id]);

    return successResponse(res, null, 'Curso excluído permanentemente');
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await query(
      'SELECT * FROM categories WHERE is_active = TRUE ORDER BY sort_order ASC'
    );
    return successResponse(res, categories, 'Categorias listadas');
  } catch (error) {
    next(error);
  }
};

export const getInstructors = async (req, res, next) => {
  try {
    const instructors = await query(
      `SELECT id, name, email, avatar_url, 'Administrador' as specialty
       FROM users
       WHERE role = 'admin' AND status = 'active' AND deleted_at IS NULL
       ORDER BY name ASC`
    );
    return successResponse(res, instructors, 'Instrutores listados');
  } catch (error) {
    next(error);
  }
};

export const createModule = async (req, res, next) => {
  try {
    const { courseId, title, description, sortOrder } = req.body;

    const id = uuidv4();
    await query(
      'INSERT INTO modules (id, course_id, title, description, sort_order, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [id, courseId, title, description || null, sortOrder || 0]
    );

    const [module] = await query('SELECT * FROM modules WHERE id = ?', [id]);
    return successResponse(res, module, 'Módulo criado', 201);
  } catch (error) {
    next(error);
  }
};

export const createLesson = async (req, res, next) => {
  try {
    const { courseId, moduleId, title, description, videoUrl, videoDurationSeconds, sortOrder } = req.body;

    const id = uuidv4();
    await query(
      `INSERT INTO lessons (id, module_id, course_id, title, description, video_url, video_duration_seconds, sort_order, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [id, moduleId, courseId, title, description || null, videoUrl || null, videoDurationSeconds || 0, sortOrder || 0]
    );

    const [lesson] = await query('SELECT * FROM lessons WHERE id = ?', [id]);
    return successResponse(res, lesson, 'Aula criada', 201);
  } catch (error) {
    next(error);
  }
};

export const updateLesson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, videoUrl, videoDurationSeconds, sortOrder } = req.body;

    const fields = [];
    const values = [];
    if (title !== undefined) { fields.push('title = ?'); values.push(title); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description || null); }
    if (videoUrl !== undefined) { fields.push('video_url = ?'); values.push(videoUrl || null); }
    if (videoDurationSeconds !== undefined) { fields.push('video_duration_seconds = ?'); values.push(videoDurationSeconds); }
    if (sortOrder !== undefined) { fields.push('sort_order = ?'); values.push(sortOrder); }

    if (fields.length === 0) return errorResponse(res, 'Nenhum campo para atualizar', 400);

    values.push(id);
    await query(`UPDATE lessons SET ${fields.join(', ')} WHERE id = ?`, values);

    const [lesson] = await query('SELECT * FROM lessons WHERE id = ?', [id]);
    return successResponse(res, lesson, 'Aula atualizada');
  } catch (error) {
    next(error);
  }
};

export const deleteLesson = async (req, res, next) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM lesson_progress WHERE lesson_id = ?', [id]);
    await query('DELETE FROM lessons WHERE id = ?', [id]);
    return successResponse(res, null, 'Aula excluída');
  } catch (error) {
    next(error);
  }
};

export const updateModule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, sortOrder } = req.body;

    const fields = [];
    const values = [];
    if (title !== undefined) { fields.push('title = ?'); values.push(title); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description || null); }
    if (sortOrder !== undefined) { fields.push('sort_order = ?'); values.push(sortOrder); }

    if (fields.length === 0) return errorResponse(res, 'Nenhum campo para atualizar', 400);

    values.push(id);
    await query(`UPDATE modules SET ${fields.join(', ')} WHERE id = ?`, values);

    const [mod] = await query('SELECT * FROM modules WHERE id = ?', [id]);
    return successResponse(res, mod, 'Módulo atualizado');
  } catch (error) {
    next(error);
  }
};

export const deleteModule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lessons = await query('SELECT id FROM lessons WHERE module_id = ?', [id]);
    for (const l of lessons) {
      await query('DELETE FROM lesson_progress WHERE lesson_id = ?', [l.id]);
    }
    await query('DELETE FROM lessons WHERE module_id = ?', [id]);
    await query('DELETE FROM modules WHERE id = ?', [id]);
    return successResponse(res, null, 'Módulo excluído');
  } catch (error) {
    next(error);
  }
};
