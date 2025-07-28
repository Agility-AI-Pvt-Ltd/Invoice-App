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
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
      <Button variant="default" size="lg" className="w-full sm:w-auto">
        Get a Free Demo
      </Button>
      <Button variant="outline" size="lg" className="w-full sm:w-auto" onClick={scrollToPricing}>
        See Pricing
      </Button>
    </div>
  );
};

export default CTAButtons;


