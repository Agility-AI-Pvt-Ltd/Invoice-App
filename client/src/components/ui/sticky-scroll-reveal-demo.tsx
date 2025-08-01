"use client";
import React from "react";
import StickyScroll  from "@/components/ui/sticky-scroll-reveal";
import { FileText, Send, DollarSign, Users } from "lucide-react";

const content = [
  {
    // icon: <FileText className="w-6 h-6" />,
    title: "Smart Invoice Creation",
    description:
      "Create professional invoices in seconds with our intelligent template system. Auto-fill client details, add your branding, and customize layouts to match your business needs perfectly.",
    content: (
      <div className="flex h-full w-full flex-col items-center justify-center text-black p-8">
        <FileText className="w-16 h-16 mb-4" />
      </div>
    ),
  },
  {
    // icon: <FileText className="w-6 h-6" />,
    title: "Instant Delivery & Tracking",
    description:
      "Send invoices instantly via email, WhatsApp, or shareable links. Track when clients view your invoices and get real-time delivery confirmations to stay on top of your billing.",
    content: (
      <div className="flex h-full w-full flex-col items-center justify-center text-black p-8">
        <Send className="w-16 h-16 mb-4" />
        <h3 className="text-xl font-semibold">Smart Delivery</h3>
        <p className="text-center text-sm mt-2 opacity-90">Multi-channel Distribution</p>
      </div>
    ),
  },
  {
    // icon: <FileText className="w-6 h-6" />,
    title: "Fast Payment Processing",
    description:
      "Get paid faster with integrated UPI and bank transfer options. Add 'Pay Now' buttons to invoices and receive instant payment notifications when clients pay.",
    content: (
      <div className="flex h-full w-full flex-col items-center justify-center text-black p-8">
        <DollarSign className="w-16 h-16 mb-4" />
        <h3 className="text-xl font-semibold">Quick Payments</h3>
        <p className="text-center text-sm mt-2 opacity-90">UPI & Bank Integration</p>
      </div>
    ),
  },
  {

    title: "Client Management Hub",
    description:
      "Manage all your clients from one central dashboard. Track payment history, set automated reminders, and build stronger relationships with comprehensive client profiles.",
    content: (
      <div className="flex h-full w-full flex-col items-center justify-center text-black p-8">
        <Users className="w-16 h-16 mb-4" />
        <h3 className="text-xl font-semibold">Client Portal</h3>
        <p className="text-center text-sm mt-2 opacity-90">Relationship Management</p>
      </div>
    ),
  },
];

export default function StickyScrollRevealDemo() {
  return (
    <div className="w-full py-4">
      <StickyScroll content={content} />
    </div>
  );
}