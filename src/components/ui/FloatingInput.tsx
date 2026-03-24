import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import clsx from 'clsx';

type FloatingInputProps = {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isImportant?: boolean;
  disabled?: boolean;
  required?: boolean;
};

const FloatingInput: React.FC<FloatingInputProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  isImportant = false,
  disabled = false,
  required = false
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const shouldFloat = isFocused || value !== '';

  return (
    <div className="relative w-full">
      <input
        id={id}
        type={isPassword && showPassword ? 'text' : type}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        aria-required={isImportant}
        className={clsx(
          'peer w-full border border-gray-400 rounded-md px-3 pt-5 pb-2 text-sm pr-10',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'transition-all duration-200 font-semibold'
        )}
        disabled={disabled}
        required={required}
      />

      <label
        htmlFor={id}
        className={clsx(
          'absolute left-3 text-gray-500 pointer-events-none transition-all duration-200 bg-white',
          shouldFloat ? 'text-xs -top-1.5 px-1' : 'text-sm top-3'
        )}
      >
        {label}
        {isImportant && isFocused && <span className="text-red-500 ml-0.5">*</span>}
      </label>

      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-3.5 text-gray-500 hover:text-black"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
  );
};

export default FloatingInput;
