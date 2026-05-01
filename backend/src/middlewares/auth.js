import { query } from '../config/database.js';
import { verifyToken } from '../utils/jwt.js';
import { errorResponse } from '../utils/response.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Token de autenticação não fornecido', 401);
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    const [user] = await query(
      'SELECT id, name, email, role, status, avatar_url FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!user) {
      return errorResponse(res, 'Usuário não encontrado', 401);
    }

    if (user.status !== 'active') {
      return errorResponse(res, 'Conta suspensa ou inativa', 403);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token expirado', 401);
    }
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Token inválido', 401);
    }
    return errorResponse(res, 'Erro de autenticação', 401);
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Não autenticado', 401);
    }
    if (!roles.includes(req.user.role)) {
      return errorResponse(res, 'Acesso não autorizado', 403);
    }
    next();
  };
};
