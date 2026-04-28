import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { getProfile } from "@/services/api/auth";
import Cookies from "js-cookie";

// Complete Profile interface matching backend /api/profile response (30+ fields)
interface Profile {
    // User Identity (4 fields)
    _id: string;
    name: string;
    firstName?: string;
    lastName?: string;
    email: string;
    
    // Business Info (7 fields)
    businessName?: string;
    address: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    phone: string;
    PhoneNumber?: string; // Backend also returns this
    website?: string;
    
    // Tax Registration (3 fields)
    gst?: string;
    pan?: string;
    panNumber?: string; // Legacy field
    gstNumber?: string; // Legacy field
    isGstRegistered: boolean;
    
    // Company Registration (2 fields)
    companyRegNumber?: string;
    cinNumber?: string;
    
    // Images (3 fields)
    businessLogo?: string;
    logoUrl?: string;
    profilePicture?: string;
    
    // Bank Details (5 fields)
    bankName?: string;
    bankAccountNumber?: string;
    bankIfscCode?: string;
    bankBranch?: string;
    upiId?: string;
    
    // Invoice Settings (5 fields)
    invoicePrefix?: string;
    invoiceStartNumber?: number;
    termsAndConditions?: string;
    defaultCurrency?: string;
    defaultPaymentTerms?: string;
    
    // App Settings (3 fields)
    plan?: string;
    dateFormat?: string;
    currency?: string;
    
    // Legacy support
    company?: string; // Alias for businessName
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

// Custom hook to use profile context
const useProfile = () => useContext(ProfileContext);

// Profile provider component
const ProfileProvider = ({ children }: { children: ReactNode }) => {
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

            try {
                const data = await getProfile();
                setProfile(data);
                setIsAuthenticated(true);
            } catch (profileError: any) {
                // Auth failure — token is invalid or expired, log out cleanly
                const status = profileError?.response?.status;
                if (status === 401 || status === 403) {
                    Cookies.remove('authToken');
                    localStorage.removeItem('authToken');
                    setIsAuthenticated(false);
                    setProfile(null);
                } else {
                    // Non-auth error (e.g. network) — keep session but surface the error
                    setError('Failed to load profile. Please refresh.');
                    setIsAuthenticated(true);
                }
            }
        } catch (err: any) {
            setError(err.message || 'Error fetching profile');
            setIsAuthenticated(false);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const refreshProfile = useCallback(async () => {
        await fetchProfile();
    }, [fetchProfile]);

    const logout = useCallback(() => {
        Cookies.remove('authToken');
        localStorage.removeItem('authToken');
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

// Export hook and provider separately to fix HMR issues
export { useProfile, ProfileProvider };
