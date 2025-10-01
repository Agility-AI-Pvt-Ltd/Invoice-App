import api from '@/lib/api';
import axios from 'axios';
import Cookies from 'js-cookie';
import { SETTINGS_API } from '../routes/settings';
import { routes } from '@/lib/routes/route';
import { getApiBaseUrl } from '@/lib/api-config';

// Types
export interface User {
  _id: string;
  name: string;
  email: string;
  businessName: string;
  address: string;
  gst?: string;
  pan?: string;
  phone?: string;
  website?: string;
  state: string;
  isGstRegistered?: boolean;
  businessLogo?: string;
  profilePicture?: string;
  createdAt?: string;
  logoUrl: string;
  plan?: string;
  dateFormat: string;
  PhoneNumber?: string;
  currency?: string;
}
export interface UserProfile {
  data: User;
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
export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const response = await api.get(SETTINGS_API.PROFILE);
    // Backend shape: { success, message, data: { ...profile } }
    const envelope = response.data;
    const raw = envelope?.data ?? envelope;

    const normalizeUrl = (value?: string | null): string => {
      if (!value) return "";
      const trimmedValue = `${value}`.trim();
      if (!trimmedValue) return "";
      if (/^https?:\/\//i.test(trimmedValue)) return trimmedValue;
      // Remove leading slashes and ensure proper path format
      const noLead = trimmedValue.replace(/^\/+/, "");
      // Use API Gateway URL (localhost:4000) as specified by backend team
      return `${getApiBaseUrl()}/${noLead}`;
    };

    const normalized: User = {
      _id: raw?._id || raw?.id || "",
      name: raw?.name || raw?.fullName || "",
      email: raw?.email || "",
      businessName: raw?.businessName || raw?.company || "",
      address: raw?.address || "",
      gst: raw?.gst || raw?.gstNumber || "",
      pan: raw?.pan || raw?.panNumber || "",
      phone: raw?.phone || raw?.PhoneNumber || "",
      website: raw?.website || "",
      state: raw?.state || "",
      isGstRegistered: !!(raw?.isGstRegistered),
      businessLogo: raw?.businessLogo || raw?.logoUrl || "",
      profilePicture: normalizeUrl(raw?.profilePicture || ""),
      createdAt: raw?.createdAt || "",
      logoUrl: normalizeUrl(raw?.logoUrl || raw?.businessLogo || ""),
      plan: raw?.plan || "",
      dateFormat: raw?.dateFormat || "",
      PhoneNumber: raw?.PhoneNumber || raw?.phone || "",
      currency: raw?.currency || "",
    };

    return { data: normalized };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (updates: ProfileUpdate): Promise<{ success: boolean }> => {
  try {
    await api.post(SETTINGS_API.UPDATE_PROFILE, updates);
    return { success: true };
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Change user password
 */
export const changePassword = async (passwordData: PasswordChange): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.put(SETTINGS_API.CHANGE_PASSWORD, passwordData);
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

/**
 * Upload business logo
 */
export const uploadBusinessLogo = async (file: File): Promise<{ success: boolean; message: string; fileUrl?: string; logoUrl?: string }> => {
  // Get the auth token
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  // Upload business logo
  try {
    const formData = new FormData();
    formData.append('logo', file);
    console.log('🔼 Uploading business logo to:', SETTINGS_API.UPLOAD_LOGO);
    const response = await axios.post(SETTINGS_API.UPLOAD_LOGO, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 15000,
      withCredentials: false,
    });
    console.log('✅ Business logo upload response:', response.data);
    return response.data.data ?? response.data;
  } catch (error: any) {
    console.error('Error uploading business logo:', error);
    throw error;
  }
};

/**
 * Upload profile picture
 */
export const uploadProfilePicture = async (file: File): Promise<{ success: boolean; message: string; data: { fileUrl?: string; fileName?: string; profilePicture?: string } }> => {
  // Validate file size (5MB limit as per backend specs)
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size too large. Maximum allowed size is 5MB.');
  }

  // Validate file type (as per backend specs)
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, JPG, PNG, GIF, and WebP files are allowed.');
  }

  // Get the auth token
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const axiosConfig = {
    headers: {
      'Authorization': `Bearer ${token}`,
      // Do not set Content-Type; let axios set the boundary when sending FormData
    },
    timeout: 15000,
    // Avoid credentialed cross-origin requests; we send Bearer token explicitly
    withCredentials: false,
  } as const;

  // Use FormData with key 'profilePicture' (as specified by backend team)
  try {
    const formData = new FormData();
    formData.append('profilePicture', file);
    console.log('🔼 Uploading profile picture to:', SETTINGS_API.UPLOAD_PROFILE_PICTURE);
    const response = await axios.post(SETTINGS_API.UPLOAD_PROFILE_PICTURE, formData, axiosConfig);
    console.log('✅ Profile picture upload response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error uploading profile picture:', error);
    
    // Handle specific error codes as per backend specs
    if (error.response?.status === 401) {
      throw new Error('Authentication failed. Please login again.');
    } else if (error.response?.status === 400) {
      throw new Error(error.response?.data?.message || 'Invalid file or no file uploaded.');
    } else if (error.response?.status === 413) {
      throw new Error('File too large. Maximum allowed size is 5MB.');
    } else {
      throw new Error(error.response?.data?.message || 'Failed to upload profile picture. Please try again.');
    }
  }
};

/**
 * Get app settings
 */
export const getAppSettings = async (): Promise<AppSettings> => {
  try {
    const response = await api.get(SETTINGS_API.APP_SETTINGS);
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
export const updateAppSettings = async (settings: Partial<AppSettings>): Promise<{ success: boolean }> => {
  try {
    const response = await api.put(SETTINGS_API.APP_SETTINGS, settings);
    return response.data;
  } catch (error) {
    console.error('Error updating app settings:', error);
    throw error;
  }
};

/**
 * Get notification settings
 */
export const getNotificationSettings = async (): Promise<NotificationSettings> => {
  try {
    const response = await api.get(SETTINGS_API.NOTIFICATION_SETTINGS);
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
export const updateNotificationSettings = async (settings: Partial<NotificationSettings>): Promise<{ success: boolean }> => {
  try {
    const response = await api.put(SETTINGS_API.NOTIFICATION_SETTINGS, settings);
    return response.data;
  } catch (error) {
    console.error('Error updating notification settings:', error);
    throw error;
  }
};

/**
 * Fetch business logo
 */
export const fetchBusinessLogo = async (): Promise<string> => {
  try {
    console.log("🔍 Fetching business logo from:", routes.auth.getLogo);
    const response = await api.get(routes.auth.getLogo);
    // Backend returns { success, message, data: { logoUrl, hasLogo } }
    const logo = response.data?.data?.logoUrl as string | undefined;
    if (!logo) return "";
    // If it's already an absolute URL, return as-is; otherwise build API Gateway URL
    const isAbsolute = /^https?:\/\//i.test(logo);
    if (isAbsolute) return logo;
    // Remove leading slashes and use API Gateway URL (localhost:4000)
    const trimmed = logo.replace(/^\/+/, '');
    return `${getApiBaseUrl()}/${trimmed}`;
  } catch (error) {
    console.log("ℹ️ Logo endpoint not available (using default avatar) - this is normal if no logo is uploaded");
    return "";
  }
}; 