import express from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import courseRoutes from './course.routes.js';
import enrollmentRoutes from './enrollment.routes.js';
import progressRoutes from './progress.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import eventRoutes from './event.routes.js';
import adminRoutes from './admin.routes.js';
import uploadRoutes from './upload.routes.js';
import categoryRoutes from './category.routes.js';
import certificateRoutes from './certificate.routes.js';
import communityRoutes from './community.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/courses', courseRoutes);
router.use('/categories', categoryRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/progress', progressRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/events', eventRoutes);
router.use('/admin', adminRoutes);
router.use('/upload', uploadRoutes);
router.use('/certificates', certificateRoutes);
router.use('/community', communityRoutes);

export default router;
