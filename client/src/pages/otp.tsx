// client/src/pages/otp.tsx

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import { routes } from '@/lib/routes/route';

const OtpForm: React.FC = () => {
    const [otp, setOtp] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // ✅ rename state to match backend
    const phonenumber = (location.state as { phonenumber?: string } | null)?.phonenumber;

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!otp) {
            return toast.error('Please enter OTP');
        }

        try {
            setIsVerifying(true);

            if (!phonenumber) {
                toast.error('Missing phone number. Please start again.');
                return navigate('/signup');
            }

            // ✅ Send correct key name to backend
            await axios.post(routes.auth.verifyOtpAndRegister, {
                phonenumber,
                otp
            });

            toast.success('Registration successful!');
            navigate('/app/dashboard');

        } catch (error: unknown) {
            let message = 'Invalid or expired OTP';
            if (axios.isAxiosError(error)) {
                const data = error.response?.data as { message?: string } | undefined;
                if (data?.message) message = data.message;
            }
            toast.error(message);
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <form onSubmit={handleVerify} className="space-y-4 w-full">
            <ToastContainer position="top-right" autoClose={5000} />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Verify OTP</h2>
            <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="border p-2 rounded w-full"
            />
            <button
                type="submit"
                disabled={isVerifying}
                className="w-full bg-black text-white py-2 rounded"
            >
                {isVerifying ? 'Verifying...' : 'Verify OTP'}
            </button>
        </form>
    );
};

export default OtpForm;
