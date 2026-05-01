import express from 'express';
import {
  getAgentDashboard, getAgentCertificates
} from '../controllers/dashboard.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', authenticate, getAgentDashboard);
router.get('/certificates', authenticate, getAgentCertificates);

export default router;
