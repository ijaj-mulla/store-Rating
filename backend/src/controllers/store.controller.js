import { countByOwner, createStore as createStoreModel, getByOwner, listStoresWithOwners, listStoresWithUserRating, getStoreWithRatingsForOwner } from '../models/stores.model.js';
import { getRatingsWithUserNamesForStore } from '../models/ratings.model.js';

export const getDashboard = async (req, res) => {
  try {
    const count = await countByOwner(req.user.id);
    return res.json({ myStores: count });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const createStore = async (req, res) => {
  try {
    const { name, address } = req.body;
    if (!name) return res.status(400).json({ message: 'Store name is required' });

    const store = await createStoreModel({ name, ownerId: req.user.id, address });
    return res.status(201).json(store);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getMyStores = async (req, res) => {
  try {
    const stores = await getByOwner(req.user.id);
    return res.json(stores);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const listAllStores = async (req, res) => {
  try {
    const stores = await listStoresWithOwners();
    return res.json(stores);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const listStoresForUser = async (req, res) => {
  try {
    const stores = await listStoresWithUserRating(req.user.id);
    return res.json(stores);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getStoreWithRatings = async (req, res) => {
  try {
    const { storeId } = req.params;
    const userId = req.user.id;
    
    const store = await getStoreWithRatingsForOwner(userId, storeId);
    
    if (!store) {
      return res.status(404).json({ message: 'Store not found or you do not own this store' });
    }
    
    const ratings = await getRatingsWithUserNamesForStore(storeId);
    
    return res.json({
      store,
      ratings
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
