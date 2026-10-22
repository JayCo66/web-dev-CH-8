import axios from 'axios';

const API_BASE = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to automatically add JWT token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

// Menu API
export const menuAPI = {
  getAll: () => api.get('/menu'),
  getById: (id) => api.get(`/menu/${id}`),
  create: (data) => api.post('/menu', data),
  delete: (id) => api.delete(`/menu/${id}`),
};

// Rating API
export const ratingAPI = {
  rate: (menuId, score) => api.post(`/rating/${menuId}`, { score }),
  getMyRatings: () => api.get('/rating/my'),
};

// User API (Admin only)
export const userAPI = {
  getAll: () => api.get('/users'),
  updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
};

export default api;
