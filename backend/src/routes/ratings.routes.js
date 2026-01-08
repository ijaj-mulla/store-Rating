import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { submitRating, getUserRating, getStoreRatingStats, getStoreRatingsWithUserNames } from '../controllers/ratings.controller.js';

const router = Router();

router.post('/', authenticate, authorize('user'), submitRating);
router.get('/my/:storeId', authenticate, authorize('user'), getUserRating);
router.get('/store/:storeId/stats', getStoreRatingStats);
router.get('/store/:storeId/ratings', authenticate, authorize('store_owner'), getStoreRatingsWithUserNames);

export default router;
