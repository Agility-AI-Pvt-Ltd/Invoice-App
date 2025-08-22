import BackgroundEffects from '@/components/BackgroundEffects';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from "react";
import { MapPin, Phone, Mail, Globe } from "lucide-react";
import { Input } from "@/components/ui/Input";
const UserGuide = () => {
    const [email, setEmail] = useState("");

    const handleSignUp = () => {
      // Handle newsletter signup
      console.log("Newsletter signup:", email);
      setEmail("");
    };
  return (
    <div className="min-h-screen">
      <BackgroundEffects />
      
      <section className="py-20 bg-background mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link to="/">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
          
          <div className="text-center mb-16">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-hero bg-clip-text text-black">
                User Guide
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Learn how to make the most of our platform with these helpful guides.
            </p>
          </div>

          <div className="space-y-8">
            {[
              { 
                title: 'Getting Started', 
                content: 'Learn the basics of setting up your account and getting your first project running. This comprehensive guide covers account creation, initial setup, and your first steps with our platform.' 
              },
              { 
                title: 'Advanced Features', 
                content: 'Discover powerful features that can help you work more efficiently and effectively. Explore automation tools, advanced integrations, and productivity enhancers.' 
              },
              { 
                title: 'Best Practices', 
                content: 'Follow our recommended approaches to get the most value from our platform. Learn from successful customers and industry experts about optimal workflows.' 
              },
              { 
                title: 'Troubleshooting', 
                content: 'Common issues and their solutions to help you resolve problems quickly. Find step-by-step solutions to frequent questions and technical challenges.' 
              },
              { 
                title: 'API Documentation', 
                content: 'Complete reference for developers looking to integrate with our platform. Includes code examples, authentication guides, and endpoint documentation.' 
              },
              { 
                title: 'Security Guidelines', 
                content: 'Best practices for keeping your account and data secure. Learn about two-factor authentication, password management, and security monitoring.' 
              }
            ].map((guide, index) => (
              <Card key={index} className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-elegant transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-xl">{guide.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{guide.content}</p>
                  <Button variant="outline">Read Guide</Button>
                </CardContent>
              </Card>
            ))}
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
            <p className="text-gray-500  text-lg">
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
              <p className="text-xs text-gray-500  mt-3">
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
                  {/* <p className="text-sm text-gray-500 ">Powered by AgilityAI</p> */}
                </div>
              </div>
              <p className="text-gray-500  max-w-md">
                AI-driven business solutions that simplify your workflow.
              </p>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
              <div className="space-y-3 text-gray-500 ">
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
              <ul className="space-y-3 text-gray-500 ">
                <li><a href="/about" className="hover:text-black transition-colors">About Us</a></li>
                {/* <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Contact</a></li> */}
              </ul>
            </div>

            {/* Product Links */}
            {/* <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-gray-500 ">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing-section" className="hover:text-black transition-colors">Pricing</a></li>
                <li><a href="#FAQsection" className="hover:text-black transition-colors">FAQs</a></li>
                <li><a href="/signup" className="hover:text-black transition-colors">Get Started</a></li>
              </ul>
            </div> */}

            {/* Resources Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Resources</h4>
              <ul className="space-y-3 text-gray-500 ">
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
          <p className="text-gray-800 ">
            © 2025 Agility AI Pvt. Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
    </div>
  );
};

export default UserGuide;