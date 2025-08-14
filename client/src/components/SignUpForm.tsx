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
// import { signup } from '@/services/api/auth';
// import Cookies from 'js-cookie';

interface SignUpFormData {
    fullName: string;
    businessEmail: string;
    phone: string;
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
        fullName: '',
        businessEmail: '',
        phone: '',
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
    const navigate = useNavigate();

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setForm((prevForm) => ({
            ...prevForm,
            [id]: value,
        }));
    };



    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (form.password !== form.confirmPassword) {
            return toast.error('Passwords do not match');
        }

        if (!form.fullName || !form.businessEmail || !form.phone || !form.password || !form.confirmPassword || !form.website) {
            return toast.error('Please fill in all required fields');
        }

        try {
            setIsSubmitting(true);

            // const payload = {
            //     name: form.fullName,
            //     email: form.businessEmail,
            //     phone: form.phone,
            //     password: form.password,
            //     website: form.website,
            // };

            // const res = await signup(payload);

            toast.success('Account created successfully! Please verify OTP.');

            // Navigate to OTP verification page
            navigate('/signup/verify/otp', {
                state: {
                    email: form.businessEmail, // or phone if OTP is via SMS
                    token: "res.token" // if your OTP API needs an auth token
                }
            });

        } catch (error: any) {
            const message =
                error?.response?.data?.error ||
                error?.response?.data?.msg ||
                'Something went wrong. Please try again.';
            toast.error(message);
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
                    <h1 className="font-bold text-lg">Invoice App</h1>
                    <p className="text-xs text-gray-500">Powered by AgilityAI</p>
                </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900">Sign up</h2>
            <p className="text-sm text-gray-500 mb-4">Your invoicing process is about to be effortless.</p>

            <FloatingInput
                id="fullName"
                label="Full Name"
                type="text"
                value={form.fullName}
                onChange={handleChange}
                isImportant
            />

            <FloatingInput
                id="phone"
                label="Phone Number"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                isImportant
            />

            <FloatingInput
                id="businessEmail"
                label="Business Email"
                type="email"
                value={form.businessEmail}
                onChange={handleChange}
                isImportant
            />

            <FloatingInput
                id="password"
                label="Password"
                type="password"
                value={form.password}
                onChange={handleChange}
                isImportant
            />

            <FloatingInput
                id="confirmPassword"
                label="Confirm Password"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                isImportant
            />

            <FloatingInput
                id="website"
                label="Website"
                type="text"
                value={form.website}
                onChange={handleChange}
                isImportant
            />

            <div className="flex items-start gap-2">
                <Checkbox label="I agree to all the Terms and Privacy Policies" id="checkbox" />
            </div>

            <Button type="submit" className="w-full mt-2 bg-black text-white hover:bg-slate-900" disabled={isSubmitting}>
                {isSubmitting ? 'Creating account...' : 'Create account'}
            </Button>

            <p className="text-sm text-center mt-2">
                Already have an account? <a href="/login" className="text-blue-600 underline">Login</a>
            </p>

            <div className="flex justify-center gap-4 mt-4">
                <SocialButton icon={<BsGoogle />} label="Sign up with Google" />
                <SocialButton icon={<AiFillApple />} label="Sign up with Apple" />
                <SocialButton icon={<AiFillFacebook />} label="Sign up with Facebook" />
            </div>
        </form>
    );
};

export default SignupForm;
