import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

/** NEXT_PUBLIC_API_URL is often set to http://host:4000/api while callers already prefix /api/... */
const resolveApiBaseUrl = () => {
  const raw = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  return raw.replace(/\/api\/?$/, '');
};

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = String(error.config?.url || '');
    const isAuthAttempt = /\/auth\/(login|signup|otp)/.test(url);
    if (error.response?.status === 401 && !isAuthAttempt) {
      console.warn('API authentication note:', url);
    }
    return Promise.reject(error);
  }
);

export default api;
