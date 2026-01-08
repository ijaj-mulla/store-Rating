import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { submitRating, getUserRating, getStoreRatingStats, getStoreRatingsWithUserNames } from '../controllers/ratings.controller.js';

const router = Router();

// Only users can submit/update ratings
router.post('/', authenticate, authorize('user'), submitRating);
router.get('/my/:storeId', authenticate, authorize('user'), getUserRating);
// Public endpoint for store rating stats
router.get('/store/:storeId/stats', getStoreRatingStats);
// Only store owners can view ratings for their stores
router.get('/store/:storeId/ratings', authenticate, authorize('store_owner'), getStoreRatingsWithUserNames);

export default router;
