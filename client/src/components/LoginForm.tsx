import { useState } from 'react';
import FloatingInput from './ui/FloatingInput';
import Checkbox from '@/components/ui/custom-checkbox';
import SocialButton from '@/components/ui/SocialButtons';
import GoogleSignInButton from '@/components/ui/GoogleSignInButton';
import { AiFillApple, AiFillFacebook } from "react-icons/ai";
import { login } from '@/services/api/auth';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

interface LoginFormProps {
  setForgotPassword: (value: boolean) => void;
}

export default function LoginForm({ setForgotPassword }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Error states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [googleError, setGoogleError] = useState('');

  // Handle Google authentication success
  const handleGoogleSuccess = (user: { id: string; email: string; name: string; picture?: string }) => {
    console.log('✅ Google login successful:', user);
    setGoogleError('');
    // Navigation is handled in GoogleSignInButton component
  };

  // Handle Google authentication error
  const handleGoogleError = (error: string) => {
    console.error('❌ Google login error:', error);
    setGoogleError(error);
  };

  const handleLogin = async () => {
    // Reset errors
    setEmailError('');
    setPasswordError('');
    setGeneralError('');
    setGoogleError('');
    setLoading(true);

    try {
      const res = await login({ email, password });
      console.log(res)

      // Determine if we're in production (HTTPS) or development (HTTP)
      const isProduction = import.meta.env.VITE_NODE_ENV === 'production' || window.location.protocol === 'https:';

      Cookies.set('authToken', res.data.token, {
        expires: 1, // 1 day
        secure: isProduction, // Only secure in production/HTTPS
        sameSite: 'Strict',
      });

      navigate("/app/dashboard");
    } catch (err: unknown) {
      // 🔑 handle backend error properly
      let errorMsg = 'Login failed';
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { detail?: string } } };
        if (axiosError.response?.data?.detail) {
          errorMsg = axiosError.response.data.detail;
        }
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMsg = (err as { message: string }).message;
      }

      // Decide where to show error
      if (errorMsg.toLowerCase().includes('email')) {
        setEmailError(errorMsg);
      } else if (errorMsg.toLowerCase().includes('password')) {
        setPasswordError(errorMsg);
      } else {
        setGeneralError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold">Login</h2>
        <p className="text-sm text-gray-500">Login to access your invoice account</p>
      </div>

      <div className="space-y-1">
        <FloatingInput
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          isImportant
        />
        {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
      </div>

      <div className="space-y-1">
        <FloatingInput
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          isImportant
        />
        {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
      </div>

      {generalError && <p className="text-red-500 text-sm">{generalError}</p>}
      {googleError && <p className="text-red-500 text-sm">{googleError}</p>}

      <div className="flex justify-between items-center text-sm">
        <Checkbox id="remember" label="Remember me" />
        <button className="text-red-500 hover:underline" onClick={() => setForgotPassword(true)}>Forgot Password</button>
      </div>

      <button
        className="w-full bg-black text-white py-2 rounded-md hover:opacity-90 disabled:opacity-50"
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>

      <p className="text-sm text-center text-gray-600">
        Don’t have an account?{' '}
        <a href="/signup" className="text-red-500 hover:underline">Sign up</a>
      </p>

      <div className="flex items-center space-x-2">
        <div className="flex-grow h-px bg-gray-300"></div>
        <span className="text-sm text-gray-400">Or login with</span>
        <div className="flex-grow h-px bg-gray-300"></div>
      </div>

      <div className="space-y-3">
        {/* Google Sign-In Button */}
        <GoogleSignInButton
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          className="w-full"
        />

        {/* Other Social Buttons */}
        <div className="flex space-x-3">
          <SocialButton
            icon={<AiFillFacebook size={18} className="text-[#1877F2]" />}
            label="Facebook"
          />
          <SocialButton
            icon={<AiFillApple size={18} className="text-black" />}
            label="Apple"
          />
        </div>
      </div>
    </div>
  );
}



// const AppleLogo = () => (
//   <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
//     <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" fill="#000000" />
//   </svg>
// );

// const FacebookLogo = () => (
//   <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
//     <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2" />
//     <path d="M16.671 15.543l.532-3.47h-3.328v-2.25c0-.949.465-1.874 1.956-1.874h1.513V4.996s-1.374-.235-2.686-.235c-2.741 0-4.533 1.662-4.533 4.669v2.642H7.078v3.47h3.047v8.385a12.118 12.118 0 003.75 0v-8.385h2.796z" fill="#FFFFFF" />
//   </svg>
// );