/**
 * Centralized Axios instance for the 11/38 Home API.
 *
 * - Base URL from EXPO_PUBLIC_API_URL
 * - Request interceptor: injects Bearer JWT from authStore
 * - Response interceptor: 401 → clears auth state
 *
 * The auth store is imported lazily (via a getter function) to avoid
 * circular dependency during module initialization.
 */
import axios from 'axios';
import Constants from 'expo-constants';

/**
 * Derives the API base URL automatically in development.
 * Expo exposes the Metro bundler host (e.g. "192.168.1.105:8081").
 * We extract just the IP and point it at port 5000 (our server).
 * In production, falls back to the EXPO_PUBLIC_API_URL env var.
 */
const getApiBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (__DEV__) {
    // hostUri is like "192.168.1.105:8081" — we just want the IP
    const hostUri =
      Constants.expoConfig?.hostUri ??
      Constants.manifest2?.extra?.expoClient?.hostUri ??
      Constants.manifest?.debuggerHost;

    if (hostUri) {
      const ip = hostUri.split(':')[0];
      return `http://${ip}:5000/api`;
    }
  }
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Lazily import store to avoid circular deps
let _getToken = null;
let _onUnauthorized = null;

export const configureApiAuth = (getToken, onUnauthorized) => {
  _getToken = getToken;
  _onUnauthorized = onUnauthorized;
};

// ─── Request Interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = _getToken?.();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      _onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);

export default api;
