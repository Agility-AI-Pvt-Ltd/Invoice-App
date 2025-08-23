import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, Mail, Globe, User, MessageSquare } from "lucide-react"
import { useState } from "react"
import BackgroundEffects from "@/components/BackgroundEffects"
import NavbarUpdated from "@/components/Navbar"
import CustomCheckbox from "@/components/ui/custom-checkbox"

type FormData = {
    name: string;
    phone: string;
    email: string;
    message: string;
};

const ContactPage = () => {
    const [formData, setFormData] = useState<FormData>({
        name: "",
        phone: "",
        email: "",
        message: "",
    })

    const [agreement, setAgreement] = useState(false)

    const [touched, setTouched] = useState<Record<keyof FormData, boolean>>({
        name: false,
        phone: false,
        email: false,
        message: false,
    })

    const [submitAttempted, setSubmitAttempted] = useState(false)
    const [success, setSuccess] = useState<string | null>(null)

    // Simple validators
    const validators: Record<keyof FormData, (v: string) => string | null> = {
        name: (v) =>
            !v.trim()
                ? "Name is required."
                : v.trim().length < 2
                ? "Please enter at least 2 characters."
                : null,
        phone: (v) =>
            !v.trim()
                ? "Phone is required."
                : !/^[0-9]{10,15}$/.test(v.replace(/\s+/g, ""))
                ? "Enter a valid phone number (digits only, 10-15)."
                : null,
        email: (v) =>
            !v.trim()
                ? "Email is required."
                : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
                ? "Enter a valid email address."
                : null,
        message: (v) =>
            !v.trim()
                ? "Please describe your query."
                : v.trim().length < 10
                ? "Tell us a little more (min 10 characters)."
                : null,
    }

    const getFieldError = (name: keyof FormData) => {
        return validators[name](formData[name])
    }

    const hasErrors = () => {
        return (Object.keys(formData) as (keyof FormData)[]).some(
            (k) => validators[k](formData[k]) !== null
        )
    }

    const isFormValid = () => !hasErrors() && agreement

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name } = e.target
        setTouched((prev) => ({ ...prev, [name as keyof FormData]: true }))
    }

    const handleCheckboxChange = (checked: boolean) => {
        setAgreement(checked)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitAttempted(true)

        // Mark all fields as touched so all inline errors appear
        setTouched({
            name: true,
            phone: true,
            email: true,
            message: true,
        })

        if (!isFormValid()) {
            // Keep success null and show errors
            setSuccess(null)
            return
        }

        // Fake submit (replace with API call)
        console.log("Form submitted:", { ...formData, agreement })
        setSuccess("Thanks! We'll get back to you shortly.")
        setFormData({ name: "", phone: "", email: "", message: "" })
        setAgreement(false)
        setSubmitAttempted(false)
        setTouched({ name: false, phone: false, email: false, message: false })
    }

    return (
        <div className=" bg-transparent">
            <BackgroundEffects />
            <NavbarUpdated />
            <main className="py-16 mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Page Title */}
                    <div className="text-center mb-16">
                        <h1 className="text-4xl sm:text-5xl font-bold text-black mb-4">Contact Us</h1>
                    </div>

                    {/* Contact Section */}
                    <div className="grid lg:grid-cols-2 gap-16 items-start">
                        {/* Left Side - Contact Info */}
                        <div className="space-y-8">
                            <div>
                                <h1 className="text-4xl font-bold text-purple-900 mb-2">Have Questions?</h1>
                                <h2 className="text-4xl font-bold text-purple-900 mb-6">Get in Touch!</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-b from-[#B5A3FF] via-[#785FDA] to-[#9F91D8] rounded-full flex items-center justify-center">
                                        <MapPin className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-gray-800 font-medium">Ghaziabad, Uttar Pradesh, India</span>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-b from-[#B5A3FF] via-[#785FDA] to-[#9F91D8] rounded-full flex items-center justify-center">
                                        <Mail className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-gray-800 font-medium">support@agilityai.co.in</span>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-b from-[#B5A3FF] via-[#785FDA] to-[#9F91D8] rounded-full flex items-center justify-center">
                                        <Globe className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-gray-800 font-medium">www.agilityai.co.in</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Form */}
                        <div className="rounded-2xl shadow-lg p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Success message */}
                                {success && (
                                    <div className="rounded-md bg-green-50 border border-green-200 p-3 text-green-800 text-sm">
                                        {success}
                                    </div>
                                )}

                                {/* Name Field */}
                                <div>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" />
                                        <Input
                                            type="text"
                                            name="name"
                                            placeholder="Name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            onBlur={handleBlur}
                                            className={`pl-12 h-14 border rounded-xl text-black placeholder:text-gray-600 ${
                                                (touched.name || submitAttempted) && getFieldError("name")
                                                    ? "border-red-400 ring-1 ring-red-200"
                                                    : "border-gray-300"
                                            }`}
                                        />
                                    </div>
                                    {(touched.name || submitAttempted) && getFieldError("name") && (
                                        <p role="alert" className="mt-2 text-sm text-red-600 flex items-center gap-2">
                                            <svg className="w-4 h-4 inline-block" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.681-1.36 3.446 0l6.518 11.585c.75 1.333-.213 2.999-1.723 2.999H3.462c-1.51 0-2.473-1.666-1.723-2.999L8.257 3.1zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-9a1 1 0 00-.993.883L8.99 5v4a1 1 0 001.993.117L11 9V5a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {getFieldError("name")}
                                        </p>
                                    )}
                                </div>

                                {/* Phone Field */}
                                <div>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 " />
                                        <Input
                                            type="tel"
                                            name="phone"
                                            placeholder="Phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            onBlur={handleBlur}
                                            className={`pl-12 h-14 border rounded-xl text-black placeholder:text-gray-600 ${
                                                (touched.phone || submitAttempted) && getFieldError("phone")
                                                    ? "border-red-400 ring-1 ring-red-200"
                                                    : "border-gray-300"
                                            }`}
                                        />
                                    </div>
                                    {(touched.phone || submitAttempted) && getFieldError("phone") && (
                                        <p role="alert" className="mt-2 text-sm text-red-600">
                                            {getFieldError("phone")}
                                        </p>
                                    )}
                                </div>

                                {/* Email Field */}
                                <div>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black" />
                                        <Input
                                            type="email"
                                            name="email"
                                            placeholder="Email Address"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            onBlur={handleBlur}
                                            className={`pl-12 h-14 border rounded-xl text-black placeholder:text-gray-600 ${
                                                (touched.email || submitAttempted) && getFieldError("email")
                                                    ? "border-red-400 ring-1 ring-red-200"
                                                    : "border-gray-300"
                                            }`}
                                        />
                                    </div>
                                    {(touched.email || submitAttempted) && getFieldError("email") && (
                                        <p role="alert" className="mt-2 text-sm text-red-600">
                                            {getFieldError("email")}
                                        </p>
                                    )}
                                </div>

                                {/* Message Field */}
                                <div>
                                    <div className="relative">
                                        <MessageSquare className="absolute left-4 top-6 w-5 h-5 text-black" />
                                        <Textarea
                                            name="message"
                                            placeholder="How can we help you ? Feel free to get in touch!"
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            onBlur={handleBlur}
                                            className={`pl-12 pt-6 min-h-[120px] border rounded-xl text-black placeholder:text-gray-600 resize-none ${
                                                (touched.message || submitAttempted) && getFieldError("message")
                                                    ? "border-red-400 ring-1 ring-red-200"
                                                    : "border-gray-300"
                                            }`}
                                        />
                                    </div>
                                    {(touched.message || submitAttempted) && getFieldError("message") && (
                                        <p role="alert" className="mt-2 text-sm text-red-600">
                                            {getFieldError("message")}
                                        </p>
                                    )}
                                </div>

                                {/* Checkbox */}
                                <div className="flex items-start gap-3 pt-2">
                                    <CustomCheckbox
                                        id="agreement"
                                        checked={agreement}
                                        //@ts-ignore
                                        onChange={handleCheckboxChange}
                                    />
                                    <label htmlFor="agreement" className="text-sm text-gray-600 leading-relaxed">
                                        I agree that my data is collected and stored
                                    </label>
                                </div>
                                {!agreement && submitAttempted && (
                                    <p className="text-sm text-red-600">You must accept data collection to continue.</p>
                                )}

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    disabled={!isFormValid()}
                                    aria-disabled={!isFormValid()}
                                    className={`w-full h-14 font-medium rounded-xl text-base transition-all ${
                                        isFormValid()
                                            ? "bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
                                            : "bg-purple-600 hover:bg-purple-700 text-white cursor-not-allowed opacity-70"
                                    }`}
                                >
                                    Get In Touch
                                </Button>
                            </form>
                        </div>
                    </div>

                    {/* Map Section */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="h-96 bg-gray-200 flex items-center justify-center">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.674753469!2d77.35869731508!3d28.641777982421!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce5456ef36d9f%3A0x3b7191b1286136c8!2sIndirapuram%2C%20Ghaziabad%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1642678901234!5m2!1sen!2sin"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="w-full h-full"
                            />
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-transparent border-t">
                <div className="max-w-6xl mx-auto px-6 py-16">
                    <div className="border-b border-gray-200 pb-12 mb-12">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold mb-4 text-gray-900">Subscribe</h2>
                            <p className="text-gray-600 text-lg">
                                Be the first to know about updates, new tools, and exclusive deals.
                            </p>
                        </div>

                        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
                            <div className="flex-1">
                                <h3 className="text-2xl font-semibold mb-3 text-gray-900">Stay in the tech loop.</h3>
                                <p className="text-gray-600 max-w-md">
                                    Keep up to date with new products, all the goss, and anything else you might have missed on twitter.
                                </p>
                            </div>

                            <div className="flex-1 max-w-md w-full">
                                <div className="flex gap-3">
                                    <Input
                                        type="email"
                                        placeholder="Enter your email"
                                        className="flex-1 bg-white text-gray-900 border-gray-300"
                                    />
                                    <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6">
                                        Sign Up
                                    </Button>
                                </div>
                                <p className="text-xs text-gray-500 mt-3">
                                    By clicking Sign Up you're confirming that you agree with our{" "}
                                    <a href="#" className="text-purple-600 hover:underline">
                                        Terms and Conditions
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div>
                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Agility AI Invoicely</h3>
                                <p className="text-gray-600 max-w-md">AI-driven business solutions that simplify your workflow.</p>
                            </div>

                            <div>
                                <h4 className="text-lg font-semibold mb-4 text-gray-900">Contact Us</h4>
                                <div className="space-y-3 text-gray-600">
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-purple-600 mt-1" />
                                        <p>
                                            Abhay Khand-3, Indirapuram, Suraksha Apartment
                                            <br />
                                            Ghaziabad, Uttar Pradesh 201010, IN
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Phone className="w-4 h-4 text-purple-600 mt-1" />
                                        <p>+91-7042149608</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Mail className="w-4 h-4 text-purple-600 mt-1" />
                                        <p>service@agilityai.in</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Globe className="w-4 h-4 text-purple-600 mt-1" />
                                        <a href="https://agilityai.co.in/" className="hover:text-purple-600 transition-colors">
                                            www.agilityai.co.in
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h4 className="text-lg font-semibold mb-4 text-gray-900">Company</h4>
                                <ul className="space-y-3 text-gray-600">
                                    <li>
                                        <a href="/about" className="hover:text-purple-600 transition-colors">
                                            About Us
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="text-lg font-semibold mb-4 text-gray-900">Resources</h4>
                                <ul className="space-y-3 text-gray-600">
                                    <li>
                                        <a href="/privacy-policy" className="hover:text-purple-600 transition-colors">
                                            Privacy Policy
                                        </a>
                                    </li>
                                    <li>
                                        <a href="/T&C" className="hover:text-purple-600 transition-colors">
                                            Terms of Service
                                        </a>
                                    </li>
                                    <li>
                                        <a href="/support" className="hover:text-purple-600 transition-colors">
                                            Support
                                        </a>
                                    </li>
                                    <li>
                                        <a href="/userguide" className="hover:text-purple-600 transition-colors">
                                            User Guide
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="text-center pt-8 border-t border-gray-200 mt-12">
                        <p className="text-gray-600">© 2025 Agility AI Pvt. Ltd. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default ContactPage