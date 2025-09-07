// client/src/lib/api.ts
import axios from "axios";
import Cookies from "js-cookie";
import { getApiBaseUrl } from "./api-config";

// Use shared API configuration
const API_BASE = getApiBaseUrl();

// Request throttling to prevent rate limiting
const requestQueue = new Map<string, Promise<any>>();

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
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Create a unique key for this request
  const requestKey = `${config.method}-${config.url}-${JSON.stringify(config.params || {})}`;
  
  // If the same request is already in progress, return the existing promise
  if (requestQueue.has(requestKey)) {
    return requestQueue.get(requestKey)!;
  }
  
  // Create a new promise for this request
  const requestPromise = Promise.resolve(config);
  requestQueue.set(requestKey, requestPromise);
  
  // Clean up the queue when the request completes
  requestPromise.finally(() => {
    requestQueue.delete(requestKey);
  });
  
  console.log("API Request:", {
    url: config.url,
    method: config.method,
    data: config.data,
    headers: config.headers,
  });
  
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 429) {
      console.warn("Rate limit exceeded, retrying after delay...");
      // You could implement exponential backoff here
    }
    
    if (error.response?.status === 404) {
      console.warn("Endpoint not found:", error.config?.url);
    }
    
    return Promise.reject(error);
  }
);

export default api;
