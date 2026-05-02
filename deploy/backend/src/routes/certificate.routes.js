import express from 'express';
import { query } from '../config/database.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// GET certificate by ID (with course details)
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [cert] = await query(
      `SELECT cert.*, c.title as course_title, c.thumbnail_url as course_thumbnail,
              c.duration_minutes, c.level,
              u.name as student_name, u.email as student_email,
              i.name as instructor_name
       FROM certificates cert
       JOIN courses c ON cert.course_id = c.id
       JOIN users u ON cert.user_id = u.id
       LEFT JOIN instructors i ON c.instructor_id = i.id
       WHERE cert.id = ? AND cert.user_id = ? AND cert.revoked_at IS NULL`,
      [id, userId]
    );

    if (!cert) {
      return errorResponse(res, 'Certificado não encontrado', 404);
    }

    return successResponse(res, cert, 'Certificado carregado');
  } catch (error) {
    next(error);
  }
});

// GET certificate verification (public)
router.get('/verify/:number', async (req, res, next) => {
  try {
    const { number } = req.params;

    const [cert] = await query(
      `SELECT cert.id, cert.certificate_number, cert.issue_date, cert.verified,
              c.title as course_title, c.duration_minutes,
              u.name as student_name
       FROM certificates cert
       JOIN courses c ON cert.course_id = c.id
       JOIN users u ON cert.user_id = u.id
       WHERE cert.certificate_number = ? AND cert.revoked_at IS NULL`,
      [number]
    );

    if (!cert) {
      return errorResponse(res, 'Certificado não encontrado ou revogado', 404);
    }

    return successResponse(res, cert, 'Certificado verificado');
  } catch (error) {
    next(error);
  }
});

export default router;
