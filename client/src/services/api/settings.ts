import axios from 'axios';
import { SETTINGS_API } from '../routes/settings';

// Types
export interface User {
  _id: string;
  name: string;
  email: string;
  businessName: string;
  address: string;
  gst?: string;
  pan?: string;
  phone: string;
  website?: string;
  state: string;
  isGstRegistered?: boolean;
  businessLogo?: string;
  createdAt?: string;
  logoUrl : string;
  plan? : string;
  dateFormat : string;
}
export interface UserProfile {
  data : User;
}

export interface ProfileUpdate {
  name?: string;
  company?: string;
  address?: string;
  gst?: string;
  pan?: string;
  phone?: string;
  website?: string;
  state?: string;
  isGstRegistered?: boolean;
  businessLogo?: string;
}

export interface PasswordChange {
  currentPassword: string;
  newPassword: string;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  notifications: boolean;
  language: string;
  timezone: string;
  currency: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  invoiceReminders: boolean;
  paymentReminders: boolean;
  expenseAlerts: boolean;
}

/**
 * Get user profile
 */
export const getUserProfile = async (token: string): Promise<UserProfile> => {
  try {
    const response = await axios.get(SETTINGS_API.PROFILE, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (token: string, updates: ProfileUpdate): Promise<{ success: boolean }> => {
  try {
    const response = await axios.put(SETTINGS_API.UPDATE_PROFILE, updates, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Change user password
 */
export const changePassword = async (token: string, passwordData: PasswordChange): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.put(SETTINGS_API.CHANGE_PASSWORD, passwordData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

/**
 * Upload business logo
 */
export const uploadBusinessLogo = async (token: string, file: File): Promise<{ success: boolean; message: string; fileUrl: string }> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(SETTINGS_API.UPLOAD_LOGO, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading business logo:', error);
    throw error;
  }
};

/**
 * Get app settings
 */
export const getAppSettings = async (token: string): Promise<AppSettings> => {
  try {
    const response = await axios.get(SETTINGS_API.APP_SETTINGS, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching app settings:', error);
    // Return default settings if API doesn't exist
    return {
      theme: 'light',
      notifications: true,
      language: 'en',
      timezone: 'UTC',
      currency: 'INR',
    };
  }
};

/**
 * Update app settings
 */
export const updateAppSettings = async (token: string, settings: Partial<AppSettings>): Promise<{ success: boolean }> => {
  try {
    const response = await axios.put(SETTINGS_API.APP_SETTINGS, settings, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating app settings:', error);
    throw error;
  }
};

/**
 * Get notification settings
 */
export const getNotificationSettings = async (token: string): Promise<NotificationSettings> => {
  try {
    const response = await axios.get(SETTINGS_API.NOTIFICATION_SETTINGS, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    // Return default notification settings if API doesn't exist
    return {
      email: true,
      push: true,
      sms: false,
      invoiceReminders: true,
      paymentReminders: true,
      expenseAlerts: true,
    };
  }
};

/**
 * Update notification settings
 */
export const updateNotificationSettings = async (token: string, settings: Partial<NotificationSettings>): Promise<{ success: boolean }> => {
  try {
    const response = await axios.put(SETTINGS_API.NOTIFICATION_SETTINGS, settings, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating notification settings:', error);
    throw error;
  }
}; 