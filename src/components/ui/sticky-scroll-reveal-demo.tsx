"use client";
import React from "react";
import StickyScroll  from "@/components/ui/sticky-scroll-reveal";
import { FileText, Send, DollarSign, Users } from "lucide-react";

const content = [
  {
    title: "Smart Invoice Creation",
    description:
      "Create professional invoices in seconds with our intelligent template system. Auto-fill client details, add your branding, and customize layouts to match your business needs perfectly.",
    content: (
      <div className="flex h-full w-full flex-col items-center justify-center text-white p-4 sm:p-8">
        <FileText className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 text-black" />
        <h3 className="text-lg sm:text-xl font-semibold text-black">Invoice Creation</h3>
        <p className="text-center text-xs sm:text-sm mt-2 opacity-90 text-black">Smart Invoice Creation</p>
      </div>
    ),
  },
  {
    title: "Instant Delivery & Tracking",
    description:
      "Send invoices instantly via email, WhatsApp, or shareable links. Track when clients view your invoices and get real-time delivery confirmations to stay on top of your billing.",
    content: (
      <div className="flex h-full w-full flex-col items-center justify-center text-white p-4 sm:p-8">
        <Send className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 text-black" />
        <h3 className="text-lg sm:text-xl font-semibold text-black">Smart Delivery</h3>
        <p className="text-center text-xs sm:text-sm mt-2 opacity-90 text-black">Multi-channel Distribution</p>
      </div>
    ),
  },
  {
    title: "Fast Payment Processing",
    description:
      "Get paid faster with integrated UPI and bank transfer options. Add 'Pay Now' buttons to invoices and receive instant payment notifications when clients pay.",
    content: (
      <div className="flex h-full w-full flex-col items-center justify-center text-white p-4 sm:p-8">
        <DollarSign className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 text-black" />
        <h3 className="text-lg sm:text-xl font-semibold text-black">Quick Payments</h3>
        <p className="text-center text-xs sm:text-sm mt-2 opacity-90 text-black">UPI & Bank Integration</p>
      </div>
    ),
  },
  {
    title: "Client Management Hub",
    description:
      "Manage all your clients from one central dashboard. Track payment history, set automated reminders, and build stronger relationships with comprehensive client profiles.",
    content: (
      <div className="flex h-full w-full flex-col items-center justify-center text-white p-4 sm:p-8">
        <Users className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 text-black" />
        <h3 className="text-lg sm:text-xl font-semibold text-black">Client Portal</h3>
        <p className="text-center text-xs sm:text-sm mt-2 opacity-90 text-black">Relationship Management</p>
      </div>
    ),
  },
];

export default function StickyScrollRevealDemo() {
  return (
    <div className="w-full py-2 sm:py-4">
      <StickyScroll content={content} />
    </div>
  );
}