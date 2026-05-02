import express from 'express';
import {
  register, login, getMe, updateProfile, changePassword
} from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { registerValidator, loginValidator } from '../validators/auth.validator.js';

const router = express.Router();

router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);
router.get('/me', authenticate, getMe);
router.patch('/me', authenticate, updateProfile);
router.patch('/change-password', authenticate, changePassword);

export default router;
