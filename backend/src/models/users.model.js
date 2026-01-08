import { query } from '../config/db.js';

export const getByEmail = async (email) => {
  const result = await query(
    'SELECT id, name, email, password, role, address, created_at FROM users WHERE email = $1',
    [email.toLowerCase()]
  );
  return result.rows[0] || null;
};

export const createUser = async ({ name, email, password, role, address = null }) => {
  const result = await query(
    `INSERT INTO users(name, email, password, role, address)
     VALUES($1,$2,$3,$4,$5)
     RETURNING id, name, email, role, address, created_at`,
    [name, email.toLowerCase(), password, role, address]
  );
  return result.rows[0];
};

export const emailExists = async (email) => {
  const result = await query('SELECT 1 FROM users WHERE email = $1', [email.toLowerCase()]);
  return result.rowCount > 0;
};

export const listUsers = async () => {
  const result = await query('SELECT id, name, email, role, address, created_at FROM users ORDER BY created_at DESC');
  return result.rows;
};

export const countUsers = async () => {
  const result = await query('SELECT COUNT(*)::int AS count FROM users');
  return result.rows[0].count;
};

export const updateUserPassword = async (email, newPassword) => {
  const result = await query(
    'UPDATE users SET password = $1 WHERE email = $2',
    [newPassword, email]
  );
  return result.rowCount > 0;
};
