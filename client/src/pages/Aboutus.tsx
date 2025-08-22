import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
// import { Link } from 'react-router-dom'; // Remove this import as it's not available
import { useState } from "react";
import { MapPin, Phone, Mail, Globe, Linkedin } from "lucide-react";
import { Input } from "@/components/ui/Input";
import BackgroundEffects from "@/components/BackgroundEffects";

const Aboutus = () => {
  const [email, setEmail] = useState("");

  const handleSignUp = () => {
    // Handle newsletter signup
    console.log("Newsletter signup:", email);
    setEmail("");
  };

  const founders = [
    {
      name: "Sharad Raj Ustav",
      role: "Founder & CEO",
      image: "/sharad_sir.svg",
      linkedin: "https://www.linkedin.com/in/sharadrajutsav/",
    },
    {
      name: "Shreya Sinha",
      role: "Co-Founder",
      image: "/shreya_maam.svg",
      linkedin: "https://www.linkedin.com/in/shreya-sinha2802/",
    },
    {
      name: "CA Saurabh Jain",
      role: "Co-Founder",
      image: "/saurabh_sir.svg",
      linkedin: "https://www.linkedin.com/in/ca-saurabh-jain-8a014034/",
    },
  ];

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects />

      <section className="py-20 bg-transparent mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <a href="/">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </a>
          </div>

          <div className="text-center mb-16">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-hero bg-clip-text text-black">
                About Us
              </span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We're on a mission to revolutionize business processes through intelligent AI solutions
            </p>
          </div>

          {/* Company Information Card */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm mb-16">
            <CardContent className="p-8 space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">Our Mission</h3>
                <p className="text-muted-foreground">
                  At Agility AI, we're dedicated to simplifying business workflows through innovative AI-driven solutions.
                  Our platform empowers businesses to automate complex processes, improve efficiency, and focus on what matters most - growth and innovation.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">What We Do</h3>
                <p className="text-muted-foreground">
                  We provide cutting-edge AI tools for invoice management, business automation, and workflow optimization.
                  Our solutions are designed to integrate seamlessly with your existing systems while providing intelligent insights and automation capabilities.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Service Availability</h3>
                <p className="text-muted-foreground">
                  We strive to maintain 99.9% uptime, but cannot guarantee uninterrupted service due to maintenance or unforeseen circumstances.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Payment Terms</h3>
                <p className="text-muted-foreground">
                  All payments are processed securely and charged according to your selected plan. Refunds are available within 30 days of purchase.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Intellectual Property</h3>
                <p className="text-muted-foreground">
                  All content and materials available on our platform are protected by intellectual property laws and remain our property.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Founders Section */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                <span className="bg-gradient-hero bg-clip-text text-black">
                  Meet Our Founders
                </span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                The visionaries and innovators behind Agility AI Invoicely who are committed to transforming how businesses operate
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {founders.map((founder, index) => (
                <Card
                  key={index}
                  className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                >
                  <CardContent className="p-6 text-center">
                    <div className="mb-4">
                      <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-br from-[#B5A3FF] via-[#785FDA] to-[#9F91D8]">
                        <img
                          src={founder.image}
                          alt={founder.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-xl font-bold mb-1">{founder.name}</h3>
                      <p className="text-sm font-medium bg-gradient-to-r from-[#B5A3FF] via-[#785FDA] to-[#9F91D8] bg-clip-text text-transparent mb-2">{founder.role}</p>
                    </div>

                    <div className="flex justify-center">
                      <a
                        href={founder.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-[#B5A3FF] via-[#785FDA] to-[#9F91D8] hover:opacity-90 text-white transition-opacity"
                      >
                        <Linkedin className="w-5 h-5" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer id="contact" className="bg-transparent text-black">
        {/* Newsletter Subscription Section */}
        <div className="border-b border-slate-700">
          <div className="max-w-6xl mx-auto px-6 py-16">
            {/* Header */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Subscribe</h2>
              <p className="text-gray-500 text-lg">
                Be the first to know about updates, new tools, and exclusive deals.
              </p>
            </div>

            {/* Newsletter Form */}
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
                    className="bg-gradient-to-b from-[#B5A3FF] via-[#785FDA] to-[#9F91D8] text-white px-4 py-2 rounded-lg"
                  >
                    Sign Up
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  By clicking Sign Up you're confirming that you agree with our{" "}
                  <a href="#" className="text-purple-400 hover:underline">
                    Terms and Conditions
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            {/* Left Side - Company Info */}
            <div>
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-lg overflow-hidden">
                    <img
                      src="/agility.jpg"
                      alt="Agility Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Agility AI Invoicely</h3>
                  </div>
                </div>
                <p className="text-gray-500 max-w-md">
                  AI-driven business solutions that simplify your workflow.
                </p>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
                <div className="space-y-3 text-gray-500">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-purple-500 mt-1" />
                    <p>Abhay Khand-3, Indirapuram, Suraksha Apartment
                      Ghaziabad, Uttar Pradesh 201010, IN</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-purple-500 mt-1" />
                    <p>+91-7042149608</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="w-4 h-4 text-purple-500 mt-1" />
                    <p>service@agilityai.in</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Globe className="w-4 h-4 text-purple-500 mt-1" />
                    <a href="https://agilityai.co.in/" className="hover:text-white transition-colors">
                      www.agilityai.co.in
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Company Links */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Company</h4>
                <ul className="space-y-3 text-gray-500">
                  <li><a href="/about" className="hover:text-black transition-colors">About Us</a></li>

                  {/* <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-black transition-colors">Contact</a></li> */}

                </ul>
              </div>

              {/* Resources Links */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Resources</h4>
                <ul className="space-y-3 text-gray-500">
                  <li><a href="/privacy-policy" className="hover:text-black transition-colors">Privacy Policy</a></li>
                  <li><a href="/T&C" className="hover:text-black transition-colors">Terms of Service</a></li>

                  <li><a href="/support" className="hover:text-black transition-colors">Support</a></li>
                  <li><a href="/userguide" className="hover:text-black transition-colors">User Guide</a></li>

                </ul>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center pt-4 border-t border-slate-700">
            <p className="text-gray-800">
              © 2025 Agility AI Pvt. Ltd. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Aboutus;