import axios from 'axios';
import Cookies from 'js-cookie';
import { routes } from '@/lib/routes/route';

const config = {
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
};

export const signup = async (data: any) => {
    try {
        const res = await axios.post(routes.auth.signup, data, config);
        return res.data;
    } catch (err: any) {
        const message = err.response?.data?.error || 'Registration failed';
        const details = err.response?.data?.details;
        throw { message, details };
    }
};

// Login user
export const login = async (data: { email: string; password: string }) => {
    try {
        const res = await axios.post(routes.auth.login, data, config);
        return res.data;
    } catch (err: any) {
        const message = err.response?.data?.error || 'Login failed';
        throw { message };
    }
};

// Get user profile
export const getProfile = async () => {
    try {
        const token = Cookies.get('authToken');
        const res = await axios.get(routes.auth.getProfile, {
            ...config,
            headers: {
                ...config.headers,
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data;
    } catch (err: any) {
        const message = err.response?.data?.error || 'Failed to fetch profile';
        throw { message };
    }
};

// Update user profile
export const updateProfile = async (data: any) => {
    try {
        const token = Cookies.get('authToken');
        const res = await axios.post(routes.auth.updateProfile, data, {
            ...config,
            headers: {
                ...config.headers,
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data;
    } catch (err: any) {
        const message = err.response?.data?.error || 'Profile update failed';
        throw { message };
    }
};
