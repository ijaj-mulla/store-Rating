import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { getDashboard } from '../controllers/user.controller.js';

const router = Router();
router.get('/dashboard', authenticate, authorize('user'), getDashboard);

export default router;
