import express from 'express';
import {
  getUsers, getUserById, updateUser, deleteUser
} from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', authenticate, authorize('admin'), getUsers);
router.get('/:id', authenticate, getUserById);
router.patch('/:id', authenticate, authorize('admin'), updateUser);
router.delete('/:id', authenticate, authorize('admin'), deleteUser);

export default router;
