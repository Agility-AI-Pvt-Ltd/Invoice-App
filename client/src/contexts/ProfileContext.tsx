import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { getProfile } from "@/services/api/auth";
import Cookies from "js-cookie";

interface Profile {
    _id: string;
    name: string;
    email: string;
    company: string;
    address: string;
    phone: string;
    website?: string;
    panNumber: string;
    isGstRegistered: boolean;
    gstNumber?: string;
    businessLogo?: string;
}

interface ProfileContextType {
    profile: {
       data :  Profile | null;
    }
    loading: boolean;
    error: string | null;
    refreshProfile: () => Promise<void>;
    isAuthenticated: boolean;
    logout: () => void;
}

const ProfileContext = createContext<ProfileContextType>({
    //@ts-ignore
    profile: null,
    loading: true,
    error: null,
    refreshProfile: async () => {},
    isAuthenticated: false,
    logout: () => {},
});

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const fetchProfile = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const token = Cookies.get('authToken');
            
            if (!token) {
                setIsAuthenticated(false);
                setProfile(null);
                return;
            }

            const data = await getProfile();
            setProfile(data);
            setIsAuthenticated(true);
        } catch (err: any) {
            setError(err.message || "Error fetching profile");
            setIsAuthenticated(false);
            setProfile(null);
            // Clear invalid token
            Cookies.remove('authToken');
        } finally {
            setLoading(false);
        }
    }, []);

    const refreshProfile = useCallback(async () => {
        await fetchProfile();
    }, [fetchProfile]);

    const logout = useCallback(() => {
        Cookies.remove('authToken');
        setProfile(null);
        setIsAuthenticated(false);
        setError(null);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchProfile();
    }, []); // Only run once on mount

    return (
        <ProfileContext.Provider value={{ 
            //@ts-ignore
            profile, 
            loading, 
            error, 
            refreshProfile,
            isAuthenticated,
            logout
        }}>
            {children}
        </ProfileContext.Provider>
    );
};
