import OtpForm from "@/components/OtpForm";
import ForgotPassSVG from "@/components/SVGs/ForgotPassSVG";

const OTP: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-6xl w-full mx-auto bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">

                {/* Left side - OTP Form */}
                <div className="flex items-center justify-center p-6 sm:p-10">
                    <div className="w-full max-w-md">
                        <OtpForm />
                    </div>
                </div>

                {/* Right side - SVG Illustration */}
                <div className="hidden md:flex items-center justify-center bg-gray-100 p-8">
                    <ForgotPassSVG />
                </div>

            </div>
        </div>
    );
};

export default OTP;
