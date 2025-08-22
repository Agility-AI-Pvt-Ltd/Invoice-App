import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const scrollToPricing = () => {
  const pricingSection = document.getElementById('pricing-section');
  if (pricingSection) {
    pricingSection.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
};
const CTAButtons = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center ">
      <Button size="lg" className="bg-gradient-to-b from-[#B5A3FF] via-[#785FDA] to-[#9F91D8] text-white px-4 py-2 rounded-lg cursor-pointer"
        onClick={() => navigate("/login")}>
        Get Started
      </Button>
      <Button size="lg" className="w-full sm:w-auto cursor-pointer" onClick={scrollToPricing}>
        See Pricing
      </Button>
    </div>
  );
};

export default CTAButtons;


