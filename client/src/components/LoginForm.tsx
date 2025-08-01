import { useState } from 'react';
import FloatingInput from './ui/FloatingInput';
import Checkbox from '@/components/ui/custom-checkbox';
import SocialButton from '@/components/ui/SocialButtons';
import { BsGoogle } from "react-icons/bs";
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

  const handleLogin = async () => {
    // Reset errors
    setEmailError('');
    setPasswordError('');
    setGeneralError('');
    setLoading(true);

    try {
      const res = await login({ email, password });
      // console.log(res)

      Cookies.set('authToken', res.token, {
        expires: 1, // 1 day
        secure: true,
        sameSite: 'Strict',
      });

      navigate("/app/dashboard");
    } catch (err: any) {
      const error = err.message || 'Login failed';
      if (error.includes('email')) {
        setEmailError(error);
      } else if (error.includes('password')) {
        setPasswordError(error);
      } else {
        setGeneralError(error);
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
        <a href="#" className="text-red-500 hover:underline">Sign up</a>
      </p>

      <div className="flex items-center space-x-2">
        <div className="flex-grow h-px bg-gray-300"></div>
        <span className="text-sm text-gray-400">Or login with</span>
        <div className="flex-grow h-px bg-gray-300"></div>
      </div>

      <div className="flex space-x-3">
        <SocialButton icon={<AiFillFacebook size={18} />} label="Facebook" />
        <SocialButton icon={<BsGoogle size={18} />} label="Google" />
        <SocialButton icon={<AiFillApple size={18} />} label="Apple" />
      </div>
    </div>
  );
}
