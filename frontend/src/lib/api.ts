import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const rawBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const api = axios.create({
  // next.config may inject ".../api"; route calls already start with /api.
  baseURL: rawBase.replace(/\/api\/?$/, ''),
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
    if (error.response?.status === 401) {
      console.warn('API authentication note:', error.config?.url);
    }
    return Promise.reject(error);
  }
);

export default api;
