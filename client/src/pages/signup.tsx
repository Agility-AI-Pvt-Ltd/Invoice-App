import { useEffect } from "react";
import Cookies from "js-cookie";
import SignupForm from "@/components/SignUpForm";
import SignupSVG from "@/components/SVGs/SignupSVG";
import { useNavigate } from "react-router-dom";

const SignUpPage: React.FC = () => {
    const router = useNavigate();

    useEffect(() => {
        const token = Cookies.get("authToken");
        if (token) {
            router("/app/dashboard"); // Change to your actual dashboard route
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-6xl w-full mx-auto bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
                <div className="hidden md:flex items-center justify-center bg-gray-100 p-8">
                    <SignupSVG />
                </div>
                <div className="flex items-center justify-center p-6 sm:p-10">
                    <SignupForm />
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;
