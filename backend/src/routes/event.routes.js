import express from 'express';
import {
  getEvents, getUpcomingEvents, getEventById, createEvent, updateEvent, deleteEvent
} from '../controllers/event.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', getEvents);
router.get('/upcoming', getUpcomingEvents);
router.get('/:id', getEventById);
router.post('/', authenticate, authorize('admin'), createEvent);
router.patch('/:id', authenticate, authorize('admin'), updateEvent);
router.delete('/:id', authenticate, authorize('admin'), deleteEvent);

export default router;
