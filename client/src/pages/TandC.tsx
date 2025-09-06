import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

import { MapPin, Phone, Mail, Globe } from "lucide-react";

import BackgroundEffects from "@/components/BackgroundEffects";
const TermsOfService = () => {

  return (
    <div className="min-h-screen relative">
      
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
              <span className="bg-gradient-hero bg-clip-text text-Black">
                Terms of Service
              </span>
            </h1>
          </div>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-8 space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">Service Usage</h3>
                <p className="text-muted-foreground">By using our service, you agree to use it responsibly and in accordance with all applicable laws and regulations.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Account Responsibilities</h3>
                <p className="text-muted-foreground">You are responsible for maintaining the security of your account and all activities that occur under your account.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Service Availability</h3>
                <p className="text-muted-foreground">We strive to maintain 99.9% uptime, but cannot guarantee uninterrupted service due to maintenance or unforeseen circumstances.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Payment Terms</h3>
                <p className="text-muted-foreground">All payments are processed securely and charged according to your selected plan. Refunds are available within 30 days of purchase.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Intellectual Property</h3>
                <p className="text-muted-foreground">All content and materials available on our platform are protected by intellectual property laws and remain our property.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Termination</h3>
                <p className="text-muted-foreground">We may terminate or suspend your account at any time for violations of these terms. You may also cancel your account at any time.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      
      <footer id="contact" className="bg-transparent text-black">
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
                            className="w-full h-full object-cover rounded-lg"
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

export default TermsOfService;