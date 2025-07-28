import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const navigate = useNavigate();

  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing-section');
    if (pricingSection) {
      pricingSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };
  const scrollToFAQ = () => {
    const FAQsection = document.getElementById('FAQsection');
    if (FAQsection) {
      FAQsection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };
  const scrollTotestimonials = () => {
    const testimonialsection = document.getElementById('tesimonialsection');
    if (testimonialsection) {
      testimonialsection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };
  const scrollToHero = () => {
    const herosection = document.getElementById('herosection');
    if (herosection) {
      herosection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-2">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 ml-[-150px] cursor-pointer" onClick={scrollToHero}>
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              <img
                src="/agility.jpg"
                alt="Agility Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xl font-semibold text-foreground">Invoice App</span>
            <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-1 rounded-full">
              Powered by AgilityAI
            </span>
          </div>


          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-10">
            <div className="w-full flex justify-center px-50">

              <div className="flex items-center space-x-10">
                {/* Products Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center space-x-1 text-foreground hover:text-primary transition-smooth focus:outline-none">
                    <span>Features</span>
                    <ChevronDown className="w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-card border border-border shadow-card">
                    <DropdownMenuItem className="text-foreground hover:bg-accent focus:bg-accent cursor-pointer">
                      Invoice Generator
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-foreground hover:bg-accent focus:bg-accent cursor-pointer">
                      Expense Tracker
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-foreground hover:bg-accent focus:bg-accent cursor-pointer">
                      Payment Processing
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-foreground hover:bg-accent focus:bg-accent cursor-pointer">
                      Analytics Dashboard
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>


                <button className="text-foreground hover:text-primary transition-smooth" onClick={scrollToPricing}>
                  Pricing
                </button>
                <button className="text-foreground hover:text-primary transition-smooth" onClick={scrollToFAQ}>
                  FAQs
                </button>
                <button className="text-foreground hover:text-primary transition-smooth" onClick={scrollTotestimonials}>
                  Testimonials
                </button>
                

                {/* Company Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center space-x-1 text-foreground hover:text-primary transition-smooth focus:outline-none">
                    <span>Company</span>
                    <ChevronDown className="w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48 bg-card border border-border shadow-card">
                    <DropdownMenuItem className="text-foreground hover:bg-accent focus:bg-accent cursor-pointer">
                      About Us
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-foreground hover:bg-accent focus:bg-accent cursor-pointer">
                      Careers
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-foreground hover:bg-accent focus:bg-accent cursor-pointer">
                      Contact
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-foreground hover:bg-accent focus:bg-accent cursor-pointer">
                      Blog
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-foreground hover:bg-accent focus:bg-accent cursor-pointer">
                      Press Kit
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex px-2 py-4">
              <div className="ml-auto flex gap-6">
                <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate('/signup')}>
                  Signup
                </Button>
              </div>
            </div>
            
          </div> 


          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="outline" size="sm">
              Menu
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;