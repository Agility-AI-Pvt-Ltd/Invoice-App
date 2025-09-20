import { useEffect, useRef } from 'react';
import { authenticateWithGoogle } from '@/services/api/googleAuth';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

interface GoogleSignInButtonProps {
    onSuccess?: (user: any) => void;
    onError?: (error: string) => void;
    className?: string;
}

// Declare global Google types
declare global {
    interface Window {
        google: {
            accounts: {
                id: {
                    initialize: (config: any) => void;
                    renderButton: (element: HTMLElement, config: any) => void;
                    prompt: () => void;
                };
            };
        };
    }
}

export default function GoogleSignInButton({
    onSuccess,
    onError,
    className = ""
}: GoogleSignInButtonProps) {
    const buttonRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Wait for Google Identity Services to load
        const initializeGoogleSignIn = () => {
            if (window.google && window.google.accounts && buttonRef.current) {
                window.google.accounts.id.initialize({
                    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id',
                    callback: handleCredentialResponse,
                });

                window.google.accounts.id.renderButton(buttonRef.current, {
                    theme: 'outline',
                    size: 'large',
                    width: '100%',
                    text: 'signin_with',
                    shape: 'rectangular',
                });
            }
        };

        // Check if Google is already loaded
        if (window.google) {
            initializeGoogleSignIn();
        } else {
            // Wait for Google to load
            const checkGoogle = setInterval(() => {
                if (window.google) {
                    clearInterval(checkGoogle);
                    initializeGoogleSignIn();
                }
            }, 100);

            // Cleanup interval after 10 seconds
            setTimeout(() => clearInterval(checkGoogle), 10000);
        }
    }, []);

    const handleCredentialResponse = async (response: any) => {
        try {
            console.log('🔑 Google credential response received');

            // Authenticate with backend
            const authResponse = await authenticateWithGoogle(response.credential);

            if (authResponse.success) {
                // Store JWT token
                const isProduction = import.meta.env.VITE_NODE_ENV === 'production' || window.location.protocol === 'https:';

                Cookies.set('authToken', authResponse.data.token, {
                    expires: 1, // 1 day
                    secure: isProduction,
                    sameSite: 'Strict',
                });

                console.log('✅ Google authentication successful');

                // Call success callback if provided
                if (onSuccess) {
                    onSuccess(authResponse.data.user);
                }

                // Navigate to dashboard
                navigate("/app/dashboard");
            } else {
                throw new Error(authResponse.message || 'Authentication failed');
            }
        } catch (error: any) {
            console.error('❌ Google authentication error:', error);
            const errorMessage = error.message || 'Google authentication failed';

            if (onError) {
                onError(errorMessage);
            } else {
                alert(errorMessage);
            }
        }
    };

    return (
        <div className={`google-signin-button ${className}`}>
            <div ref={buttonRef}></div>
        </div>
    );
}
