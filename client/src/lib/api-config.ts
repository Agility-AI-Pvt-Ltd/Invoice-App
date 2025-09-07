// Shared API Configuration
// This file provides a centralized way to get the API base URL
// Used by all route files to avoid code duplication
// 
// Configuration:
// - Uses VITE_BACKEND_URL from .env file
// - Falls back to localhost:3000 for development
// - No hardcoded production URLs

/**
 * Get the API base URL based on environment variables
 * Uses VITE_BACKEND_URL from .env file - no hardcoded URLs
 */
export const getApiBaseUrl = (): string => {
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  // Log the base URL for debugging (only once)
  if (!window.__API_BASE_URL_LOGGED) {
    console.log(`🌐 API Base URL: ${baseUrl} (Mode: ${import.meta.env.MODE})`);
    window.__API_BASE_URL_LOGGED = true;
  }

  return baseUrl;
};

// Export the base URL for direct use
export const BASE_URL = getApiBaseUrl();

// Type declaration for the global flag
declare global {
  interface Window {
    __API_BASE_URL_LOGGED?: boolean;
  }
}
