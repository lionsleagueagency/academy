import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database.js';
import { generateToken, generateRefreshToken, verifyToken } from '../utils/jwt.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { validationResult } from 'express-validator';

export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Erro de validação', 400, errors.array());
    }

    const { name, email, password } = req.body;

    const [existingUser] = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return errorResponse(res, 'Email já cadastrado', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = uuidv4();

    await query(
      `INSERT INTO users (id, name, email, password_hash, role, status, created_at)
       VALUES (?, ?, ?, ?, 'agent', 'active', NOW())`,
      [userId, name, email, hashedPassword]
    );

    const token = generateToken({ userId, email, role: 'agent' });
    const refreshToken = generateRefreshToken({ userId });

    const [newUser] = await query(
      'SELECT id, name, email, role, avatar_url, created_at FROM users WHERE id = ?',
      [userId]
    );

    return successResponse(res, {
      user: newUser,
      token,
      refreshToken,
    }, 'Usuário registrado com sucesso', 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Erro de validação', 400, errors.array());
    }

    const { email, password } = req.body;

    const [user] = await query(
      'SELECT id, name, email, password_hash, role, status, avatar_url, theme_preference FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      return errorResponse(res, 'Email ou senha incorretos', 401);
    }

    if (user.status !== 'active') {
      return errorResponse(res, 'Conta suspensa ou inativa', 403);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return errorResponse(res, 'Email ou senha incorretos', 401);
    }

    await query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);

    const token = generateToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id });

    const { password_hash, ...userWithoutPassword } = user;

    return successResponse(res, {
      user: userWithoutPassword,
      token,
      refreshToken,
    }, 'Login realizado com sucesso');
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return errorResponse(res, 'Refresh token não fornecido', 400);
    }

    const decoded = verifyToken(token);
    const [user] = await query('SELECT id, email, role FROM users WHERE id = ?', [decoded.userId]);

    if (!user) {
      return errorResponse(res, 'Usuário não encontrado', 401);
    }

    const newToken = generateToken({ userId: user.id, email: user.email, role: user.role });
    const newRefreshToken = generateRefreshToken({ userId: user.id });

    return successResponse(res, { token: newToken, refreshToken: newRefreshToken }, 'Token atualizado');
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const [user] = await query(
      `SELECT id, name, email, tiktok_username, role, status, avatar_url, phone, bio, city, state,
              theme_preference, email_verified, last_login_at, created_at
       FROM users WHERE id = ?`,
      [req.user.id]
    );

    if (!user) {
      return errorResponse(res, 'Usuário não encontrado', 404);
    }

    return successResponse(res, user, 'Perfil carregado');
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, bio, city, state, avatar_url, theme_preference, tiktok_username } = req.body;
    const userId = req.user.id;

    await query(
      `UPDATE users SET
        name = COALESCE(?, name),
        phone = COALESCE(?, phone),
        bio = COALESCE(?, bio),
        city = COALESCE(?, city),
        state = COALESCE(?, state),
        avatar_url = COALESCE(?, avatar_url),
        theme_preference = COALESCE(?, theme_preference),
        tiktok_username = COALESCE(?, tiktok_username),
        updated_at = NOW()
       WHERE id = ?`,
      [
        name ?? null,
        phone ?? null,
        bio ?? null,
        city ?? null,
        state ?? null,
        avatar_url ?? null,
        theme_preference ?? null,
        tiktok_username ?? null,
        userId
      ]
    );

    const [updatedUser] = await query(
      'SELECT id, name, email, role, avatar_url, theme_preference FROM users WHERE id = ?',
      [userId]
    );

    return successResponse(res, updatedUser, 'Perfil atualizado');
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const [user] = await query('SELECT password_hash FROM users WHERE id = ?', [userId]);
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      return errorResponse(res, 'Senha atual incorreta', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, userId]);

    return successResponse(res, null, 'Senha alterada com sucesso');
  } catch (error) {
    next(error);
  }
};
