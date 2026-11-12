/**
 * Centralized Axios instance for the 11/38 Home Mobile App.
 *
 * Configured for seamless public read access to dorm data without requiring
 * user login or JWT tokens.
 */
import axios from 'axios';
import Constants from 'expo-constants';

/**
 * Derives the API base URL automatically in development.
 * Expo exposes the Metro bundler host (e.g. "192.168.1.105:8081").
 * In production or EAS builds, uses the EXPO_PUBLIC_API_URL env var.
 */
const getApiBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (__DEV__) {
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

export const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response Interceptor for graceful error handling
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
