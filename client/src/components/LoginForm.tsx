'use client';

import { useState } from 'react';
import { Facebook, Apple, Chrome } from 'lucide-react';
import FloatingInput from './ui/Input';
import Checkbox from './ui/Checkbox';
import SocialButton from './ui/SocialButtons';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold">Login</h2>
        <p className="text-sm text-gray-500">Login to access your invoice account</p>
      </div>

      <FloatingInput
        id="email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <FloatingInput
        id="password"
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <div className="flex justify-between items-center text-sm">
        <Checkbox id="remember" label="Remember me" />
        <button className="text-red-500 hover:underline">Forgot Password</button>
      </div>

      <button className="w-full bg-black text-white py-2 rounded-md hover:opacity-90">
        Login
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
        <SocialButton icon={<Facebook size={18} />} label="Facebook" />
        <SocialButton icon={<Chrome size={18} />} label="Google" />
        <SocialButton icon={<Apple size={18} />} label="Apple" />
      </div>
    </div>
  );
}
