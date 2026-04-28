// client/src/lib/api.ts
import axios from "axios";
import Cookies from "js-cookie";
import { getApiBaseUrl } from "./api-config";

// Check if JWT token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1]));
    if (typeof payload.exp !== 'number') return false; // No expiry = non-expiring token
    return payload.exp < Date.now() / 1000;
  } catch {
    return true;
  }
};

const API_BASE = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 10000, // 10 second timeout
});

// Request interceptor for authentication and throttling
api.interceptors.request.use((config) => {
  const token = Cookies.get("authToken");

  if (token) {
    if (isTokenExpired(token)) {
      Cookies.remove("authToken");
      localStorage.removeItem("authToken");
      window.location.href = '/login';
      return Promise.reject(new Error('Token expired'));
    }

    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      const token = Cookies.get("authToken");
      if (token && isTokenExpired(token)) {
        Cookies.remove("authToken");
        localStorage.removeItem("authToken");
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
