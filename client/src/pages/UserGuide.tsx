import BackgroundEffects from '@/components/BackgroundEffects';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

import { MapPin, Phone, Mail, Globe } from "lucide-react";

const UserGuide = () => {

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

export default UserGuide;