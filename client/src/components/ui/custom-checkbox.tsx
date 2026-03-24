import React from "react";

type CheckboxProps = {
    label: string;
    id: string;
    checked?: boolean; // ✅ controlled
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; 
};

const CustomCheckbox: React.FC<CheckboxProps> = ({ label, id, checked, onChange }) => (
    <div className="flex items-center space-x-2">
        <input
            type="checkbox"
            id={id}
            checked={checked}   
            onChange={onChange} 
            className="h-4 w-4 text-black"
        />
        <label htmlFor={id} className="text-sm text-gray-700 cursor-pointer">
            {label}
        </label>
    </div>
);

export default CustomCheckbox;
