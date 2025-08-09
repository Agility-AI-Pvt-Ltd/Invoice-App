import type { FC, ReactNode } from 'react';

type SocialButtonProps = {
    icon: ReactNode;
    label?: string;
};

const SocialButton: FC<SocialButtonProps> = ({ icon }) => (
    <button className="flex items-center justify-center border rounded-md px-4 py-2 w-full space-x-2 hover:bg-gray-100 transition">
        {icon}
        {/* <span className="text-sm">{label}</span> */}
    </button>
);

export default SocialButton;
