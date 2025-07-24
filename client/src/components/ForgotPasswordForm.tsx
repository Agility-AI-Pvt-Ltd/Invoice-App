'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
import FloatingInput from './ui/Input';

export default function ForgotPasswordForm({setForgotPassword}:any) {
  const [email, setEmail] = useState('');
//   const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 🔐 API call to send password reset email
    console.log('Submitted:', email);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <button
        className="flex items-center text-sm text-black hover:underline"
        onClick={() => setForgotPassword(false)}
      >
        <ArrowLeft size={16} className="mr-1" />
        Back to login
      </button>

      <div>
        <h1 className="text-2xl font-semibold">Forgot your password?</h1>
        <p className="text-sm text-gray-600 mt-1">
          Don’t worry, happens to all of us. Enter your email below to recover your password
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FloatingInput
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded-md hover:opacity-90"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
