import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { getDashboard, getUsers, getStores, adminCreateUser, adminCreateStore } from '../controllers/admin.controller.js';

const router = Router();
router.get('/dashboard', authenticate, authorize('admin'), getDashboard);
router.get('/users', authenticate, authorize('admin'), getUsers);
router.get('/stores', authenticate, authorize('admin'), getStores);
router.post('/users', authenticate, authorize('admin'), adminCreateUser);
router.post('/stores', authenticate, authorize('admin'), adminCreateStore);

export default router;
