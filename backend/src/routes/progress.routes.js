import express from 'express';
import {
  updateProgress, getLessonProgress, getCourseProgress
} from '../controllers/progress.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.get('/lesson/:lessonId', authenticate, getLessonProgress);
router.get('/course/:courseId', authenticate, getCourseProgress);
router.post('/lesson/:lessonId', authenticate, updateProgress);

export default router;
