import { useEffect, useRef, useState, useCallback } from 'react';
import { authenticateWithGoogle } from '@/services/api/googleAuth';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import PasswordSetupModal from '@/components/Auth/PasswordSetupModal';
import { BASE_URL } from '@/lib/api-config';

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
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    const [authToken, setAuthToken] = useState<string>('');

    const handleCredentialResponse = useCallback(async (response: any) => {
        try {
            console.log('🔑 Google credential response received');

            // Authenticate with backend
            const authResponse = await authenticateWithGoogle(response.credential);

            if (authResponse.success) {
                const { user, token } = authResponse.data;

                // Store JWT token
                const isProduction = import.meta.env.VITE_NODE_ENV === 'production' || window.location.protocol === 'https:';

                Cookies.set('authToken', token, {
                    expires: 1, // 1 day
                    secure: isProduction,
                    sameSite: 'Strict',
                });

                // Also store in localStorage for consistency (as mentioned in requirements)
                localStorage.setItem('authToken', token);

                console.log('✅ Google authentication successful');
                console.log('👤 User data:', user);
                console.log('🔐 Has password:', user.hasPassword);

                // Check if user needs to set up password
                if (!user.hasPassword) {
                    console.log('🔓 User needs to set up password, opening modal...');
                    setUserData(user);
                    setAuthToken(token);
                    setShowPasswordModal(true);
                } else {
                    // Call success callback if provided
                    if (onSuccess) {
                        onSuccess(user);
                    }

                    // Navigate to dashboard
                    navigate("/app/dashboard");
                }
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
    }, [onSuccess, onError, navigate]);

    useEffect(() => {
        let isMounted = true;
        let checkGoogleInterval: NodeJS.Timeout | null = null;

        // Fetch Google Client ID from backend
        const fetchGoogleClientId = async (): Promise<string | null> => {
            try {
                console.log('📡 Fetching Google Client ID from backend...');
                const response = await fetch(`${BASE_URL}/api/auth/google-client-id`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch Google Client ID: ${response.status}`);
                }

                const data = await response.json();
                
                if (data.success && data.data?.clientId) {
                    console.log('✅ Google Client ID fetched successfully');
                    return data.data.clientId;
                } else {
                    throw new Error('Invalid response format from backend');
                }
            } catch (error) {
                console.error('❌ Error fetching Google Client ID:', error);
                if (onError) {
                    onError('Failed to load Google Sign-In. Please try again.');
                }
                return null;
            }
        };

        // Initialize Google Sign-In with client ID
        const initializeGoogleSignIn = async () => {
            if (!isMounted || !buttonRef.current) return;

            // First, fetch the client ID from backend
            const clientId = await fetchGoogleClientId();
            if (!clientId || !isMounted) return;

            // Wait for Google Identity Services to load
            const tryInitialize = () => {
                if (window.google && window.google.accounts && buttonRef.current && isMounted) {
                    try {
                        window.google.accounts.id.initialize({
                            client_id: clientId,
                            callback: handleCredentialResponse,
                        });

                        // Google button width must be a number in pixels, not percentage
                        // Calculate from parent container or use a reasonable default
                        let buttonWidth = 300; // default
                        
                        if (buttonRef.current?.parentElement) {
                            const parent = buttonRef.current.parentElement;
                            const computedStyle = window.getComputedStyle(parent);
                            const parentWidth = parent.clientWidth || 
                                                parseInt(computedStyle.width) || 
                                                parseInt(computedStyle.maxWidth);
                            
                            if (parentWidth && parentWidth > 0) {
                                buttonWidth = Math.max(parentWidth, 200); // Minimum 200px
                            }
                        }
                        
                        window.google.accounts.id.renderButton(buttonRef.current, {
                            theme: 'outline',
                            size: 'large',
                            width: buttonWidth,
                            text: 'signin_with',
                            shape: 'rectangular',
                        });
                        
                        console.log('✅ Google Sign-In button initialized');
                    } catch (error) {
                        console.error('❌ Error initializing Google Sign-In:', error);
                        if (onError) {
                            onError('Failed to initialize Google Sign-In button.');
                        }
                    }
                    return true;
                }
                return false;
            };

            // Check if Google is already loaded
            if (tryInitialize()) {
                return;
            }

            // Wait for Google to load
            checkGoogleInterval = setInterval(() => {
                if (tryInitialize() && checkGoogleInterval) {
                    clearInterval(checkGoogleInterval);
                    checkGoogleInterval = null;
                }
            }, 100);

            // Cleanup interval after 10 seconds
            setTimeout(() => {
                if (checkGoogleInterval) {
                    clearInterval(checkGoogleInterval);
                    checkGoogleInterval = null;
                }
                if (!window.google && isMounted) {
                    console.error('❌ Google Identity Services failed to load');
                    if (onError) {
                        onError('Google Sign-In service failed to load. Please refresh the page.');
                    }
                }
            }, 10000);
        };

        // Start initialization
        initializeGoogleSignIn();

        // Cleanup
        return () => {
            isMounted = false;
            if (checkGoogleInterval) {
                clearInterval(checkGoogleInterval);
            }
        };
    }, [handleCredentialResponse, onError]);

    const handlePasswordSetupComplete = () => {
        console.log('✅ Password setup completed');
        setShowPasswordModal(false);
        
        // Call success callback if provided
        if (onSuccess && userData) {
            onSuccess({ ...userData, hasPassword: true });
        }

        // Navigate to dashboard
        navigate("/app/dashboard");
    };

    return (
        <>
            <div className={`google-signin-button ${className}`}>
                <div ref={buttonRef}></div>
            </div>
            
            {showPasswordModal && userData && (
                <PasswordSetupModal
                    open={showPasswordModal}
                    onClose={() => setShowPasswordModal(false)}
                    onComplete={handlePasswordSetupComplete}
                    user={userData}
                    token={authToken}
                />
            )}
        </>
    );
}
