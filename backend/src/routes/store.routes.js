import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { getDashboard, createStore, getMyStores, listAllStores, listStoresForUser, getStoreWithRatings } from '../controllers/store.controller.js';

const router = Router();

router.get('/dashboard', authenticate, authorize('store_owner'), getDashboard);
router.post('/create', authenticate, authorize('store_owner'), createStore);
router.get('/my-stores', authenticate, authorize('store_owner'), getMyStores);
router.get('/my-stores/:storeId/ratings', authenticate, authorize('store_owner'), getStoreWithRatings);

router.get('/user-stores', authenticate, authorize('user'), listStoresForUser);

router.get('/admin-all', authenticate, authorize('admin'), listAllStores);

router.get('/all', authenticate, listAllStores);

export default router;
