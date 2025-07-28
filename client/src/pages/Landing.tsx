import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import DashboardPreview from "@/components/DashboardPreview";
import Footer from "@/components/Footer";
import FeaturesSection from "@/components/FeatureSelection";
import TailorMadeFeatures from "@/components/TailorMadeFeatures";
import PricingSection from "@/components/PricingSection";
import TestimonialSection from "@/components/TestimonialSection";
import FAQSection from "@/components/FAQsection";

const Landing = () => {
  useEffect(() => {
    document.body.classList.add("landing");
    return () => document.body.classList.remove("landing");
  }, []);
  return (
    <div className="min-h-screen gradient-background">
      <Navbar />
      <Hero />
      <DashboardPreview />
      <FeaturesSection />
      <TailorMadeFeatures />
      <PricingSection />                
      <TestimonialSection/>
      <FAQSection/>
      <Footer />
    </div>
  );
};

export default Landing;