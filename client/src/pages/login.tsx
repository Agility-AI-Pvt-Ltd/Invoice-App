import ForgotPasswordForm from "@/components/ForgotPasswordForm";
import LoginForm from "@/components/LoginForm";
import ForgotPassSVG from "@/components/SVGs/ForgotPassSVG";
import LoginSVG from "@/components/SVGs/LoginSVG";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const [forgotPassword, setForgotPassword] = useState<boolean>(false);
    const router = useNavigate();

    useEffect(() => {
        const token = Cookies.get("authToken");
        if (token) {
            router("/app/dashboard"); // Change path if your dashboard path is different
        }
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white rounded-3xl shadow-md grid grid-cols-1 md:grid-cols-2 overflow-hidden w-full max-w-5xl">
                {/* Left - Form */}
                <div className="p-8">
                    <div className="mb-8 flex items-center space-x-3">
                        <img src="/Invoicely_logo_Final.png" alt="Logo" width={60} height={60} />
                        <div>
                            <h1 className="font-bold text-lg">Agility AI Invoicely</h1>
                            {/* <p className="text-xs text-gray-500">Powered by AgilityAI</p> */}
                        </div>
                    </div>
                    {!forgotPassword ? (
                        <LoginForm setForgotPassword={setForgotPassword} />
                    ) : (
                        <ForgotPasswordForm setForgotPassword={setForgotPassword} />
                    )}
                </div>

                <div className="bg-gray-100 hidden md:flex items-center justify-center">
                    {!forgotPassword ? <LoginSVG /> : <ForgotPassSVG />}
                </div>
            </div>
        </div>
    );
}
