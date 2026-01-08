import { topStores } from '../models/stores.model.js';

export const getDashboard = async (req, res) => {
  try {
    const top = await topStores(5);
    return res.json({ welcome: `Hello, ${req.user.name}` , topStores: top });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
