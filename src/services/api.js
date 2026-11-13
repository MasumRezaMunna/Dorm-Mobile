/**
 * Centralized Axios instance for the Dorm Solution Mobile App.
 *
 * Always targets the production Render backend.
 * EXPO_PUBLIC_API_URL is baked in by Metro at bundle time from .env
 * Hard-coded fallback guarantees dev mode also hits the live server.
 */
import axios from 'axios';

const PRODUCTION_URL = 'https://dorm-server.onrender.com/api';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || PRODUCTION_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor — graceful error logging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Network request failed. Please check your connection.';
    console.warn(`[API Error] ${error.config?.url}:`, message);
    return Promise.reject(error);
  }
);

export default api;
