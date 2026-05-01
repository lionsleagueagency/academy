import { errorResponse } from '../utils/response.js';

export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return errorResponse(res, 'Erro de validação', 400, err.errors);
  }

  if (err.code === 'ER_DUP_ENTRY') {
    const match = err.message?.match(/Duplicate entry '(.+?)' for key '(.+?)'/);
    const field = match ? match[2] : '';
    const value = match ? match[1] : '';
    let msg = 'Registro já existe';
    if (field.includes('slug')) msg = `Já existe um curso com o slug "${value}". Altere o título ou slug.`;
    else if (field.includes('email')) msg = `O email "${value}" já está cadastrado.`;
    return errorResponse(res, msg, 409);
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return errorResponse(res, 'Referência não encontrada', 400);
  }

  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Token inválido', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Token expirado', 401);
  }

  return errorResponse(
    res,
    process.env.NODE_ENV === 'production' ? 'Erro interno do servidor' : err.message,
    500
  );
};
