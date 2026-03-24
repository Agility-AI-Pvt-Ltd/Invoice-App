import { MapPin, Phone, Mail, Globe } from "lucide-react";

const Footer = () => {
  return (
    <footer id="contact" className="bg-[#D1E3FF] text-black">
      {/* Newsletter Subscription Section */}
      {/* <div className="border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-6 py-16">
          {/* Header 
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Subscribe</h2>
            <p className="text-gray-500  text-lg">
              Be the first to know about updates, new tools, and exclusive deals.
            </p>
          </div>

          {/* Newsletter Form 
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
            <div className="flex-1">
              <h3 className="text-2xl font-semibold mb-3">Stay in the tech loop.</h3>
              <p className="text-gray-500 max-w-md">
                Keep up to date with new products, all the goss, and anything else you might have missed on twitter.
              </p>
            </div>

            <div className="flex-1 max-w-md w-full">
              <div className="flex gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-white text-slate-900 border-0 h-9"
                />
                <Button
                  onClick={handleSignUp}
                  className="cursor-pointer bg-gradient-to-b from-[#B5A3FF] via-[#785FDA] to-[#9F91D8] text-white px-4 py-2 rounded-lg"
                >
                  Sign Up
                </Button>
              </div>
              <p className="text-xs text-gray-500  mt-3">
                By clicking Sign Up you're confirming that you agree with our{" "}
                <a href="#" className="text-purple-400 hover:underline">
                  Terms and Conditions
                </a>
              </p>
            </div>
          </div>
        </div>
      </div> */}

      {/* Main Footer Content */}
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-12 grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Left Side - Company Info */}
          <div>
            <div className="mb-6">
              <div className="mb-2 flex items-center gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-lg">
                  <img
                    src="/Invoicely_logo_Final.png"
                    alt="Agility Logo"
                    className="h-full w-full rounded-lg object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Agility AI Invoicely</h3>
                  {/* <p className="text-sm text-gray-500 ">Powered by AgilityAI</p> */}
                </div>
              </div>
              <p className="max-w-md text-gray-500">
                AI-driven business solutions that simplify your workflow.
              </p>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="mb-4 text-lg font-semibold">Contact Us</h4>
              <div className="space-y-3 text-gray-500">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-1 h-4 w-4 text-purple-500" />
                  <p>
                    Abhay Khand-3, Indirapuram, Suraksha Apartment Ghaziabad,
                    Uttar Pradesh 201010, IN
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="mt-1 h-4 w-4 text-purple-500" />
                  <p>+91-7042149608</p>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="mt-1 h-4 w-4 text-purple-500" />
                  <p>service@agilityai.in</p>
                </div>
                <div className="flex items-start gap-2">
                  <Globe className="mt-1 h-4 w-4 text-purple-500" />
                  <a
                    href="https://agilityai.co.in/"
                    className="transition-colors hover:text-white"
                  >
                    www.agilityai.co.in
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Links */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Company Links */}
            <div>
              <h4 className="mb-4 text-lg font-semibold">Company</h4>
              <ul className="space-y-3 text-gray-500">
                <li>
                  <a
                    href="/about"
                    className="transition-colors hover:text-black"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    className="transition-colors hover:text-white"
                  >
                    Contact
                  </a>
                </li>
                {/* <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Contact</a></li> */}
              </ul>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="mb-4 text-lg font-semibold">Product</h4>
              <ul className="space-y-3 text-gray-500">
                <li>
                  <a
                    href="#features"
                    className="transition-colors hover:text-white"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing-section"
                    className="transition-colors hover:text-black"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#FAQsection"
                    className="transition-colors hover:text-black"
                  >
                    FAQs
                  </a>
                </li>
                <li>
                  <a
                    href="/signup"
                    className="transition-colors hover:text-black"
                  >
                    Get Started
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h4 className="mb-4 text-lg font-semibold">Resources</h4>
              <ul className="space-y-3 text-gray-500">
                <li>
                  <a
                    href="/privacy-policy"
                    className="transition-colors hover:text-black"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/T&C" className="transition-colors hover:text-black">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="/support"
                    className="transition-colors hover:text-black"
                  >
                    Support
                  </a>
                </li>
                <li>
                  <a
                    href="/userguide"
                    className="transition-colors hover:text-black"
                  >
                    User Guide
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex w-2/5 items-center justify-between py-4 md:gap-10">
            {/* Instagram */}
            <a
              href="https://www.instagram.com/agilityy.ai?igsh=MWp6NDlsb3NuaGFsdg%3D%3D&utm_source=qr"
              target="_blank"
              className="transition-all duration-400 hover:scale-120 hover:rounded-full hover:bg-black hover:p-1.5 hover:text-blue-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                className="lucide lucide-instagram-icon lucide-instagram"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>

            {/* linkedIn */}
            <a
              href="https://www.linkedin.com/company/agility-ai-pvt-ltd/posts/?feedView=all"
              target="_blank"
              className="transition-all duration-400 hover:scale-120 hover:rounded-full hover:bg-black hover:p-1.5 hover:text-blue-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-linkedin-icon lucide-linkedin"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect width="4" height="12" x="2" y="9" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>

            {/* Twitter */}
            <a
              href="https://x.com/agilityai564?s=11"
              target="_blank"
              className="transition-all duration-400 hover:scale-120 hover:rounded-full hover:bg-blue-200 hover:p-1.5 hover:text-blue-200"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 1200 1227"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z"
                  fill="black"
                />
              </svg>
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-700 pt-4 text-center">
          <p className="text-gray-800">
            © 2025 Agility AI Pvt. Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
