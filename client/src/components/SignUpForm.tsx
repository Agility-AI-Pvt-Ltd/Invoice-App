import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import type { ChangeEvent, FormEvent } from 'react';
import FloatingInput from '@/components/ui/FloatingInput';
import Checkbox from './ui/custom-checkbox';
import SocialButton from './ui/SocialButtons';
import { Button } from '@/components/ui/button';
import { AiFillApple, AiFillFacebook } from 'react-icons/ai';
import axios from 'axios';
import { routes } from '@/lib/routes/route';

interface SignUpFormData {
    name: string;
    businessEmail: string;   // ✅ Added business email
    email: string;
    phonenumber: string;
    password: string;
    confirmPassword: string;
    businessName: string;
    address: string;
    website: string;
    pan: string;
    gstStatus: string;
    gstNumber: string;
    logo: File | null;
}

const SignupForm: React.FC = () => {
    const [form, setForm] = useState<SignUpFormData>({
        name: '',
        businessEmail: '',
        email: '',
        phonenumber: '',
        password: '',
        confirmPassword: '',
        businessName: '',
        address: '',
        website: '',
        pan: '',
        gstStatus: '',
        gstNumber: '',
        logo: null,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const navigate = useNavigate();

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setForm((prevForm) => ({
            ...prevForm,
            [id]: value,
        }));

        setErrors((prevErrors) => {
            const { [id]: removed, ...rest } = prevErrors;
            return rest;
        });
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};

        if (!isChecked) {
            newErrors.checkbox = "You must agree to the Terms and Privacy Policies";
        }

        if (form.password !== form.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        if (!form.name) newErrors.name = "Name is required";
        if (!form.businessEmail) newErrors.businessEmail = "Business email is required"; // ✅ validation
        if (!form.phonenumber) {
            newErrors.phonenumber = "Phone number is required";
        } else {
            // ✅ Phone number: allow +91 / 91, then 10 digits
            const phoneRegex = /^(?:\+91|91)?\d{10}$/;
            if (!phoneRegex.test(form.phonenumber)) {
                newErrors.phonenumber = "Enter a valid 10-digit phone number (with or without +91)";
            }
        }
        if (!form.password) {
            newErrors.password = "Password is required";
        } else {
            // ✅ Password validation: at least 8 chars, 1 special char, 1 number
            const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;
            if (!passwordRegex.test(form.password)) {
                newErrors.password =
                    "Password must be at least 8 characters long, contain 1 number and 1 special character";
            }
        }
        if (!form.confirmPassword) newErrors.confirmPassword = "Confirm your password";
        // if (!form.website) newErrors.website = "Website is required";

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        try {
            setIsSubmitting(true);
            const payload = {
                name: form.name,
                email: form.businessEmail, // ✅ send in payload
                phonenumber: form.phonenumber,
                password: form.password,
                website: form.website,
            };

            await axios.post(routes.auth.sendOtpRegister, payload);

            toast.success("OTP sent successfully! Please verify.");

            navigate("/signup/verify/otp", {
                state: { phonenumber: form.phonenumber },
            });
        } catch (error: unknown) {
            let message = "Something went wrong. Please try again.";
            // console.log("Hi",error.response.data.detail)
            if (axios.isAxiosError(error)) {
                const data = error.response?.data as { detail?: string };
                if (data?.detail) message = data.detail;
            }
            setErrors({ general: message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form className="space-y-4 w-full" onSubmit={handleSubmit}>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar closeOnClick pauseOnHover draggable pauseOnFocusLoss theme="light" />
            <div className="mb-8 flex items-center space-x-3">
                <img src="/agility.jpg" alt="Logo" width={60} height={60} />
                <div>
                    <h1 className="font-bold text-lg">Agility AI Invoicely</h1>
                    {/* <p className="text-xs text-gray-500">Powered by AgilityAI</p> */}
                </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900">Sign up</h2>
            <p className="text-sm text-gray-500 mb-4">Your invoicing process is about to be effortless.</p>

            {/* Name */}
            <FloatingInput
                id="name"
                label="Name"
                type="text"
                value={form.name}
                onChange={handleChange}
                isImportant
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}

            {/* Business Email */}
            <FloatingInput
                id="businessEmail"
                label="Business Email"
                type="email"
                value={form.businessEmail}
                onChange={handleChange}
                isImportant
            />
            {errors.businessEmail && <p className="text-red-500 text-xs mt-1">{errors.businessEmail}</p>}

            {/* Phone */}
            <FloatingInput
                id="phonenumber"
                label="Phone Number"
                type="tel"
                value={form.phonenumber}
                onChange={handleChange}
                isImportant
            />
            {errors.phonenumber && <p className="text-red-500 text-xs mt-1">{errors.phonenumber}</p>}

            {/* Password */}
            <FloatingInput
                id="password"
                label="Password"
                type="password"
                value={form.password}
                onChange={handleChange}
                isImportant
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}

            {/* Confirm Password */}
            <FloatingInput
                id="confirmPassword"
                label="Confirm Password"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                isImportant
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}

            {/* Website */}
            <FloatingInput
                id="website"
                label="Website"
                type="text"
                value={form.website}
                onChange={handleChange}
                isImportant
            />
            {errors.website && <p className="text-red-500 text-xs mt-1">{errors.website}</p>}

            {/* Checkbox */}
            <div className="flex items-start gap-2">
                <Checkbox
                    label="I agree to all the Terms and Privacy Policies"
                    id="checkbox"
                    checked={isChecked}
                    onChange={(e) => setIsChecked(e.target.checked)}
                />
            </div>
            {errors.checkbox && <p className="text-red-500 text-xs mt-1">{errors.checkbox}</p>}

            {/* General API error */}
            {errors.general && <p className="text-red-500 text-sm text-center mt-2">{errors.general}</p>}

            {/* Submit */}
            <Button
                type="submit"
                className="w-full mt-2 bg-black text-white hover:bg-slate-900 cursor-pointer"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Verifying Details...' : 'Create account'}
            </Button>

            <p className="text-sm text-center mt-2">
                Already have an account? <a href="/login" className="text-blue-600 underline">Login</a>
            </p>

            {/* Social Logins */}
            <div className="flex justify-center gap-4 mt-4">
                <SocialButton icon={<AiFillFacebook size={18} className="text-[#1877F2]" />} label="Sign up with Facebook" />
                <SocialButton icon={<GoogleLogo />} label="Sign up with Google" />
                <SocialButton icon={<AiFillApple size={18} className="text-black" />} label="Sign up with Apple" />
            </div>
        </form>
    );
};

const GoogleLogo = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);
export default SignupForm;
