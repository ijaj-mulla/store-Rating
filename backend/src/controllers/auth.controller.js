import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { emailExists, createUser, getByEmail, updateUserPassword } from '../models/users.model.js';

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

const signToken = (user) => {
  // Keep payload minimal
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const normalizedRole = role || 'user';
    if (!['admin', 'store_owner', 'user'].includes(normalizedRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Check if email exists
    const exists = await emailExists(email);
    if (exists) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await createUser({ name, email, password: hashed, role: normalizedRole });
    const token = signToken(user);
    return res.status(201).json({ user, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await getByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    delete user.password;
    const token = signToken(user);
    return res.json({ user, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    // Get user from token (middleware should attach user to req)
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Get current user data with password
    const userWithPassword = await getByEmail(req.user.email);
    if (!userWithPassword) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const currentPasswordMatch = await bcrypt.compare(currentPassword, userWithPassword.password);
    if (!currentPasswordMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    const updated = await updateUserPassword(req.user.email, hashedNewPassword);
    if (!updated) {
      return res.status(500).json({ message: 'Failed to update password' });
    }

    return res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
