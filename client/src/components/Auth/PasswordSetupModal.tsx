import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/use-toast';
import {
    addPhone,
    verifyPhoneOtp,
    requestSetPasswordPhone,
    verifySetPasswordPhone,
} from '@/services/api/passwordSetup';

type Step = 'addPhone' | 'verifyPhone' | 'createPassword' | 'verifyPasswordOtp';

interface PasswordSetupModalProps {
    open: boolean;
    onClose: () => void;
    onComplete: () => void;
    user: {
        id: number | string;
        email: string;
        phoneNumber: string | null;
        hasPassword: boolean;
        isPhoneVerified: boolean;
    };
    token: string;
}

export default function PasswordSetupModal({
    open,
    onClose,
    onComplete,
    user,
    token,
}: PasswordSetupModalProps) {
    const { toast } = useToast();
    const [step, setStep] = useState<Step>('addPhone');
    const [loading, setLoading] = useState(false);

    // Form fields
    const [phone, setPhone] = useState(user.phoneNumber || '');
    const [otp, setOtp] = useState('');
    const [passwordOtp, setPasswordOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Error states
    const [phoneError, setPhoneError] = useState('');
    const [otpError, setOtpError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordOtpError, setPasswordOtpError] = useState('');

    // Initialize step based on user state
    useEffect(() => {
        if (!user.phoneNumber) {
            setStep('addPhone');
        } else if (!user.isPhoneVerified) {
            setStep('verifyPhone');
        } else {
            setStep('createPassword');
        }
        setPhone(user.phoneNumber || '');
    }, [user]);

    // Validation functions
    const validatePhone = (phoneNumber: string): boolean => {
        // Must start with +91 and have 10 digits after
        const phoneRegex = /^\+91[6-9]\d{9}$/;
        if (!phoneRegex.test(phoneNumber)) {
            setPhoneError('Invalid phone number format. Must start with +91 and have 10 digits');
            return false;
        }
        setPhoneError('');
        return true;
    };

    const validateOtp = (otpValue: string): boolean => {
        // Must be exactly 6 digits
        const otpRegex = /^\d{6}$/;
        if (!otpRegex.test(otpValue)) {
            setOtpError('OTP must be 6 digits');
            return false;
        }
        setOtpError('');
        return true;
    };

    const validatePassword = (password: string): boolean => {
        // Min 8 chars, at least 1 number, 1 symbol
        const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
        if (!passwordRegex.test(password)) {
            setPasswordError('Password must be at least 8 characters with 1 number and 1 symbol');
            return false;
        }
        setPasswordError('');
        return true;
    };

    // Step 1: Add Phone
    const handleAddPhone = async () => {
        if (!validatePhone(phone)) {
            return;
        }

        setLoading(true);
        try {
            const response = await addPhone(phone, token);
            
            if (response.success) {
                // Log OTP mock in development
                if (response.otpMock && import.meta.env.DEV) {
                    console.log('🔑 OTP Mock (Development):', response.otpMock);
                    toast({
                        title: 'OTP Sent',
                        description: `OTP sent successfully! (Dev OTP: ${response.otpMock})`,
                    });
                } else {
                    toast({
                        title: 'OTP Sent',
                        description: response.message || 'OTP sent successfully to verify your phone number',
                    });
                }
                setStep('verifyPhone');
            }
        } catch (error: any) {
            console.error('Add phone error:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to add phone number',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify Phone OTP
    const handleVerifyPhoneOtp = async () => {
        if (!validateOtp(otp)) {
            return;
        }

        setLoading(true);
        try {
            const response = await verifyPhoneOtp(phone, otp, token);
            
            if (response.success) {
                toast({
                    title: 'Success',
                    description: response.message || 'Phone number verified successfully',
                });
                setStep('createPassword');
                setOtp('');
            }
        } catch (error: any) {
            console.error('Verify phone OTP error:', error);
            setOtpError(error.message || 'Invalid OTP');
            toast({
                title: 'Error',
                description: error.message || 'Invalid OTP',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Create Password (Request OTP first, then verify and set)
    const handleRequestPasswordOtp = async () => {
        if (!validatePassword(newPassword)) {
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const response = await requestSetPasswordPhone(phone);
            
            if (response.success) {
                // Log OTP mock in development
                if (response.otpMock && import.meta.env.DEV) {
                    console.log('🔑 Password OTP Mock (Development):', response.otpMock);
                    toast({
                        title: 'OTP Sent',
                        description: `OTP sent for password creation! (Dev OTP: ${response.otpMock})`,
                    });
                } else {
                    toast({
                        title: 'OTP Sent',
                        description: response.message || 'OTP sent successfully to your phone number for password creation',
                    });
                }
                setStep('verifyPasswordOtp');
            }
        } catch (error: any) {
            console.error('Request password OTP error:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to request OTP for password creation',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    // Step 4: Verify Password OTP and Set Password
    const handleSetPassword = async () => {
        if (!validateOtp(passwordOtp)) {
            setPasswordOtpError('OTP must be 6 digits');
            return;
        }

        setLoading(true);
        try {
            const response = await verifySetPasswordPhone(phone, passwordOtp, newPassword);
            
            if (response.success) {
                toast({
                    title: 'Success',
                    description: response.message || 'Password created successfully',
                });
                onComplete();
                onClose();
                // Reset form
                setPhone('');
                setOtp('');
                setPasswordOtp('');
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (error: any) {
            console.error('Set password error:', error);
            setPasswordOtpError(error.message || 'Invalid OTP or password creation failed');
            toast({
                title: 'Error',
                description: error.message || 'Error creating password',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {step === 'addPhone' && 'Add Phone Number'}
                        {step === 'verifyPhone' && 'Verify Phone Number'}
                        {step === 'createPassword' && 'Create Password'}
                        {step === 'verifyPasswordOtp' && 'Verify OTP & Set Password'}
                    </DialogTitle>
                    <DialogDescription>
                        {step === 'addPhone' && 'Please add your phone number to continue'}
                        {step === 'verifyPhone' && `Enter the OTP sent to ${phone}`}
                        {step === 'createPassword' && 'Create a secure password for your account'}
                        {step === 'verifyPasswordOtp' && 'Enter the OTP sent to your phone to complete password setup'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Step 1: Add Phone */}
                    {step === 'addPhone' && (
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="phone" className="text-sm font-medium">
                                    Phone Number
                                </label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="+919876543210"
                                    value={phone}
                                    onChange={(e) => {
                                        setPhone(e.target.value);
                                        setPhoneError('');
                                    }}
                                    disabled={loading}
                                    className={phoneError ? 'border-destructive' : ''}
                                />
                                {phoneError && (
                                    <p className="text-sm text-destructive mt-1">{phoneError}</p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                    Format: +91 followed by 10 digits
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Verify Phone OTP */}
                    {step === 'verifyPhone' && (
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="otp" className="text-sm font-medium">
                                    Enter OTP
                                </label>
                                <Input
                                    id="otp"
                                    type="text"
                                    placeholder="123456"
                                    value={otp}
                                    onChange={(e) => {
                                        setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                                        setOtpError('');
                                    }}
                                    disabled={loading}
                                    maxLength={6}
                                    className={otpError ? 'border-destructive' : ''}
                                />
                                {otpError && (
                                    <p className="text-sm text-destructive mt-1">{otpError}</p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                    Enter the 6-digit OTP sent to {phone}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Create Password */}
                    {step === 'createPassword' && (
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="newPassword" className="text-sm font-medium">
                                    New Password
                                </label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    placeholder="Enter password"
                                    value={newPassword}
                                    onChange={(e) => {
                                        setNewPassword(e.target.value);
                                        setPasswordError('');
                                    }}
                                    disabled={loading}
                                    className={passwordError ? 'border-destructive' : ''}
                                />
                                {passwordError && (
                                    <p className="text-sm text-destructive mt-1">{passwordError}</p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                    Min 8 characters, at least 1 number and 1 symbol
                                </p>
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="text-sm font-medium">
                                    Confirm Password
                                </label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Confirm password"
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        setPasswordError('');
                                    }}
                                    disabled={loading}
                                    className={passwordError ? 'border-destructive' : ''}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 4: Verify Password OTP */}
                    {step === 'verifyPasswordOtp' && (
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="passwordOtp" className="text-sm font-medium">
                                    Enter OTP
                                </label>
                                <Input
                                    id="passwordOtp"
                                    type="text"
                                    placeholder="123456"
                                    value={passwordOtp}
                                    onChange={(e) => {
                                        setPasswordOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                                        setPasswordOtpError('');
                                    }}
                                    disabled={loading}
                                    maxLength={6}
                                    className={passwordOtpError ? 'border-destructive' : ''}
                                />
                                {passwordOtpError && (
                                    <p className="text-sm text-destructive mt-1">
                                        {passwordOtpError}
                                    </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                    Enter the 6-digit OTP sent to {phone}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    {step !== 'addPhone' && step !== 'createPassword' && (
                        <Button
                            variant="outline"
                            onClick={() => {
                                if (step === 'verifyPhone') {
                                    setStep('addPhone');
                                    setOtp('');
                                    setOtpError('');
                                } else if (step === 'verifyPasswordOtp') {
                                    setStep('createPassword');
                                    setPasswordOtp('');
                                    setPasswordOtpError('');
                                }
                            }}
                            disabled={loading}
                        >
                            Back
                        </Button>
                    )}
                    <Button
                        onClick={() => {
                            if (step === 'addPhone') {
                                handleAddPhone();
                            } else if (step === 'verifyPhone') {
                                handleVerifyPhoneOtp();
                            } else if (step === 'createPassword') {
                                handleRequestPasswordOtp();
                            } else if (step === 'verifyPasswordOtp') {
                                handleSetPassword();
                            }
                        }}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="animate-spin mr-2">⏳</span>
                                Processing...
                            </>
                        ) : step === 'addPhone' ? (
                            'Send OTP'
                        ) : step === 'verifyPhone' ? (
                            'Verify OTP'
                        ) : step === 'createPassword' ? (
                            'Request OTP'
                        ) : (
                            'Set Password'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


