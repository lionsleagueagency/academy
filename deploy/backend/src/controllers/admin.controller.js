import { query } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response.js';
import { syncAdminInstructor } from '../utils/adminInstructors.js';

export const getAdminStats = async (req, res, next) => {
  try {
    const [users] = await query(
      `SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN role = 'agent' THEN 1 END) as agents,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
        COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as new_today
       FROM users WHERE deleted_at IS NULL`
    );

    const [courses] = await query(
      `SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'published' THEN 1 END) as published,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as drafts
       FROM courses`
    );

    const [enrollments] = await query(
      `SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
       FROM enrollments`
    );

    const [engagement] = await query(
      `SELECT
        COALESCE(SUM(total_seconds), 0) as total_seconds_today
       FROM daily_study_logs WHERE study_date = CURDATE()`
    );

    const topCourses = await query(
      `SELECT c.id, c.title, c.students_count, c.completions_count, c.rating_avg,
        cat.name as category_name
       FROM courses c
       LEFT JOIN categories cat ON c.category_id = cat.id
       WHERE c.status = 'published'
       ORDER BY c.students_count DESC
       LIMIT 5`
    );

    const recentEnrollments = await query(
      `SELECT e.*, u.name as user_name, u.avatar_url, c.title as course_title
       FROM enrollments e
       JOIN users u ON e.user_id = u.id
       JOIN courses c ON e.course_id = c.id
       ORDER BY e.created_at DESC
       LIMIT 10`
    );

    return successResponse(res, {
      users,
      courses,
      enrollments,
      engagement: {
        total_hours_today: Math.round((engagement.total_seconds_today / 3600) * 100) / 100,
      },
      topCourses,
      recentEnrollments,
    }, 'Estatísticas administrativas carregadas');
  } catch (error) {
    next(error);
  }
};

export const getAdminUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    let whereClause = 'WHERE deleted_at IS NULL';
    const params = [];

    if (search) {
      whereClause += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const countResult = await query(`SELECT COUNT(*) as total FROM users ${whereClause}`, params);
    const total = countResult[0].total;

    const users = await query(
      `SELECT id, name, email, role, status, avatar_url, last_login_at, created_at
       FROM users ${whereClause}
       ORDER BY created_at DESC
       LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`,
      params
    );

    return paginatedResponse(res, users, { page, limit, total, totalPages: Math.ceil(total / limit) }, 'Usuários listados');
  } catch (error) {
    next(error);
  }
};

export const getAdminCourses = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const countResult = await query('SELECT COUNT(*) as total FROM courses');
    const total = countResult[0].total;

    const courses = await query(
      `SELECT c.*, cat.name as category_name, i.name as instructor_name,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as enrollment_count
       FROM courses c
       LEFT JOIN categories cat ON c.category_id = cat.id
       LEFT JOIN users i ON c.instructor_id = i.id AND i.role = 'admin' AND i.deleted_at IS NULL
       ORDER BY c.created_at DESC
       LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`,
      []
    );

    return paginatedResponse(res, courses, { page, limit, total, totalPages: Math.ceil(total / limit) }, 'Cursos listados');
  } catch (error) {
    next(error);
  }
};

export const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, type = 'info', targetAudience = 'all', isPinned = false } = req.body;
    const createdBy = req.user.id;

    const id = uuidv4();
    await query(
      `INSERT INTO announcements (id, title, content, type, target_audience, is_pinned, is_active, published_at, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, TRUE, NOW(), ?, NOW())`,
      [id, title, content, type, targetAudience, isPinned, createdBy]
    );

    const [announcement] = await query('SELECT * FROM announcements WHERE id = ?', [id]);
    return successResponse(res, announcement, 'Comunicado criado', 201);
  } catch (error) {
    next(error);
  }
};

export const getAnnouncements = async (req, res, next) => {
  try {
    const announcements = await query(
      `SELECT a.*, u.name as created_by_name
       FROM announcements a
       JOIN users u ON a.created_by = u.id
       WHERE a.is_active = TRUE
       ORDER BY a.is_pinned DESC, a.created_at DESC`
    );
    return successResponse(res, announcements, 'Comunicados carregados');
  } catch (error) {
    next(error);
  }
};

export const createAgent = async (req, res, next) => {
  try {
    const { name, email, password, tiktokUsername, avatarUrl } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 'Nome, email e senha são obrigatórios', 400);
    }

    const [existing] = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return errorResponse(res, 'Email já cadastrado', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const id = uuidv4();

    await query(
      `INSERT INTO users (id, name, email, tiktok_username, password_hash, avatar_url, role, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'agent', 'active', NOW())`,
      [id, name, email, tiktokUsername || null, hashedPassword, avatarUrl || null]
    );

    const [user] = await query(
      'SELECT id, name, email, tiktok_username, role, status, avatar_url, created_at FROM users WHERE id = ?',
      [id]
    );

    return successResponse(res, user, 'Agenciado criado com sucesso', 201);
  } catch (error) {
    next(error);
  }
};

export const getAdministrators = async (req, res, next) => {
  try {
    const search = req.query.search || '';
    const params = [];
    let whereClause = "WHERE role = 'admin' AND deleted_at IS NULL";

    if (search) {
      whereClause += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const admins = await query(
      `SELECT id, name, email, avatar_url, status, last_login_at, created_at
       FROM users
       ${whereClause}
       ORDER BY created_at DESC`,
      params
    );

    return successResponse(res, admins, 'Administradores listados');
  } catch (error) {
    next(error);
  }
};

export const createAdministrator = async (req, res, next) => {
  try {
    const { name, email, password, avatarUrl } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 'Nome, email e senha são obrigatórios', 400);
    }

    if (password.length < 6) {
      return errorResponse(res, 'A senha deve ter pelo menos 6 caracteres', 400);
    }

    const [existing] = await query('SELECT id FROM users WHERE email = ? AND deleted_at IS NULL', [email]);
    if (existing) {
      return errorResponse(res, 'Email já cadastrado', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const id = uuidv4();

    await query(
      `INSERT INTO users (id, name, email, password_hash, avatar_url, role, status, created_at)
       VALUES (?, ?, ?, ?, ?, 'admin', 'active', NOW())`,
      [id, name, email, hashedPassword, avatarUrl || null]
    );

    const [admin] = await query(
      'SELECT id, name, email, avatar_url, role, status, created_at FROM users WHERE id = ?',
      [id]
    );

    await syncAdminInstructor(admin);

    return successResponse(res, admin, 'Administrador criado com sucesso', 201);
  } catch (error) {
    next(error);
  }
};

export const updateAdministrator = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, status, avatarUrl, password } = req.body;

    const [admin] = await query(
      "SELECT id FROM users WHERE id = ? AND role = 'admin' AND deleted_at IS NULL",
      [id]
    );

    if (!admin) {
      return errorResponse(res, 'Administrador não encontrado', 404);
    }

    const fields = [];
    const values = [];

    if (name !== undefined) {
      fields.push('name = ?');
      values.push(name || null);
    }
    if (status !== undefined) {
      fields.push('status = ?');
      values.push(status || 'active');
    }
    if (avatarUrl !== undefined) {
      fields.push('avatar_url = ?');
      values.push(avatarUrl || null);
    }
    if (password) {
      if (password.length < 6) {
        return errorResponse(res, 'A senha deve ter pelo menos 6 caracteres', 400);
      }
      fields.push('password_hash = ?');
      values.push(await bcrypt.hash(password, 12));
    }

    if (fields.length === 0) {
      return errorResponse(res, 'Nenhum campo para atualizar', 400);
    }

    values.push(id);
    await query(`UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`, values);

    const [updated] = await query(
      'SELECT id, name, email, avatar_url, role, status, created_at FROM users WHERE id = ?',
      [id]
    );

    await syncAdminInstructor(updated);

    return successResponse(res, updated, 'Administrador atualizado');
  } catch (error) {
    next(error);
  }
};

export const deleteAdministrator = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return errorResponse(res, 'Você não pode excluir o próprio administrador logado', 400);
    }

    const [admin] = await query(
      "SELECT id FROM users WHERE id = ? AND role = 'admin' AND deleted_at IS NULL",
      [id]
    );

    if (!admin) {
      return errorResponse(res, 'Administrador não encontrado', 404);
    }

    const [courseUse] = await query('SELECT COUNT(*) as total FROM courses WHERE instructor_id = ?', [id]);
    if (courseUse.total > 0) {
      return errorResponse(res, 'Este administrador está vinculado como instrutor em cursos. Altere o instrutor dos cursos antes de excluir.', 409);
    }

    await query('UPDATE users SET deleted_at = NOW(), status = ? WHERE id = ?', ['inactive', id]);
    await query('UPDATE instructors SET is_active = FALSE, updated_at = NOW() WHERE id = ?', [id]);
    return successResponse(res, null, 'Administrador excluído');
  } catch (error) {
    next(error);
  }
};
