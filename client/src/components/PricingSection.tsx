import { useState, useEffect, useRef } from "react";
import { Check, X } from "lucide-react";
import { Button } from "./ui/button";
import { Switch } from "@/components/ui/switch";
import { Card } from "./ui/card";

interface PricingPlan {
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  explain:string;
  features: Array<{
    name: string;
    included: boolean;
  }>;
  popular?: boolean;
  buttonText: string;
}

const plans: PricingPlan[] = [
  {
    name: "Free",
    description: "Perfect plan to get started",
    monthlyPrice: 0,
    yearlyPrice: 0,
    explain:"A free plan grants you access to some cool features of Invoice App",
    features: [
      { name: "Sync across device", included: true },
      { name: "5 workspace", included: true },
      { name: "Collaborate with 5 user", included: true },
      { name: "Sharing permission", included: false },
      { name: "Admin tools", included: false },
      { name: "100+ integrations", included: false },
    ],
    buttonText: "Get Your Free Plan",
  },
  {
    name: "Pro",
    description: "Perfect plan for professionals!",
    monthlyPrice: 12,
    yearlyPrice: 120,
    explain:"For professional only! Start arranging your expenses with our best templates",
    features: [
      { name: "Everything in Free Plan", included: true },
      { name: "Unlimited workspace", included: true },
      { name: "Collaborative workspace", included: true },
      { name: "Sharing permission", included: true },
      { name: "Admin tools", included: true },
      { name: "100+ integrations", included: true },
    ],
    popular: true,
    buttonText: "Get Started",
  },
  {
    name: "Ultimate",
    description: "Best suits for great company!",
    monthlyPrice: 33,
    yearlyPrice: 330,
    explain:"If you a finance manager at big company, this plan is a perfect match",
    features: [
      { name: "Everything in Pro Plan", included: true },
      { name: "Daily performance reports", included: true },
      { name: "Dedicated assistant", included: true },
      { name: "Artificial Intelligence", included: true },
      { name: "Marketing tools & automations", included: true },
      { name: "Advanced security", included: true },
    ],
    buttonText: "Get Started",
  },
];

export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="pricing-section"
      ref={sectionRef}
      className="min-h-screen bg-pricing-bg flex items-center justify-center py-20 px-4"
    >
      <div className="max-w-7xl mx-auto">
        <div
          className={`text-center mb-12 transition-all duration-700 ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Choose a plan that suits your business needs
          </p>

          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-lg ${!isYearly ? 'text-white' : 'text-gray-400'}`}>
              Monthly
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-primary"
            />
            <span className={`text-lg ${isYearly ? 'text-white' : 'text-gray-400'}`}>
              Yearly
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={plan.name}
              className={`relative p-8 transition-all duration-500 hover:scale-105 hover:shadow-2xl ${
                isVisible
                  ? "opacity-100 translate-y-0 animate-fade-in-up"
                  : "opacity-0 translate-y-8"
              } ${
                plan.popular
                  ? "bg-pricing-card-popular border-2 border-primary transform scale-105"
                  : "bg-pricing-card border border-gray-200"
              }`}
              style={{
                animationDelay: isVisible ? `${index * 0.2}s` : "0s",
              }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gray-800 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-primary rounded-sm"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-white-900">{plan.name}</h3>
                </div>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl md:text-5xl font-bold text-white-900">
                    ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-grey-600 ml-2">
                    /{isYearly ? "year" : "month"}
                  </span>
                </div>
                <p className="text-white-600 mb-4">{plan.explain}</p>
              </div>
              

              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-pricing-feature-available flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-pricing-feature-unavailable flex-shrink-0" />
                    )}
                    <span
                      className={`text-sm ${
                        feature.included ? "text-white-900" : "text-pricing-feature-unavailable"
                      }`}
                    >
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                className={`w-full py-3 text-sm font-medium transition-all duration-200 hover:animate-scale-up ${
                  plan.popular
                    ? "bg-primary hover:bg-primary/90 text-white"
                    : "bg-primary hover:bg-primary/90 text-white"
                }`}
              >
                {plan.buttonText}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

