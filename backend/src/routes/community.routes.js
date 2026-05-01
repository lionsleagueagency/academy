import express from 'express';
import { query } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import { successResponse, errorResponse } from '../utils/response.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// GET all posts with user info
router.get('/posts', authenticate, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const posts = await query(
      `SELECT p.id, p.content, p.image_url, p.likes_count, p.comments_count, p.created_at,
              u.id as user_id, u.name as author, u.avatar_url, u.role,
              EXISTS(SELECT 1 FROM community_likes l WHERE l.post_id = p.id AND l.user_id = ?) as user_liked
       FROM community_posts p
       JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC
       LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`,
      [req.user.id]
    );

    return successResponse(res, posts, 'Posts carregados');
  } catch (error) {
    next(error);
  }
});

// POST create post
router.post('/posts', authenticate, async (req, res, next) => {
  try {
    const { content, imageUrl } = req.body;
    if (!content || !content.trim()) {
      return errorResponse(res, 'Conteúdo é obrigatório', 400);
    }

    const id = uuidv4();
    await query(
      `INSERT INTO community_posts (id, user_id, content, image_url, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [id, req.user.id, content.trim(), imageUrl || null]
    );

    const [post] = await query(
      `SELECT p.id, p.content, p.image_url, p.likes_count, p.comments_count, p.created_at,
              u.id as user_id, u.name as author, u.avatar_url, u.role, FALSE as user_liked
       FROM community_posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [id]
    );

    return successResponse(res, post, 'Post criado', 201);
  } catch (error) {
    next(error);
  }
});

// DELETE post
router.delete('/posts/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const [post] = await query('SELECT user_id FROM community_posts WHERE id = ?', [id]);

    if (!post) return errorResponse(res, 'Post não encontrado', 404);
    if (post.user_id !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'Sem permissão', 403);
    }

    await query('DELETE FROM community_posts WHERE id = ?', [id]);
    return successResponse(res, null, 'Post excluído');
  } catch (error) {
    next(error);
  }
});

// POST like/unlike
router.post('/posts/:id/like', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [existing] = await query(
      'SELECT id FROM community_likes WHERE post_id = ? AND user_id = ?',
      [id, userId]
    );

    if (existing) {
      // Unlike
      await query('DELETE FROM community_likes WHERE post_id = ? AND user_id = ?', [id, userId]);
      await query('UPDATE community_posts SET likes_count = likes_count - 1 WHERE id = ?', [id]);
      return successResponse(res, { liked: false }, 'Like removido');
    } else {
      // Like
      await query(
        'INSERT INTO community_likes (id, post_id, user_id, created_at) VALUES (?, ?, ?, NOW())',
        [uuidv4(), id, userId]
      );
      await query('UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = ?', [id]);
      return successResponse(res, { liked: true }, 'Like adicionado');
    }
  } catch (error) {
    next(error);
  }
});

// GET comments for a post
router.get('/posts/:id/comments', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const comments = await query(
      `SELECT c.id, c.content, c.created_at,
              u.id as user_id, u.name as author, u.avatar_url, u.role
       FROM community_comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = ?
       ORDER BY c.created_at ASC`,
      [id]
    );
    return successResponse(res, comments, 'Comentários carregados');
  } catch (error) {
    next(error);
  }
});

// POST comment
router.post('/posts/:id/comments', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    if (!content || !content.trim()) {
      return errorResponse(res, 'Conteúdo é obrigatório', 400);
    }

    const commentId = uuidv4();
    await query(
      'INSERT INTO community_comments (id, post_id, user_id, content, created_at) VALUES (?, ?, ?, ?, NOW())',
      [commentId, id, req.user.id, content.trim()]
    );
    await query('UPDATE community_posts SET comments_count = comments_count + 1 WHERE id = ?', [id]);

    const [comment] = await query(
      `SELECT c.id, c.content, c.created_at,
              u.id as user_id, u.name as author, u.avatar_url, u.role
       FROM community_comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [commentId]
    );

    return successResponse(res, comment, 'Comentário adicionado', 201);
  } catch (error) {
    next(error);
  }
});

// DELETE comment
router.delete('/comments/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const [comment] = await query('SELECT user_id, post_id FROM community_comments WHERE id = ?', [id]);

    if (!comment) return errorResponse(res, 'Comentário não encontrado', 404);
    if (comment.user_id !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'Sem permissão', 403);
    }

    await query('DELETE FROM community_comments WHERE id = ?', [id]);
    await query('UPDATE community_posts SET comments_count = comments_count - 1 WHERE id = ?', [comment.post_id]);
    return successResponse(res, null, 'Comentário excluído');
  } catch (error) {
    next(error);
  }
});

// GET top members (by engagement)
router.get('/top-members', authenticate, async (req, res, next) => {
  try {
    const members = await query(
      `SELECT u.id, u.name, u.avatar_url, u.role,
              (SELECT COUNT(*) FROM community_posts WHERE user_id = u.id) as posts_count,
              (SELECT COUNT(*) FROM community_likes l JOIN community_posts p ON l.post_id = p.id WHERE p.user_id = u.id) as received_likes
       FROM users u
       WHERE u.status = 'active'
       ORDER BY (posts_count * 10 + received_likes) DESC
       LIMIT 10`
    );
    return successResponse(res, members, 'Top membros carregados');
  } catch (error) {
    next(error);
  }
});

export default router;
