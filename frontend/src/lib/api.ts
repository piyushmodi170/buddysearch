import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { getApiBaseUrl } from './publicUrl';

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 8000,
});

api.interceptors.request.use(
  (config) => {
    if (!config.baseURL) {
      config.baseURL = getApiBaseUrl();
    }
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
    const isAuthAttempt = /\/auth\/(login|signup|google)/.test(url);
    if (error.response?.status === 401 && !isAuthAttempt) {
      console.warn('API authentication note:', url);
    }
    return Promise.reject(error);
  }
);

export default api;
