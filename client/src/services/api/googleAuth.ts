import { BASE_URL } from '@/lib/api-config';
import axios from 'axios';

export interface GoogleAuthResponse {
    success: boolean;
    message: string;
    data: {
        token: string;
        user: {
            id: number | string;
            email: string;
            phoneNumber: string | null;
            hasPassword: boolean;
            isPhoneVerified: boolean;
            authProviders: string[];
            name?: string;
            picture?: string;
        };
    };
}

export interface GoogleAuthRequest {
    token: string; // Google ID token
}

/**
 * Authenticate user with Google ID token
 * @param credential - Google ID token from Google Identity Services
 * @returns Promise with authentication response
 */
export const authenticateWithGoogle = async (credential: string): Promise<GoogleAuthResponse> => {
    try {
        console.log('🔄 Sending Google authentication request');
        console.log('🌐 Using BASE_URL:', BASE_URL);
        console.log('🌐 Full URL being called:', `${BASE_URL}/api/auth/google`);
        console.log('🔑 Sending token (credential):', credential.substring(0, 50) + '...');

        const response = await axios.post(`${BASE_URL}/api/auth/google`, {
            token: credential
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 10000, // 10 second timeout
        });

        console.log('✅ Google authentication response:', response.data);
        return response.data;
    } catch (error: unknown) {
        console.error('❌ Google authentication error:', error);

        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as {
                response?: {
                    status?: number;
                    data?: { message?: string };
                    statusText?: string;
                };
                message?: string;
            };

            console.error('🔍 Detailed error info:', {
                status: axiosError.response?.status,
                statusText: axiosError.response?.statusText,
                data: axiosError.response?.data,
                message: axiosError.message
            });

            if (axiosError.response?.status === 404) {
                throw new Error('Google authentication endpoint not found. Please check your backend configuration.');
            }

            if (axiosError.response?.data?.message) {
                throw new Error(axiosError.response.data.message);
            }
        }

        throw new Error('Google authentication failed. Please try again.');
    }
};
