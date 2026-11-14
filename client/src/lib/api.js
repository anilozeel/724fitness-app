import axios from 'axios';

// Tüm API istekleri /api önekiyle gider (dev'de Vite proxy, canlıda aynı sunucu)
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Her isteğe kayıtlı token'ı ekle
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
