import express from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';
import { successResponse } from '../utils/response.js';

const router = express.Router();

router.post('/', authenticate, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Nenhum arquivo enviado' });
  }
  const url = `/uploads/${req.file.filename}`;
  return successResponse(res, { url }, 'Upload realizado com sucesso');
});

export default router;
