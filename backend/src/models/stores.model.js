import { query } from '../config/db.js';

export const createStore = async ({ name, ownerId, address = null }) => {
  const result = await query(
    'INSERT INTO stores(name, owner_id, address) VALUES($1, $2, $3) RETURNING id, name, owner_id, address, created_at',
    [name, ownerId, address]
  );
  return result.rows[0];
};

export const getByOwner = async (ownerId) => {
  const result = await query(
    `SELECT s.id, s.name, s.address, s.created_at,
            COALESCE(stats.count, 0) AS rating_count,
            COALESCE(stats.average, 0) AS rating_average
     FROM stores s
     LEFT JOIN (
       SELECT store_id, COUNT(*)::int AS count, COALESCE(AVG(rating), 0) AS average
       FROM ratings
       GROUP BY store_id
     ) stats ON s.id = stats.store_id
     WHERE s.owner_id = $1
     ORDER BY s.created_at DESC`,
    [ownerId]
  );
  return result.rows;
};

export const countByOwner = async (ownerId) => {
  const result = await query('SELECT COUNT(*)::int AS count FROM stores WHERE owner_id = $1', [ownerId]);
  return result.rows[0].count;
};

export const countStores = async () => {
  const result = await query('SELECT COUNT(*)::int AS count FROM stores');
  return result.rows[0].count;
};

export const listStoresWithOwners = async () => {
  const result = await query(
    `SELECT s.id, s.name, s.address, s.created_at,
            u.id AS owner_id, u.name AS owner_name, u.email AS owner_email,
            COALESCE(stats.count, 0) AS rating_count,
            COALESCE(stats.average, 0) AS rating_average
     FROM stores s
     JOIN users u ON s.owner_id = u.id
     LEFT JOIN (
       SELECT store_id, COUNT(*)::int AS count, COALESCE(AVG(rating), 0) AS average
       FROM ratings
       GROUP BY store_id
     ) stats ON s.id = stats.store_id
     ORDER BY s.created_at DESC`
  );
  return result.rows;
};

export const listStoresWithUserRating = async (userId) => {
  const result = await query(
    `SELECT s.id, s.name, s.address, s.created_at,
            u.id AS owner_id, u.name AS owner_name, u.email AS owner_email,
            COALESCE(stats.count, 0) AS rating_count,
            COALESCE(stats.average, 0) AS rating_average,
            ur.rating AS user_rating
     FROM stores s
     JOIN users u ON s.owner_id = u.id
     LEFT JOIN (
       SELECT store_id, COUNT(*)::int AS count, COALESCE(AVG(rating), 0) AS average
       FROM ratings
       GROUP BY store_id
     ) stats ON s.id = stats.store_id
     LEFT JOIN ratings ur ON s.id = ur.store_id AND ur.user_id = $1
     ORDER BY s.created_at DESC`,
    [userId]
  );
  return result.rows;
};

export const topStores = async (limit = 5) => {
  const result = await query(
    `SELECT s.id, s.name, s.address, s.created_at,
            COALESCE(stats.count, 0) AS rating_count,
            COALESCE(stats.average, 0) AS rating_average
     FROM stores s
     LEFT JOIN (
       SELECT store_id, COUNT(*)::int AS count, COALESCE(AVG(rating), 0) AS average
       FROM ratings
       GROUP BY store_id
     ) stats ON s.id = stats.store_id
     ORDER BY stats.average DESC NULLS LAST, s.created_at DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
};

export const getStoreWithRatingsForOwner = async (ownerId, storeId) => {
  const result = await query(
    `SELECT s.id, s.name, s.address, s.created_at,
            COALESCE(stats.count, 0) AS rating_count,
            COALESCE(stats.average, 0) AS rating_average
     FROM stores s
     LEFT JOIN (
       SELECT store_id, COUNT(*)::int AS count, COALESCE(AVG(rating), 0) AS average
       FROM ratings
       GROUP BY store_id
     ) stats ON s.id = stats.store_id
     WHERE s.owner_id = $1 AND s.id = $2`,
    [ownerId, storeId]
  );
  return result.rows[0] || null;
};
