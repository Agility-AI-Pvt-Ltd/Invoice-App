import ForgotPasswordForm from "@/components/ForgotPasswordForm";
import LoginForm from "@/components/LoginForm";
import { useState } from "react";


export default function LoginPage() {
    const [forgotPassword, setForgotPassword] = useState<boolean>(false);
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white rounded-3xl shadow-md grid grid-cols-1 md:grid-cols-2 overflow-hidden w-full max-w-5xl">
                {/* Left - Form */}
                <div className="p-8">
                    <div className="mb-8 flex items-center space-x-3">
                        <img src="/agility.jpg" alt="Logo" width={60} height={60} />
                        <div>
                            <h1 className="font-bold text-lg">Invoice App</h1>
                            <p className="text-xs text-gray-500">Powered by AgilityAI</p>
                        </div>
                    </div>
                    {/* insteda of state we should create a new page? nope this is better  */}
                    {!forgotPassword ? <LoginForm setForgotPassword={setForgotPassword} /> : <ForgotPasswordForm setForgotPassword={setForgotPassword} />}

                </div>

                <div className="bg-gray-100 hidden md:flex items-center justify-center">
                    <img
                        src="https://images.unsplash.com/photo-1753133829431-ef2cdb0d2e57?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwzfHx8ZW58MHx8fHx8"  // Make sure this file exists in `public/secure.png`
                        alt="Security Illustration"
                        width={400}
                        height={400}
                        className="object-contain"
                    />
                </div>


            </div>
        </div>
    );
}
