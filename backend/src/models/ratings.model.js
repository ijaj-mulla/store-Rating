import { query } from '../config/db.js';

export const upsertRating = async ({ userId, storeId, rating }) => {
  const result = await query(
    `INSERT INTO ratings(user_id, store_id, rating, updated_at)
     VALUES($1, $2, $3, NOW())
     ON CONFLICT (user_id, store_id)
     DO UPDATE SET rating = EXCLUDED.rating, updated_at = NOW()
     RETURNING id, user_id, store_id, rating, created_at, updated_at`,
    [userId, storeId, rating]
  );
  return result.rows[0];
};

export const getUserRatingForStore = async (userId, storeId) => {
  const result = await query(
    'SELECT id, user_id, store_id, rating, created_at, updated_at FROM ratings WHERE user_id = $1 AND store_id = $2',
    [userId, storeId]
  );
  return result.rows[0] || null;
};

export const getRatingsByStore = async (storeId) => {
  const result = await query(
    'SELECT rating, created_at FROM ratings WHERE store_id = $1 ORDER BY created_at DESC',
    [storeId]
  );
  return result.rows;
};

export const getAverageRatingForStore = async (storeId) => {
  const result = await query(
    'SELECT COUNT(*)::int AS count, COALESCE(AVG(rating), 0) AS avg FROM ratings WHERE store_id = $1',
    [storeId]
  );
  const row = result.rows[0];
  return { count: row.count, average: Number(row.avg) };
};

export const getRatingsWithUserNamesForStore = async (storeId) => {
  const result = await query(
    `SELECT r.id, r.rating, r.created_at, u.name AS user_name
     FROM ratings r
     JOIN users u ON r.user_id = u.id
     WHERE r.store_id = $1
     ORDER BY r.created_at DESC`,
    [storeId]
  );
  return result.rows;
};
