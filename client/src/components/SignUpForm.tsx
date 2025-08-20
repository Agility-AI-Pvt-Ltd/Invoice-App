import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import type { ChangeEvent, FormEvent } from 'react';
import FloatingInput from '@/components/ui/FloatingInput';
import Checkbox from './ui/custom-checkbox';
import SocialButton from './ui/SocialButtons';
import { Button } from '@/components/ui/button';
import { AiFillApple, AiFillFacebook } from 'react-icons/ai';
import { BsGoogle } from 'react-icons/bs';
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
        businessEmail: '',   // ✅ init
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
        if (!form.phonenumber) newErrors.phonenumber = "Phone number is required";
        if (!form.password) newErrors.password = "Password is required";
        if (!form.confirmPassword) newErrors.confirmPassword = "Confirm your password";
        // if (!form.website) newErrors.website = "Website is required";

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        try {
            setIsSubmitting(true);
            const payload = {
                name: form.name,
                email: form.businessEmail, // ✅ send in payload
                phone: form.phonenumber,
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
            if (axios.isAxiosError(error)) {
                const data = error.response?.data as { message?: string };
                if (data?.message) message = data.message;
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
                    <h1 className="font-bold text-lg">Invoicely</h1>
                    <p className="text-xs text-gray-500">Powered by AgilityAI</p>
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
                <SocialButton icon={<BsGoogle />} label="Sign up with Google" />
                <SocialButton icon={<AiFillApple />} label="Sign up with Apple" />
                <SocialButton icon={<AiFillFacebook />} label="Sign up with Facebook" />
            </div>
        </form>
    );
};

export default SignupForm;
