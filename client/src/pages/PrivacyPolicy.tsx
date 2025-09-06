
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

import { MapPin, Phone, Mail, Globe } from "lucide-react";

import BackgroundEffects from '@/components/BackgroundEffects';

const PrivacyPolicy = () => {

  return (
    <div className="min-h-screen">
      <BackgroundEffects />
      
      <section className="py-20 bg-gradient-subtle mt-16">
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
                Privacy Policy
              </span>
            </h1>
          </div>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-8 space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">Data Collection</h3>
                <p className="text-muted-foreground">We collect only the necessary information to provide you with the best possible service. This includes account information, usage data, and communication preferences.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Data Usage</h3>
                <p className="text-muted-foreground">Your data is used solely to improve our services and provide you with personalized experiences. We never sell or share your personal information with third parties.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Data Security</h3>
                <p className="text-muted-foreground">We employ industry-standard security measures to protect your data, including encryption, secure servers, and regular security audits.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Cookies and Tracking</h3>
                <p className="text-muted-foreground">We use cookies to enhance your browsing experience and analyze website traffic. You can control cookie settings through your browser preferences.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Third-Party Services</h3>
                <p className="text-muted-foreground">We may use third-party services for analytics and functionality. These services have their own privacy policies that govern the use of your information.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Contact Us</h3>
                <p className="text-muted-foreground">If you have any questions about this Privacy Policy, please contact us at privacy@yourbrand.com.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      
      <footer id="contact" className="bg-transparent text-black">
      {/* Newsletter Subscription Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
                  {/* Left Side - Company Info */}
                  <div>
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-lg overflow-hidden">
                          <img
                            src="/Invoicely_logo_Final.png"
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
                          <MapPin className="w-4 h-4 rounded-2xl text-purple-500 mt-1" />
                          <p>Ghaziabad, Uttar Pradesh, India</p>
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
                        <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
                        {/* <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
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

export default PrivacyPolicy;