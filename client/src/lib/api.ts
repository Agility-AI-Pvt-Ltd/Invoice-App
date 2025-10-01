// client/src/lib/api.ts
import axios from "axios";
import Cookies from "js-cookie";
import { getApiBaseUrl } from "./api-config";

// Use shared API configuration
const API_BASE = getApiBaseUrl();

console.log(`🔧 Axios API client created with baseURL: ${API_BASE}`);

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
  console.log("🔑 Auth Token Check:", { 
    hasToken: !!token, 
    tokenPreview: token ? `${token.substring(0, 20)}...` : 'none',
    url: config.url 
  });
  
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
    console.log("✅ Authorization header added");
  } else {
    console.warn("⚠️ No auth token found - request may fail");
  }
  
  // Handle FormData requests - remove Content-Type to let axios set it with boundary
  if (config.data instanceof FormData) {
    console.log("📁 FormData detected - removing Content-Type header");
    delete config.headers['Content-Type'];
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
    console.log("✅ API Response Success:", {
      url: response.config?.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error("❌ API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 429) {
      console.warn("Rate limit exceeded, retrying after delay...");
    }
    
    if (error.response?.status === 404) {
      console.warn("Endpoint not found:", error.config?.url);
    }
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      const token = Cookies.get("authToken");
      console.warn("Authentication failed:", {
        status: error.response.status,
        url: error.config?.url,
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'none',
        errorMessage: error.response?.data?.error || error.response?.data?.message
      });
    }
    
    if (error.response?.status === 500) {
      console.error("Server error:", {
        url: error.config?.url,
        error: error.response?.data
      });
    }
    
    return Promise.reject(error);
  }
);

export default api;
