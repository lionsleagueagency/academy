import express from 'express';
import {
  getCourses, getCourseById, createCourse, updateCourse, deleteCourse,
  getCategories, getInstructors, createModule, createLesson,
  updateLesson, deleteLesson, updateModule, deleteModule
} from '../controllers/course.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { createCourseValidator, createModuleValidator, createLessonValidator } from '../validators/course.validator.js';

const router = express.Router();

router.get('/', getCourses);
router.get('/categories', getCategories);
router.get('/instructors', getInstructors);
router.get('/:id', authenticate, getCourseById);
router.post('/', authenticate, authorize('admin'), createCourseValidator, createCourse);
router.patch('/:id', authenticate, authorize('admin'), updateCourse);
router.delete('/:id', authenticate, authorize('admin'), deleteCourse);
router.post('/modules', authenticate, authorize('admin'), createModuleValidator, createModule);
router.patch('/modules/:id', authenticate, authorize('admin'), updateModule);
router.delete('/modules/:id', authenticate, authorize('admin'), deleteModule);
router.post('/lessons', authenticate, authorize('admin'), createLessonValidator, createLesson);
router.patch('/lessons/:id', authenticate, authorize('admin'), updateLesson);
router.delete('/lessons/:id', authenticate, authorize('admin'), deleteLesson);

export default router;
