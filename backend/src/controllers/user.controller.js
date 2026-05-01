import { query } from '../config/database.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response.js';

export const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const role = req.query.role;
    const status = req.query.status;

    let whereClause = 'WHERE deleted_at IS NULL';
    const params = [];

    if (search) {
      whereClause += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (role) {
      whereClause += ' AND role = ?';
      params.push(role);
    }
    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    const countResult = await query(`SELECT COUNT(*) as total FROM users ${whereClause}`, params);
    const total = countResult[0].total;

    const users = await query(
      `SELECT id, name, email, role, status, avatar_url, city, state,
              last_login_at, created_at
       FROM users ${whereClause}
       ORDER BY created_at DESC
       LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`,
      params
    );

    return paginatedResponse(res, users, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }, 'Usuários listados');
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [user] = await query(
      `SELECT id, name, email, role, status, avatar_url, phone, bio, city, state, country,
              theme_preference, last_login_at, created_at
       FROM users WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );

    if (!user) {
      return errorResponse(res, 'Usuário não encontrado', 404);
    }

    const stats = await query(
      `SELECT
        (SELECT COUNT(*) FROM enrollments WHERE user_id = ? AND status = 'completed') as courses_completed,
        (SELECT COUNT(*) FROM enrollments WHERE user_id = ?) as total_enrollments,
        (SELECT COUNT(*) FROM certificates WHERE user_id = ?) as certificates,
        (SELECT COALESCE(SUM(total_seconds), 0) FROM daily_study_logs WHERE user_id = ?) / 3600 as hours_watched`,
      [id, id, id, id]
    );

    return successResponse(res, { ...user, stats: stats[0] }, 'Usuário encontrado');
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, role, status, phone } = req.body;

    await query(
      `UPDATE users SET
        name = COALESCE(?, name),
        role = COALESCE(?, role),
        status = COALESCE(?, status),
        phone = COALESCE(?, phone),
        updated_at = NOW()
       WHERE id = ?`,
      [name, role, status, phone, id]
    );

    const [user] = await query('SELECT id, name, email, role, status, avatar_url FROM users WHERE id = ?', [id]);
    return successResponse(res, user, 'Usuário atualizado');
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await query('UPDATE users SET deleted_at = NOW() WHERE id = ?', [id]);
    return successResponse(res, null, 'Usuário removido');
  } catch (error) {
    next(error);
  }
};
