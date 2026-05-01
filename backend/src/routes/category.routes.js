import express from 'express';
import { query } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import { successResponse, errorResponse } from '../utils/response.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// GET all categories
router.get('/', async (req, res, next) => {
  try {
    const categories = await query(
      'SELECT id, name, slug, description, color, sort_order, is_active, created_at FROM categories ORDER BY sort_order ASC'
    );
    return successResponse(res, categories, 'Categorias carregadas');
  } catch (error) {
    next(error);
  }
});

// GET single category
router.get('/:id', async (req, res, next) => {
  try {
    const [category] = await query('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    if (!category) return errorResponse(res, 'Categoria não encontrada', 404);
    return successResponse(res, category);
  } catch (error) {
    next(error);
  }
});

// POST create category
router.post('/', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { name, description, color, sortOrder } = req.body;
    if (!name) return errorResponse(res, 'Nome é obrigatório', 400);

    const slug = name.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const [existing] = await query('SELECT id FROM categories WHERE slug = ?', [slug]);
    if (existing) return errorResponse(res, 'Já existe uma categoria com esse nome', 409);

    const id = uuidv4();
    await query(
      `INSERT INTO categories (id, name, slug, description, color, sort_order, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, TRUE, NOW())`,
      [id, name, slug, description || null, color || '#6C5CE7', sortOrder || 0]
    );

    const [category] = await query('SELECT * FROM categories WHERE id = ?', [id]);
    return successResponse(res, category, 'Categoria criada', 201);
  } catch (error) {
    next(error);
  }
});

// PATCH update category
router.patch('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const [existing] = await query('SELECT id FROM categories WHERE id = ?', [id]);
    if (!existing) return errorResponse(res, 'Categoria não encontrada', 404);

    const fields = [];
    const values = [];
    const allowed = { name: 'name', description: 'description', color: 'color', sortOrder: 'sort_order', isActive: 'is_active' };

    for (const [key, col] of Object.entries(allowed)) {
      if (req.body[key] !== undefined) {
        fields.push(`${col} = ?`);
        values.push(req.body[key]);
      }
    }

    if (req.body.name) {
      const slug = req.body.name.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      fields.push('slug = ?');
      values.push(slug);
    }

    if (fields.length === 0) return errorResponse(res, 'Nenhum campo para atualizar', 400);

    values.push(id);
    await query(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`, values);

    const [category] = await query('SELECT * FROM categories WHERE id = ?', [id]);
    return successResponse(res, category, 'Categoria atualizada');
  } catch (error) {
    next(error);
  }
});

// DELETE category
router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const [courses] = await query('SELECT COUNT(*) as count FROM courses WHERE category_id = ?', [id]);
    if (courses.count > 0) {
      return errorResponse(res, `Não é possível excluir: ${courses.count} curso(s) usam esta categoria`, 400);
    }
    await query('DELETE FROM categories WHERE id = ?', [id]);
    return successResponse(res, null, 'Categoria excluída');
  } catch (error) {
    next(error);
  }
});

export default router;
