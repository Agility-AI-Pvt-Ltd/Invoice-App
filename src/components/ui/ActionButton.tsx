import React from 'react';

interface ActionButtonProps {
    label: string;
    onClick?: () => void;
    iconOnly?: boolean;
    className?: string;
}


const ActionButton: React.FC<ActionButtonProps> = ({ label, onClick, iconOnly = false }) => {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-1 border border-gray-300 px-3 py-1 rounded-md shadow-sm text-sm text-gray-700 hover:bg-gray-100"
        >
            <span className="text-sm">＋</span>
            {/* Show label only if iconOnly is false OR we're on medium+ screen */}
            <span className={`${iconOnly ? 'hidden sm:inline' : ''}`}>{label}</span>
        </button>
    );
};

export default ActionButton;
