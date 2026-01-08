import { countUsers, listUsers } from '../models/users.model.js';
import { countStores, listStoresWithOwners } from '../models/stores.model.js';
import { emailExists, createUser, getByEmail } from '../models/users.model.js';
import { createStore as createStoreModel } from '../models/stores.model.js';
import bcrypt from 'bcrypt';

export const getDashboard = async (req, res) => {
  try {
    const users = await countUsers();
    const stores = await countStores();
    return res.json({ users, stores });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await listUsers();
    return res.json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getStores = async (req, res) => {
  try {
    const stores = await listStoresWithOwners();
    return res.json(stores);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Admin: create a new user with role
export const adminCreateUser = async (req, res) => {
  try {
    const { name, email, password, role, address } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'name, email, password, role are required' });
    }
    if (!['admin', 'store_owner', 'user'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const exists = await emailExists(email);
    if (exists) return res.status(409).json({ message: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await createUser({ name, email, password: hashed, role, address });
    return res.status(201).json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Admin: create store and assign to an existing owner by email or id
export const adminCreateStore = async (req, res) => {
  try {
    const { name, ownerEmail, ownerId, rating, address } = req.body;
    if (!name) return res.status(400).json({ message: 'Store name is required' });

    let owner_id = ownerId;
    if (!owner_id && ownerEmail) {
      const owner = await getByEmail(ownerEmail);
      if (!owner) return res.status(404).json({ message: 'Owner not found' });
      owner_id = owner.id;
    }
    if (!owner_id) return res.status(400).json({ message: 'ownerId or ownerEmail is required' });

    const store = await createStoreModel({ name, ownerId: owner_id, rating: rating ?? 0, address });
    return res.status(201).json(store);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
