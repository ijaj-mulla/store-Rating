import { upsertRating, getUserRatingForStore, getAverageRatingForStore, getRatingsWithUserNamesForStore } from '../models/ratings.model.js';
import { getByOwner } from '../models/stores.model.js';

export const submitRating = async (req, res) => {
  try {
    const { storeId, rating } = req.body;
    const userId = req.user.id;

    if (!storeId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'storeId and rating (1-5) are required' });
    }

    const result = await upsertRating({ userId, storeId, rating });
    return res.status(201).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getUserRating = async (req, res) => {
  try {
    const { storeId } = req.params;
    const userId = req.user.id;
    const rating = await getUserRatingForStore(userId, storeId);
    return res.json(rating);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getStoreRatingStats = async (req, res) => {
  try {
    const { storeId } = req.params;
    const stats = await getAverageRatingForStore(storeId);
    return res.json(stats);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getStoreRatingsWithUserNames = async (req, res) => {
  try {
    const { storeId } = req.params;
    const userId = req.user.id;
    
    const ownerStores = await getByOwner(userId);
    const ownsStore = ownerStores.some(store => store.id === parseInt(storeId));
    
    if (!ownsStore) {
      return res.status(403).json({ message: 'Forbidden: You can only view ratings for your own stores' });
    }
    
    const ratings = await getRatingsWithUserNamesForStore(storeId);
    return res.json(ratings);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
