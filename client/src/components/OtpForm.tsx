// client/src/pages/otp.tsx

import React, { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { routes } from "@/lib/routes/route";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const OtpForm: React.FC = () => {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const location = useLocation();
    const navigate = useNavigate();

    // ✅ get phone number from location state
    const phonenumber = (location.state as { phonenumber?: string } | null)?.phonenumber;

    const handleChange = (index: number, value: string) => {
        if (value.length > 1) return; // Only allow single digit

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const otpValue = otp.join("");
        if (otpValue.length !== 6) {
            return toast.error("Please enter the 6-digit OTP");
        }

        try {
            setIsSubmitting(true);

            if (!phonenumber) {
                toast.error("Missing phone number. Please start again.");
                return navigate("/signup");
            }

            // ✅ Send OTP & phone number to backend
            await axios.post(routes.auth.verifyOtpAndRegister, {
                phonenumber,
                otp: otpValue,
            });

            toast.success("Registration successful!");
            navigate("/login");
        } catch (error: unknown) {
            let message = "Invalid or expired OTP";
            if (axios.isAxiosError(error)) {
                const data = error.response?.data as { message?: string } | undefined;
                if (data?.message) message = data.message;
            }
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResend = () => {
        // TODO: call resend OTP API if available
        toast.info("Resending OTP...");
    };

    return (
        <div className="w-full max-w-md mx-auto p-6">
            <ToastContainer position="top-right" autoClose={5000} />

            {/* Branding */}
            <div className="mb-8 flex items-center space-x-3">
                <img src="/agility.jpg" alt="Logo" width={60} height={60} />
                <div>
                    <h1 className="font-bold text-lg">Agility AI Invoicely</h1>
                    {/* <p className="text-xs text-gray-500">Powered by AgilityAI</p> */}
                </div>
            </div>

            {/* Back to Signup */}
            <button
                className="flex items-center text-gray-600 mb-8 hover:text-gray-800"
                onClick={() => navigate("/signup")}
            >
                <ChevronLeft className="w-4 h-4 mr-1" />
                <span className="text-sm">Back to Sign up</span>
            </button>

            {/* Heading */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Enter verification code
            </h1>

            <p className="text-gray-600 text-sm mb-8 leading-relaxed">
                We’ve sent a 6-digit verification code to{" "}
                <span className="font-medium">+91 {phonenumber}</span>
            </p>

            {/* OTP Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="flex gap-3 justify-center">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => {
                                inputRefs.current[index] = el;
                            }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className="w-12 h-12 text-center text-lg font-medium border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                    ))}
                </div>

                <Button
                    type="submit"
                    disabled={isSubmitting || otp.some((digit) => !digit)}
                    className="w-full bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 h-12 text-base font-medium"
                >
                    {isSubmitting ? "Verifying..." : "Verify"}
                </Button>
            </form>

            {/* Resend OTP */}
            <div className="text-center mt-6">
                <span className="text-gray-500 text-sm">Didn't receive code? </span>
                <button
                    onClick={handleResend}
                    className="text-blue-600 text-sm hover:text-blue-800 font-medium"
                >
                    Resend
                </button>
            </div>
        </div>
    );
};

export default OtpForm;
