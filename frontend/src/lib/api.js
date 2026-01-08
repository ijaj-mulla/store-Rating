// API client with direct production backend URL
const BASE_URL = 'https://store-rating-skny.onrender.com/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export async function apiPost(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export async function apiGet(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || 'Request failed');
    err.status = res.status;
    throw err;
  }
  return data;
}

// Auth
export const loginApi = (email, password) => apiPost('/auth/login', { email, password });
export const signupApi = (name, email, password) => apiPost('/auth/register', { name, email, password });
export const changePasswordApi = (currentPassword, newPassword) => apiPost('/auth/change-password', { currentPassword, newPassword });

// Dashboards
export const getAdminDashboard = () => apiGet('/admin/dashboard');
export const getStoreDashboard = () => apiGet('/store/dashboard');
export const getUserDashboard = () => apiGet('/user/dashboard');
export const listAllStores = () => apiGet('/store/all');
export const getMyStores = () => apiGet('/store/my-stores'); // Fixed: use correct endpoint for owner's stores

// Ratings
export const submitRating = (storeId, rating) => apiPost('/ratings', { storeId, rating });
export const getUserRating = (storeId) => apiGet(`/ratings/my/${storeId}`);
export const getStoreRatingStats = (storeId) => apiGet(`/ratings/store/${storeId}/stats`);
export const getStoreRatingsWithUserNames = (storeId) => apiGet(`/store/my-stores/${storeId}/ratings`); // Fixed: use correct endpoint for store owners

// Admin actions
export const adminCreateUser = (payload) => apiPost('/admin/users', payload);
export const adminCreateStore = (payload) => apiPost('/admin/stores', payload);
export const adminListUsers = () => apiGet('/admin/users');
export const adminListStores = () => apiGet('/admin/stores');
