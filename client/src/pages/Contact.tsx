    import type React from "react"
    import { Button } from "@/components/ui/button"
    import { Input } from "@/components/ui/Input"
    import { Textarea } from "@/components/ui/textarea"
    import { MapPin, Phone, Mail, Globe, User, MessageSquare } from "lucide-react"
    import { useState } from "react"
    import BackgroundEffects from "@/components/BackgroundEffects"
    import NavbarUpdated from "@/components/Navbar"
    import CustomCheckbox from "@/components/ui/custom-checkbox"

    const ContactPage = () => {
        const [formData, setFormData] = useState({
            name: "",
            phone: "",
            email: "",
            message: "",
            agreement: false,
        })

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }))
        }



        const handleCheckboxChange = (checked: boolean) => {
            setFormData((prev) => ({
                ...prev,
                agreement: checked,
            }))
        }

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault()
            console.log("Form submitted:", formData)
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
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" />
                                        <Input
                                            type="text"
                                            name="name"
                                            placeholder="Name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="pl-12 h-14 border border-gray-300  rounded-xl text-black placeholder:text-gray-600"
                                            required
                                        />
                                    </div>

                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 " />
                                        <Input
                                            type="tel"
                                            name="phone"
                                            placeholder="Phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="pl-12 h-14 border border-gray-300 rounded-xl text-black placeholder:text-gray-600"
                                            required
                                        />
                                    </div>

                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black" />
                                        <Input
                                            type="email"
                                            name="email"
                                            placeholder="Email Address"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="pl-12 h-14 border border-gray-300 rounded-xl text-black placeholder:text-gray-600"
                                            required
                                        />
                                    </div>

                                    <div className="relative">
                                        <MessageSquare className="absolute left-4 top-6 w-5 h-5 text-black" />
                                        <Textarea
                                            name="message"
                                            placeholder="How can we help you ? Feel free to get in touch!"
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            className="pl-12 pt-6 min-h-[120px] border border-gray-300 rounded-xl text-black placeholder:text-gray-600 resize-none"
                                            required
                                        />
                                    </div>

                                    <div className="flex items-start gap-3 pt-2">
                                        <CustomCheckbox
                                            id="agreement"
                                            checked={formData.agreement}
                                            // onCheckedChange={handleCheckboxChange}
                                            //@ts-ignore
                                            onChange={handleCheckboxChange}
                                        // className="mt-1"
                                        />
                                        <label htmlFor="agreement" className="text-sm text-gray-600 leading-relaxed">
                                            I agree that my data is collected and stored
                                        </label>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-14 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl text-base cursor-pointer"
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
                                            value={formData.email}
                                            // onChange={(e) => setEmail(e.target.value)}
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
