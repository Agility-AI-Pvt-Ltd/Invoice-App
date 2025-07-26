import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import type { ChangeEvent, FormEvent } from 'react';
import FloatingInput from '@/components/ui/FloatingInput';
import FloatingSelect from './ui/FloatingSelect';
import Checkbox from './ui/Checkbox';
import SocialButton from './ui/SocialButtons';
import { Button } from '@/components/ui/button';
import { UploadCloud } from 'lucide-react';
import { AiFillApple, AiFillFacebook } from 'react-icons/ai';
import { BsGoogle } from 'react-icons/bs';
import { signup } from '@/services/api/auth';

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

    const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setForm((prevForm) => ({
            ...prevForm,
            logo: file,
        }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (form.password !== form.confirmPassword) {
            return toast.error('Passwords do not match');
        }

        if (!form.fullName || !form.businessEmail || !form.phone || !form.password || !form.businessName || !form.address || !form.pan) {
            return toast.error('Please fill in all required fields');
        }

        try {
            setIsSubmitting(true);
            let logoBase64 = '';
            if (form.logo) {
                const reader = new FileReader();
                const logoData = await new Promise<string>((resolve, reject) => {
                    reader.onloadend = () => {
                        if (typeof reader.result === 'string') resolve(reader.result);
                        else reject('Failed to read file');
                    };
                    reader.onerror = reject;
                    //@ts-ignore
                    reader.readAsDataURL(form.logo); //convert to BLOB
                });
                logoBase64 = logoData;
            }

            const payload = {
                name: form.fullName,
                email: form.businessEmail,
                phone: form.phone,
                password: form.password,
                company: form.businessName,
                address: form.address,
                website: form.website,
                panNumber: form.pan,
                isGstRegistered: form.gstStatus === 'yes',
                gstNumber: form.gstStatus === 'yes' ? form.gstNumber : '',
                businessLogo: logoBase64,
            };

            await signup(payload);
            toast.success('Account created successfully!');
            navigate('/login');
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
        <form className="space-y-4" onSubmit={handleSubmit}>
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

            <FloatingInput id="fullName" label="Full Name" value={form.fullName} onChange={handleChange} isImportant />
            <FloatingInput id="businessEmail" label="Business Email" type="email" value={form.businessEmail} onChange={handleChange} isImportant />
            <FloatingInput id="phone" label="Phone Number" type="tel" value={form.phone} onChange={handleChange} isImportant />
            <FloatingInput id="address" label="Business Address" value={form.address} onChange={handleChange} isImportant />

            <div className="flex gap-4">
                <div className="w-1/2">
                    <FloatingInput id="password" label="Password" type="password" value={form.password} onChange={handleChange} isImportant />
                </div>
                <div className="w-1/2">
                    <FloatingInput id="confirmPassword" label="Confirm Password" type="password" value={form.confirmPassword} onChange={handleChange} isImportant />
                </div>
            </div>

            <FloatingInput id="businessName" label="Business Name" value={form.businessName} onChange={handleChange} isImportant />
            <FloatingInput id="website" label="Website" value={form.website} onChange={handleChange} />
            <FloatingInput id="pan" label="PAN Number" value={form.pan} onChange={handleChange} isImportant />

            <div className="flex gap-4">
                <div className="w-1/2">
                    <FloatingSelect
                        id="gstStatus"
                        label="Is your business GST registered?"
                        value={form.gstStatus}
                        onChange={handleChange}
                        options={[
                            { value: 'yes', label: 'Yes' },
                            { value: 'no', label: 'No' },
                        ]}
                    />
                </div>

                <div className="w-1/2">
                    <FloatingInput
                        id="gstNumber"
                        label="GST Number"
                        value={form.gstNumber}
                        onChange={handleChange}
                        isImportant
                        disabled={form.gstStatus !== 'yes'}
                    />
                </div>
            </div>

            <div>
                <label className="block mb-1 text-sm text-gray-600">Business Logo</label>
                <label htmlFor="logo-upload" className="flex items-center justify-center border border-dashed border-gray-400 rounded-md px-4 py-6 cursor-pointer text-gray-600 hover:border-gray-600">
                    <UploadCloud className="mr-2" />
                    {form.logo ? form.logo.name : 'Upload File'}
                    <input type="file" id="logo-upload" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
            </div>

            <div className="flex items-start gap-2">
                <Checkbox label="I agree to all the Terms and Privacy Policies" id="checkbox" />
            </div>

            <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
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
