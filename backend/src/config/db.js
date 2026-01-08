import dotenv from 'dotenv';
import pkg from 'pg';

// Load env vars early
dotenv.config();

const { Pool } = pkg;

// Use a single pool for entire app
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') ? true : false,
});

// Simple helper to query with automatic client acquisition
export const query = async (text, params) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV !== 'production') {
    console.log('executed query', { text, duration, rows: res.rowCount });
  }
  return res;
};

// Initialize DB: health check and ensure required tables/indexes exist
export const initDb = async () => {
  // Connection health
  await query('SELECT 1');

  // For Neon, ensure we're using the public schema
  if (process.env.DATABASE_URL?.includes('neon.tech')) {
    await query('SET search_path TO public');
  }

  // Users table
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin','store_owner','user')),
      address TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  // Ensure address exists for existing databases
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;`);

  // Stores table
  await query(`
    CREATE TABLE IF NOT EXISTS stores (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      rating NUMERIC,
      address TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  // Ensure address exists for existing databases
  await query(`ALTER TABLE stores ADD COLUMN IF NOT EXISTS address TEXT;`);

  // Ratings table
  await query(`
    CREATE TABLE IF NOT EXISTS ratings (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, store_id)
    );
  `);
  
  // Useful indexes
  await query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_stores_owner ON stores(owner_id);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_ratings_store ON ratings(store_id);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_ratings_user ON ratings(user_id);`);
};
