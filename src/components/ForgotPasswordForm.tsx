import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import FloatingInput from './ui/FloatingInput';
import { BASE_URL } from '@/lib/api-config';
import axios from 'axios';

interface ForgotPasswordFormProps {
  setForgotPassword: (value: boolean) => void;
}

export default function ForgotPasswordForm({ setForgotPassword }: ForgotPasswordFormProps) {
  const [step, setStep] = useState(1); // 1: Phone input, 2: OTP + New password
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Format phone number input
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const phoneNumber = value.replace(/\D/g, '');

    // Add + if not present and format
    if (phoneNumber.length > 0 && !value.startsWith('+')) {
      return phoneNumber;
    }
    return value;
  };

  // Step 1: Send OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('🔄 Sending OTP request for phone:', phoneNumber);
      console.log('🌐 Using BASE_URL:', BASE_URL);
      console.log('🌐 Full URL being called:', `${BASE_URL}/api/auth/forgot-password`);

      const response = await axios.post(`${BASE_URL}/api/auth/forgot-password`, {
        phoneNumber
      });

      console.log('✅ OTP request response:', response.data);

      if (response.data.success) {
        setSuccess('OTP sent successfully! Check your phone.');
        setStep(2);
      } else {
        setError(response.data.message || 'Failed to send OTP');
      }
    } catch (error: unknown) {
      console.error('❌ OTP request error:', error);

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
        if (axiosError.response?.status === 404) {
          setError('Forgot password endpoint not found. Please contact support.');
        } else if (axiosError.response?.data?.message) {
          setError(axiosError.response.data.message);
        } else {
          setError('Network error. Please try again.');
        }
      } else if (error && typeof error === 'object' && 'message' in error) {
        setError((error as { message: string }).message);
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 Resetting password for phone:', phoneNumber);
      console.log('🌐 Using BASE_URL:', BASE_URL);
      console.log('🌐 Full URL being called:', `${BASE_URL}/api/auth/reset-password`);

      const response = await axios.post(`${BASE_URL}/api/auth/reset-password`, {
        phoneNumber,
        otp,
        newPassword,
        confirmPassword,
      });

      console.log('✅ Password reset response:', response.data);

      if (response.data.success) {
        setSuccess('Password reset successfully! Please login with your new password.');
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          setForgotPassword(false);
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to reset password');
      }
    } catch (error: unknown) {
      console.error('❌ Password reset error:', error);

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
        if (axiosError.response?.status === 404) {
          setError('Reset password endpoint not found. Please contact support.');
        } else if (axiosError.response?.data?.message) {
          setError(axiosError.response.data.message);
        } else {
          setError('Network error. Please try again.');
        }
      } else if (error && typeof error === 'object' && 'message' in error) {
        setError((error as { message: string }).message);
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <button
        className="flex items-center text-sm text-black hover:underline"
        onClick={() => {
          setStep(1);
          setError('');
          setSuccess('');
          setPhoneNumber('');
          setOtp('');
          setNewPassword('');
          setConfirmPassword('');
          setForgotPassword(false);
        }}
      >
        <ArrowLeft size={16} className="mr-1" />
        Back to login
      </button>

      <div>
        <h1 className="text-2xl font-semibold">
          {step === 1 ? 'Forgot your password?' : 'Reset your password'}
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          {step === 1
            ? "Don't worry, happens to all of us. Enter your phone number below to receive an OTP"
            : "Enter the OTP sent to your phone and create a new password"
          }
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
          {success}
        </div>
      )}

      {step === 1 ? (
        // Step 1: Phone Number Input
        <form onSubmit={handleSendOTP} className="space-y-4">
          <FloatingInput
            id="phoneNumber"
            label="Phone Number"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
            required
          />

          <button
            type="submit"
            disabled={loading || !phoneNumber}
            className="w-full bg-black text-white py-2 rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>
      ) : (
        // Step 2: OTP + New Password
        <form onSubmit={handleResetPassword} className="space-y-4">
          <FloatingInput
            id="phoneNumber"
            label="Phone Number"
            type="tel"
            value={phoneNumber}
            onChange={() => { }} // Dummy handler for disabled input
            disabled
          />

          <FloatingInput
            id="otp"
            label="Enter OTP"
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            required
          />

          <FloatingInput
            id="newPassword"
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <FloatingInput
            id="confirmPassword"
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading || !otp || !newPassword || !confirmPassword}
            className="w-full bg-black text-white py-2 rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>

          <button
            type="button"
            onClick={() => {
              setStep(1);
              setError('');
              setSuccess('');
              setOtp('');
              setNewPassword('');
              setConfirmPassword('');
            }}
            className="w-full bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300"
          >
            Back to Phone Number
          </button>
        </form>
      )}
    </div>
  );
}
