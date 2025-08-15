// Base URL for API
export const BASE_URL = 'https://invoice-backend-604217703209.asia-south1.run.app';

// Base endpoints for Settings API
export const SETTINGS_API = {
  PROFILE: `${BASE_URL}/api/profile`, // Get user profile
  UPDATE_PROFILE: `${BASE_URL}/api/profile`, // Update user profile
  CHANGE_PASSWORD: `${BASE_URL}/api/profile/password`, // Change password
  UPLOAD_LOGO: `${BASE_URL}/api/profile/upload`, // Upload business logo
  APP_SETTINGS: `${BASE_URL}/api/settings/app`, // App settings (not implemented)
  NOTIFICATION_SETTINGS: `${BASE_URL}/api/settings/notifications`, // Notification settings (not implemented)
}; 