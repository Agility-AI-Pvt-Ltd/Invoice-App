import { useState, useEffect, useRef } from "react";
import { Check, X } from "lucide-react";
import { Button } from "./ui/button";
import { Switch } from "@/components/ui/switch";
import { Card } from "./ui/card";

interface PricingPlan {
  name: string;
  description: string;
  monthlyPrice: string | number;
  yearlyPrice: string | number;
  explain: string;
  highlights?: string[];
  features: Array<{ name: string; included: boolean }>;
  popular?: boolean;
  buttonText: string;
}

const plans: PricingPlan[] = [
  {
    name: "Starter (1 User + 1 Admin)",
    description: "Perfect plan to get started",
    monthlyPrice: "₹249",
    yearlyPrice: "₹2,499",
    explain: "A free plan grants you access to some cool features of Agility AI Invoicely",
    highlights: ["Unlimited Invoices", "Income & Expense Tracking", "Invoice Scan (basic)", "GST-Complaint Invoices", "Automated Payment Reminders"],
    features: [
      { name: "Sync across device", included: true },
      { name: "5 workspaces", included: true },
      { name: "Collaborate with 5 users", included: true },
      { name: "Recurring Invoices & Auto-Billing", included: false },
      { name: "Expense Categorization & Tags", included: false },
      { name: "100+ integrations", included: false },
      { name: "Reports (P&L, Tax, Expense)[Baic only]", included: false },
      { name: "Payment Tracking & Partial Payments", included: false },
      { name: "Approval Workflows", included: false },
      { name: "Custom Invoice Templates", included: false },
      { name: "Audit Trail & Activity Logs", included: false },
      { name: "Data Export & Backup", included: false },
    ],
    buttonText: "Get Your Free Plan",
  },
  {
    name: "Premium (3 Users + 1 Admin)",
    description: "Perfect plan for professionals!",
    monthlyPrice: "₹349",
    yearlyPrice: "₹3,499" ,
    explain: "For professional only! Start arranging your expenses with our best templates",
    highlights: ["Unlimited Invoices", "Income & Expense Tracking", "Invoice Scan (standard)", "GST-Compliant Invoices", "Automated Payment Reminders"],
    features: [
      
      { name: "Recurring Invoices & Auto-Billing", included: true },
      { name: "Expense Categorization & Tags", included: true },
      { name: "100+ integrations", included: false },
      { name: "Reports (P&L, Tax, Expense)[Standard]", included: false },
      { name: "Payment Tracking & Partial Payments", included: true },
      { name: "Approval Workflows", included: false },
      { name: "Custom Invoice Templates", included: false },
      { name: "Audit Trail & Activity Logs", included: false },
      { name: "Data Export & Backup", included: false },
    ],
    popular: true,
    buttonText: "Get Started",
  },
  {
    name: "Diamond (5 Users: 2 Admin + 2 Manager + 1 Exec)",
    description: "Best suits for great company!",
    monthlyPrice: "₹549",
    yearlyPrice: "₹5,499",
    explain: "If you are a finance manager at a big company, this plan is a perfect match",
    highlights: ["Unlimited Invoices","Income & Expense Tracking", "Invoice Scan (bulk upload + advanced)","GST-Compliant Invoices", "Automated Payment Reminders"],
    features: [
      { name: "Everything in Pro Plan", included: true },
      { name: "Advanced dashboards & analytics", included: true },
      { name: "Approval Workflows", included: true },
      { name: "Custom Invoice Templates", included: true },
      { name: "Audit Trail & Activity Logs", included: true },
      { name: "Data Export & Backup", included: true },
    ],
    buttonText: "Get Started",
  },
];

export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.12 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="pricing-section"
      ref={sectionRef}
      className="min-h-screen bg-pricing-bg flex items-center justify-center py-20 px-4"
    >
      <div className="max-w-7xl mx-auto w-full">
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-gray-600 mb-8">Choose a plan that suits your business needs</p>

          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-lg ${!isYearly ? "text-black" : "text-gray-400"}`}>Monthly</span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} className="data-[state=checked]:bg-primary" />
            <span className={`text-lg ${isYearly ? "text-black" : "text-gray-500"}`}>Yearly</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={plan.name}
              className={`relative p-6 transition-all duration-500 hover:scale-105 hover:shadow-2xl min-h-[520px] ${isVisible ? "opacity-100 translate-y-0 animate-fade-in-up" : "opacity-0 translate-y-8"} ${plan.popular ? "bg-white/5 border-2 border-primary/60 ring-1 ring-primary/20" : "bg-white/4 border border-gray-200/40"
                }`}
              style={{ animationDelay: isVisible ? `${index * 0.12}s` : "0s" }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gray-800 text-white px-4 py-1 rounded-full text-sm font-medium">Popular</span>
                </div>
              )}

              {/* HEADER: name, description, price & short explain */}
              <div className="text-center mb-4">
                <div className="flex items-center gap-2 mb-2 justify-center">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-primary rounded-sm"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-black">{plan.name}</h3>
                </div>
                <p className="text-gray-600 mb-3">{plan.description}</p>

                <div className="mb-3">
                  <span className="text-4xl md:text-5xl font-bold text-black">{isYearly ? plan.yearlyPrice : plan.monthlyPrice}</span>
                  <span className="text-gray-600 ml-2">/{isYearly ? "year" : "month"}</span>
                </div>
                <p className="text-gray-700 mb-2">{plan.explain}</p>
              </div>

              {/* ===== MOVED: highlights now appear AFTER header (so name/price show first) ===== */}
              {plan.highlights && plan.highlights.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center mb-4">
                  {plan.highlights.map((h, hi) => (
                    <div key={hi} className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm shadow-sm">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-800">{h}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* FEATURES PREVIEW (first 4 shown) */}
              <div className="space-y-3 mb-4">
                {plan.features.slice(0, 4).map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {feature.included ? <Check className="w-5 h-5 text-green-600 flex-shrink-0" /> : <X className="w-5 h-5 text-red-400 flex-shrink-0" />}
                    <span className={`text-sm ${feature.included ? "text-gray-800" : "text-gray-500"}`}>{feature.name}</span>
                  </div>
                ))}

                {/* Collapsible extra features */}
                {expandedIndex === index && (
                  <div className="mt-2 space-y-3">
                    {plan.features.slice(4).map((feature, j) => (
                      <div key={j} className="flex items-center gap-3">
                        {feature.included ? <Check className="w-5 h-5 text-green-600" /> : <X className="w-5 h-5 text-red-400" />}
                        <span className={`text-sm ${feature.included ? "text-gray-800" : "text-gray-500"}`}>{feature.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Read more */}
              {plan.features.length > 4 && (
                <div className="mb-4">
                  <button onClick={() => setExpandedIndex(expandedIndex === index ? null : index)} className="text-sm underline text-primary hover:text-primary/80">
                    {expandedIndex === index ? "Show less" : `Read more (${Math.max(0, plan.features.length - 4)} more)`}
                  </button>
                </div>
              )}

              <Button className={`w-full py-3 text-sm font-medium ${plan.popular ? "bg-primary text-white" : "bg-primary text-white"}`}>
                {plan.buttonText}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
