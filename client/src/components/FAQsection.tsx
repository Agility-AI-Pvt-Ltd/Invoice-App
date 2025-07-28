import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    id: "Q1",
    question: "How do I create an invoice using the app?",
    answer: "Creating an invoice is simple! Just select a template, fill in client details, products/services, and taxes. The app auto-generates the invoice in a professional format, ready to send."
  },
  {
    id: "Q2",
    question: "Can I accept payments directly through the invoice?",
    answer: "Yes, you can integrate payment gateways to accept payments directly through your invoices. This makes it convenient for clients to pay immediately upon receiving the invoice."
  },
  {
    id: "Q3",
    question: "Is this app suitable for freelancers, startups, or large businesses?",
    answer: "Our app is designed to scale with your business. Whether you're a freelancer managing a few clients or a large enterprise with complex invoicing needs, our platform adapts to your requirements."
  },
  {
    id: "Q4",
    question: "Can I customize invoice templates?",
    answer: "Absolutely! You can fully customize invoice templates with your logo, colors, and preferred fields to match your brand."
  },
  {
    id: "Q5",
    question: "Will I get notified when a client pays?",
    answer: "Yes, you will receive instant notifications when a client views or pays an invoice, so you’re always up to date."
  },
  {
    id: "Q6",
    question: "Can I manage taxes and compliance?",
    answer: "The app supports GST and other tax calculations, and helps ensure your invoices meet legal requirements."
  },
  {
    id: "Q7",
    question: "Is my data secure?",
    answer: "We use industry-standard encryption and security practices to keep your data safe and private."
  }
];

const FAQSection = () => {
  const [openItem, setOpenItem] = useState<string | null>("Q1");

  const toggleItem = (id: string) => {
    setOpenItem(openItem === id ? null : id);
  };

  return (
    <section id="FAQsection"className="py-20 px-4 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-4">FAQs</h2>
          <p className="text-lg text-slate-300">
            Be the first to know about updates, new tools, and exclusive deals.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-0">
          {faqs.map((faq) => (
            <div key={faq.id} className="border-b border-slate-600">
              <button
                onClick={() => toggleItem(faq.id)}
                className={cn(
                  "w-full flex items-center gap-4 py-6 text-left transition-all duration-200",
                  openItem === faq.id
                    ? "border-l-4 border-purple-500 bg-slate-800/40"
                    : "hover:bg-slate-800/30"
                )}
                aria-expanded={openItem === faq.id}
                aria-controls={`faq-answer-${faq.id}`}
                id={`faq-question-${faq.id}`}
                type="button"
              >
                {/* Question Number Circle */}
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">{faq.id}</span>
                </div>

                {/* Question Text */}
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-white">
                    {faq.question}
                  </h3>
                </div>

                {/* Chevron Icon */}
                <ChevronDown 
                  className={cn(
                    "w-5 h-5 transition-transform duration-200",
                    openItem === faq.id ? "rotate-180 text-purple-400" : "text-slate-400"
                  )}
                />
              </button>

              {/* Answer */}
              <div
                id={`faq-answer-${faq.id}`}
                role="region"
                aria-labelledby={`faq-question-${faq.id}`}
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  openItem === faq.id ? "max-h-96 pb-6" : "max-h-0"
                )}
              >
                <div className="pl-16 pr-12">
                  <p className="text-slate-300 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
