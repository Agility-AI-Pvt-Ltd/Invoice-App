import { Button } from "@/components/ui/button";


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
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center ">
      <Button  size="lg" className="bg-gradient-to-b from-[#B5A3FF] via-[#785FDA] to-[#9F91D8] text-white px-4 py-2 rounded-lg">
        Get a Free Demo
      </Button>
      <Button size="lg" className="w-full sm:w-auto" onClick={scrollToPricing}>
        See Pricing
      </Button>
    </div>
  );
};

export default CTAButtons;


