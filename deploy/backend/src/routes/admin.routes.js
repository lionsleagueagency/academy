import express from 'express';
import {
  getAdminStats, getAdminUsers, getAdminCourses,
  createAnnouncement, getAnnouncements, createAgent,
  getAdministrators, createAdministrator, updateAdministrator, deleteAdministrator
} from '../controllers/admin.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.get('/stats', authenticate, authorize('admin'), getAdminStats);
router.get('/users', authenticate, authorize('admin'), getAdminUsers);
router.get('/courses', authenticate, authorize('admin'), getAdminCourses);
router.get('/announcements', authenticate, getAnnouncements);
router.post('/announcements', authenticate, authorize('admin'), createAnnouncement);
router.post('/agents', authenticate, authorize('admin'), createAgent);
router.get('/administrators', authenticate, authorize('admin'), getAdministrators);
router.post('/administrators', authenticate, authorize('admin'), createAdministrator);
router.patch('/administrators/:id', authenticate, authorize('admin'), updateAdministrator);
router.delete('/administrators/:id', authenticate, authorize('admin'), deleteAdministrator);

export default router;
