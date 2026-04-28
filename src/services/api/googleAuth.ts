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
        const response = await axios.post(`${BASE_URL}/api/auth/google`, {
            token: credential
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000,
        });

        return response.data;
    } catch (error: unknown) {
        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as {
                response?: { status?: number; data?: { message?: string } };
                message?: string;
            };

            if (axiosError.response?.data?.message) {
                throw new Error(axiosError.response.data.message);
            }
        }

        throw new Error('Google authentication failed. Please try again.');
    }
};
