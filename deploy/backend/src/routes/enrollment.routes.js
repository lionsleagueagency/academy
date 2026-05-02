import express from 'express';
import {
  getMyEnrollments, enrollInCourse, getEnrollmentById, dropEnrollment
} from '../controllers/enrollment.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', authenticate, getMyEnrollments);
router.get('/:id', authenticate, getEnrollmentById);
router.post('/course/:courseId', authenticate, enrollInCourse);
router.patch('/:id/drop', authenticate, dropEnrollment);

export default router;
