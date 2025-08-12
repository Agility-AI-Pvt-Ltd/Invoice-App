import type React from "react"
import { useState, useRef } from "react"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

const OtpForm: React.FC = () => {
    const [otp, setOtp] = useState(["", "", "", "", "", ""])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])
    const navigate = useNavigate()
    const handleChange = (index: number, value: string) => {
        if (value.length > 1) return // Only allow single digit

        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        // Handle backspace to go to previous input
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const otpValue = otp.join("")
        if (otpValue.length !== 6) {
            return
        }

        try {
            setIsSubmitting(true)
            // Add your OTP verification logic here
            console.log("Verifying OTP:", otpValue)
        } catch (error) {
            console.error("OTP verification failed:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleResend = () => {
        // Add resend logic here
        console.log("Resending OTP")
    }

    return (
        <div className="w-full max-w-md mx-auto p-6">
            {/* Back to Sign up link */}
            <div className="mb-8 flex items-center space-x-3">
                <img src="/agility.jpg" alt="Logo" width={60} height={60} />
                <div>
                    <h1 className="font-bold text-lg">Invoice App</h1>
                    <p className="text-xs text-gray-500">Powered by AgilityAI</p>
                </div>
            </div>
            <button className="flex items-center text-gray-600 mb-8 hover:text-gray-800" onClick={() => navigate('/signup')}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                <span className="text-sm">Back to Sign up</span>
            </button>

            {/* Main heading */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Enter verification code</h1>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-8 leading-relaxed">
                We have just sent a verification code to +91 XXXXXXXXXX and user@mail.com
            </p>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* OTP Input boxes */}
                <div className="flex gap-3 justify-center">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => {
                                inputRefs.current[index] = el;
                            }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className="w-12 h-12 text-center text-lg font-medium border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                    ))}
                </div>

                {/* Verify button */}
                <Button
                    type="submit"
                    disabled={isSubmitting || otp.some((digit) => !digit)}
                    className="w-full bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 h-12 text-base font-medium"
                >
                    {isSubmitting ? "Verifying..." : "Verify"}
                </Button>
            </form>

            {/* Resend link */}
            <div className="text-center mt-6">
                <span className="text-gray-500 text-sm">Didn't receive code? </span>
                <button onClick={handleResend} className="text-blue-600 text-sm hover:text-blue-800 font-medium">
                    Resend
                </button>
            </div>
        </div>
    )
}

export default OtpForm
