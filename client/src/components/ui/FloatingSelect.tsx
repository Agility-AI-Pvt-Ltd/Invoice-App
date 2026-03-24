import React, { useState } from 'react';
import clsx from 'clsx';

type FloatingSelectProps = {
    id: string;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    required?: boolean;
    options: { value: string; label: string }[];
};

const FloatingSelect: React.FC<FloatingSelectProps> = ({
    id,
    label,
    value,
    onChange,
    required = false,
    options,
}) => {
    const [isFocused] = useState(true);
    const shouldFloat = isFocused || value !== '';

    return (
        <div className="relative w-full">
            <select
                id={id}
                value={value}
                onChange={onChange}
                required={required}
                // onFocus={() => setIsFocused(true)}
                // onBlur={() => setIsFocused(false)}
                className={clsx(
                    'peer w-full border border-gray-400 rounded-md px-3 pt-5 pb-2 text-sm appearance-none bg-white',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                    'transition-all duration-200'
                )}
            >
                <option value="" disabled hidden>Select</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>

            <label
                htmlFor={id}
                className={clsx(
                    'absolute left-3 text-gray-500 pointer-events-none transition-all duration-200 bg-white',
                    shouldFloat ? 'text-xs -top-1.5 px-1' : 'text-sm top-3'
                )}
            >
                {label}
            </label>
        </div>
    );
};

export default FloatingSelect;
