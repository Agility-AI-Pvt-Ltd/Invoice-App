import api from '@/lib/api';
import { routes } from '@/lib/routes/route';

export const signup = async (data: any) => {
    try {
        const res = await api.post(routes.auth.sendOtpRegister, data);
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
        const res = await api.post(routes.auth.login, data);
        console.log(res)
        return res.data;
    } catch (err: any) {
        console.log(err.response.data)
        const message = err.response?.data?.detail || 'Login failed';
        throw { message };
    }
};

// Get user profile
export const getProfile = async () => {
    try {
        const res = await api.get(routes.auth.getProfile);
        return res.data;
    } catch (err: any) {
        const message = err.response?.data?.error || 'Failed to fetch profile';
        throw { message };
    }
};

// Update user profile
export const updateProfile = async (data: any) => {
    try {
        const res = await api.post(routes.auth.updateProfile, data);
        return res.data;
    } catch (err: any) {
        const message = err.response?.data?.error || 'Profile update failed';
        throw { message };
    }
};
