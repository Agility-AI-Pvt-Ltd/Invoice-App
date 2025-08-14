// Base URL for API
export const BASE_URL = 'https://invoice-backend-604217703209.asia-south1.run.app';

// Base endpoints for Tax API
export const TAX_API = {
  METRICS: `${BASE_URL}/api/tax/metrics`, // Get tax metrics
  COLLECTED_TIMESERIES: `${BASE_URL}/api/tax/collected-timeseries`, // Get tax timeseries
  SUMMARY: `${BASE_URL}/api/tax/summary`, // Get tax summary
  SUMMARY_EXPORT: `${BASE_URL}/api/tax/summary/export`, // Export tax summary
}; 