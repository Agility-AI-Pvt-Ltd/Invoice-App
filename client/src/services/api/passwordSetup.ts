import { BASE_URL } from '@/lib/api-config';
import axios from 'axios';

/**
 * Add phone number for user
 */
export interface AddPhoneRequest {
    phone: string;
}

export interface AddPhoneResponse {
    success: boolean;
    message: string;
    otpMock?: string; // Only in development
}

export const addPhone = async (phone: string, token: string): Promise<AddPhoneResponse> => {
    try {
        console.log('📱 Adding phone number:', phone);
        const response = await axios.post(
            `${BASE_URL}/api/auth/user/add-phone`,
            { phone },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                timeout: 10000,
            }
        );
        console.log('✅ Phone added, OTP sent:', response.data);
        return response.data;
    } catch (error: unknown) {
        console.error('❌ Add phone error:', error);
        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as {
                response?: {
                    status?: number;
                    data?: { message?: string };
                };
                message?: string;
            };
            if (axiosError.response?.data?.message) {
                throw new Error(axiosError.response.data.message);
            }
        }
        throw new Error('Failed to add phone number');
    }
};

/**
 * Verify phone OTP
 */
export interface VerifyPhoneOtpRequest {
    phone: string;
    otp: string;
}

export interface VerifyPhoneOtpResponse {
    success: boolean;
    message: string;
    data?: {
        user: {
            isPhoneVerified: boolean;
            phoneNumber: string;
        };
    };
}

export const verifyPhoneOtp = async (
    phone: string,
    otp: string,
    token: string
): Promise<VerifyPhoneOtpResponse> => {
    try {
        console.log('🔐 Verifying phone OTP');
        const response = await axios.post(
            `${BASE_URL}/api/auth/user/verify-phone-otp`,
            { phone, otp },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                timeout: 10000,
            }
        );
        console.log('✅ Phone OTP verified:', response.data);
        return response.data;
    } catch (error: unknown) {
        console.error('❌ Verify phone OTP error:', error);
        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as {
                response?: {
                    status?: number;
                    data?: { message?: string };
                };
                message?: string;
            };
            if (axiosError.response?.data?.message) {
                throw new Error(axiosError.response.data.message);
            }
        }
        throw new Error('Invalid OTP or verification failed');
    }
};

/**
 * Request OTP for password creation
 */
export interface RequestSetPasswordPhoneRequest {
    phone: string;
}

export interface RequestSetPasswordPhoneResponse {
    success: boolean;
    message: string;
    otpMock?: string; // Only in development
}

export const requestSetPasswordPhone = async (
    phone: string
): Promise<RequestSetPasswordPhoneResponse> => {
    try {
        console.log('📲 Requesting OTP for password creation');
        const response = await axios.post(
            `${BASE_URL}/api/auth/request-set-password-phone`,
            { phone },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 10000,
            }
        );
        console.log('✅ OTP requested for password creation:', response.data);
        return response.data;
    } catch (error: unknown) {
        console.error('❌ Request password OTP error:', error);
        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as {
                response?: {
                    status?: number;
                    data?: { message?: string };
                };
                message?: string;
            };
            if (axiosError.response?.data?.message) {
                throw new Error(axiosError.response.data.message);
            }
        }
        throw new Error('Failed to request OTP for password creation');
    }
};

/**
 * Verify OTP and set password
 */
export interface VerifySetPasswordPhoneRequest {
    phone: string;
    otp: string;
    newPassword: string;
}

export interface VerifySetPasswordPhoneResponse {
    success: boolean;
    message: string;
    data?: {
        user: {
            id: number | string;
            email: string;
            phoneNumber: string;
            hasPassword: boolean;
            authProviders: string[];
        };
    };
}

export const verifySetPasswordPhone = async (
    phone: string,
    otp: string,
    newPassword: string
): Promise<VerifySetPasswordPhoneResponse> => {
    try {
        console.log('🔑 Verifying OTP and setting password');
        const response = await axios.post(
            `${BASE_URL}/api/auth/verify-set-password-phone`,
            { phone, otp, newPassword },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 10000,
            }
        );
        console.log('✅ Password created successfully:', response.data);
        return response.data;
    } catch (error: unknown) {
        console.error('❌ Set password error:', error);
        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as {
                response?: {
                    status?: number;
                    data?: { message?: string };
                };
                message?: string;
            };
            if (axiosError.response?.data?.message) {
                throw new Error(axiosError.response.data.message);
            }
        }
        throw new Error('Failed to create password');
    }
};

