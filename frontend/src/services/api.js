import axios from 'axios';

const API_URL ='http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('cityroute_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Attach session ID for guest users
  let sessionId = localStorage.getItem('cityroute_session');
  if (!sessionId) {
    sessionId = `guest_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('cityroute_session', sessionId);
  }
  config.headers['x-session-id'] = sessionId;

  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('cityroute_token');
      localStorage.removeItem('cityroute_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;

// ─── Auth ─────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// ─── Cities ───────────────────────────────────────────
export const citiesApi = {
  getAll: (params) => api.get('/cities', { params }),
  getById: (id) => api.get(`/cities/${id}`),
  create: (data) => api.post('/cities', data),
  update: (id, data) => api.put(`/cities/${id}`, data),
  delete: (id) => api.delete(`/cities/${id}`),
};

// ─── Locations ────────────────────────────────────────
export const locationsApi = {
  getAll: (params) => api.get('/locations', { params }),
  getById: (id) => api.get(`/locations/${id}`),
  create: (data) => api.post('/locations', data),
  update: (id, data) => api.put(`/locations/${id}`, data),
  delete: (id) => api.delete(`/locations/${id}`),
  autocomplete: (cityId, q) => api.get('/routes/autocomplete', { params: { cityId, q } }),
};

// ─── Routes ───────────────────────────────────────────
export const routesApi = {
  estimate: (data) => api.post('/routes/estimate', data),
  compare: (data) => api.post('/routes/compare', data),
};

// ─── Fares ────────────────────────────────────────────
export const faresApi = {
  getAll: (params) => api.get('/fares', { params }),
  getById: (id) => api.get(`/fares/${id}`),
  create: (data) => api.post('/fares', data),
  update: (id, data) => api.put(`/fares/${id}`, data),
  delete: (id) => api.delete(`/fares/${id}`),
};

// ─── History ──────────────────────────────────────────
export const historyApi = {
  getAll: (params) => api.get('/history', { params }),
  delete: (id) => api.delete(`/history/${id}`),
};

// ─── Profile ──────────────────────────────────────────
export const profileApi = {
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
  changePassword: (data) => api.put('/profile/password', data),
};

// ─── Admin ────────────────────────────────────────────
export const adminApi = {
  stats: () => api.get('/admin/stats'),
  users: (params) => api.get('/admin/users', { params }),
  toggleUser: (id) => api.put(`/admin/users/${id}/toggle`),
  auditLogs: () => api.get('/admin/audit-logs'),
  getRoutes: (params) => api.get('/admin/routes', { params }),
  createRoute: (data) => api.post('/admin/routes', data),
  updateRoute: (id, data) => api.put(`/admin/routes/${id}`, data),
  deleteRoute: (id) => api.delete(`/admin/routes/${id}`),
};