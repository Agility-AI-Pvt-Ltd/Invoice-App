// import { Button } from "@/components/ui/button";
// import { useNavigate } from "react-router-dom";
// import { ChevronDown } from "lucide-react";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";

// const Navbar = () => {
//   const navigate = useNavigate();

//   const scrollToPricing = () => {
//     const pricingSection = document.getElementById('pricing-section');
//     if (pricingSection) {
//       pricingSection.scrollIntoView({ 
//         behavior: 'smooth',
//         block: 'start'
//       });
//     }
//   };
//   const scrollToFAQ = () => {
//     const FAQsection = document.getElementById('FAQsection');
//     if (FAQsection) {
//       FAQsection.scrollIntoView({ 
//         behavior: 'smooth',
//         block: 'start'
//       });
//     }
//   };
//   const scrollTotestimonials = () => {
//     const testimonialsection = document.getElementById('tesimonialsection');
//     if (testimonialsection) {
//       testimonialsection.scrollIntoView({ 
//         behavior: 'smooth',
//         block: 'start'
//       });
//     }
//   };
//   const scrollToHero = () => {
//     const herosection = document.getElementById('herosection');
//     if (herosection) {
//       herosection.scrollIntoView({ 
//         behavior: 'smooth',
//         block: 'start'
//       });
//     }
//   };
// // border-b border-border
//   return (
//     <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md">
//       <div className="max-w-7xl mx-auto px-6 lg:px-2">
//         <div className="flex items-center justify-between h-16">
//           {/* Logo */}
//           <div className="flex items-center space-x-2 ml-[-150px] cursor-pointer" onClick={scrollToHero}>
//             <div className="w-8 h-8 rounded-lg overflow-hidden">
//               <img
//                 src="/agility.jpg"
//                 alt="Agility Logo"
//                 className="w-full h-full object-cover"
//               />
//             </div>
//             <span className="text-xl font-semibold text-foreground">Agility AI Invoicely</span>
//             <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-1 rounded-full">
//               Powered by AgilityAI
//             </span>
//           </div>


//           {/* Navigation Links */}
//           <div className="hidden md:flex items-center space-x-10">
//             <div className="w-full flex justify-center px-50">

//               <div className="flex items-center space-x-10">
//                 {/* Features Dropdown */}
//                 <DropdownMenu>
//                   <DropdownMenuTrigger className="flex items-center space-x-1 text-foreground hover:text-primary transition-smooth focus:outline-none">
//                     <span>Features</span>
//                     <ChevronDown className="w-4 h-4 " />
//                   </DropdownMenuTrigger>
//                   <DropdownMenuContent className="w-56 bg-card border border-border shadow-card ">
//                     <DropdownMenuItem className="text-foreground hover:bg-accent focus:bg-accent cursor-pointer">
//                       Invoice Generator
//                     </DropdownMenuItem>
//                     <DropdownMenuItem className="text-foreground hover:bg-accent focus:bg-accent cursor-pointer">
//                       Expense Tracker
//                     </DropdownMenuItem>
//                     <DropdownMenuItem className="text-foreground hover:bg-accent focus:bg-accent cursor-pointer">
//                       Payment Processing
//                     </DropdownMenuItem>
//                     <DropdownMenuItem className="text-foreground hover:bg-accent focus:bg-accent cursor-pointer">
//                       Analytics Dashboard
//                     </DropdownMenuItem>
//                   </DropdownMenuContent>
//                 </DropdownMenu>


//                 <button className="text-foreground hover:text-primary transition-smooth" onClick={scrollToPricing}>
//                   Pricing
//                 </button>
//                 <button className="text-foreground hover:text-primary transition-smooth" onClick={scrollToFAQ}>
//                   FAQs
//                 </button>
//                 <button className="text-foreground hover:text-primary transition-smooth" onClick={scrollTotestimonials}>
//                   Testimonials
//                 </button>
                

//                 {/* Company Dropdown */}
//                 <DropdownMenu>
//                   <DropdownMenuTrigger className="flex items-center space-x-1 text-foreground hover:text-primary transition-smooth focus:outline-none">
//                     <span>Company</span>
//                     <ChevronDown className="w-4 h-4" />
//                   </DropdownMenuTrigger>
//                   <DropdownMenuContent className="w-48 bg-card border border-border shadow-card">
//                     <DropdownMenuItem className="text-foreground hover:bg-accent focus:bg-accent cursor-pointer">
//                       About Us
//                     </DropdownMenuItem>
//                     <DropdownMenuItem className="text-foreground hover:bg-accent focus:bg-accent cursor-pointer">
//                       Careers
//                     </DropdownMenuItem>
//                     <DropdownMenuItem className="text-foreground hover:bg-accent focus:bg-accent cursor-pointer">
//                       Contact
//                     </DropdownMenuItem>
//                     <DropdownMenuItem className="text-foreground hover:bg-accent focus:bg-accent cursor-pointer">
//                       Blog
//                     </DropdownMenuItem>
//                     <DropdownMenuItem className="text-foreground hover:bg-accent focus:bg-accent cursor-pointer">
//                       Press Kit
//                     </DropdownMenuItem>
//                   </DropdownMenuContent>
//                 </DropdownMenu>
//               </div>
//             </div>

//             <div className="flex px-2 py-4">
//               <div className="ml-auto flex gap-6">
//                 <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
//                   Login
//                 </Button>
//                 <Button variant="outline" size="sm" onClick={() => navigate('/signup')}>
//                   Signup
//                 </Button>
//               </div>
//             </div>
            
//           </div> 


//           {/* Mobile menu button */}
//           <div className="md:hidden">
//             <Button variant="outline" size="sm">
//               Menu
//             </Button>
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;






// import { Button } from "@/components/ui/button";
// import { useNavigate } from "react-router-dom";
// import { ChevronDown } from "lucide-react";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { useEffect, useState } from "react";
// import clsx from "clsx";

// const Navbar = () => {
//   const navigate = useNavigate();
//   const [scrolled, setScrolled] = useState(false);

//   useEffect(() => {
//     const handleScroll = () => {
//       setScrolled(window.scrollY > 30);
//     };
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   const scrollTo = (id: string) => {
//     document.getElementById(id)?.scrollIntoView({
//       behavior: 'smooth',
//       block: 'start'
//     });
//   };

//   return (
//     <>
//       <nav
//         className={clsx(
//           "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
//           scrolled
//             ? "bg-[#0c0c1f]/80 backdrop-blur-md shadow-md border-b border-white/10"
//             : "bg-transparent"
//         )}
//       >
//         <div className="max-w-7xl mx-auto px-6 lg:px-2">
//           <div className="flex items-center justify-between h-16">
//             {/* Logo */}
//             <div
//               className="flex items-center space-x-2 cursor-pointer"
//               onClick={() => scrollTo('herosection')}
//             >
//               <div className="w-8 h-8 rounded-lg overflow-hidden">
//                 <img
//                   src="/agility.jpg"
//                   alt="Agility Logo"
//                   className="w-full h-full object-cover"
//                 />
//               </div>
//               <span className="text-xl font-semibold text-white">Agility AI Invoicely</span>
//               <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-1 rounded-full">
//                 Powered by AgilityAI
//               </span>
//             </div>

//             {/* Navigation Links */}
//             <div className="hidden md:flex items-center space-x-10">
//               {/* Features Dropdown */}
//               <DropdownMenu>
//                 <DropdownMenuTrigger className="flex items-center space-x-1 text-white hover:text-primary transition-all focus:outline-none">
//                   <span>Features</span>
//                   <ChevronDown className="w-4 h-4" />
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent className="w-56 bg-card border border-border shadow-card">
//                   <DropdownMenuItem className="text-foreground hover:bg-accent cursor-pointer">Invoice Generator</DropdownMenuItem>
//                   <DropdownMenuItem className="text-foreground hover:bg-accent cursor-pointer">Expense Tracker</DropdownMenuItem>
//                   <DropdownMenuItem className="text-foreground hover:bg-accent cursor-pointer">Payment Processing</DropdownMenuItem>
//                   <DropdownMenuItem className="text-foreground hover:bg-accent cursor-pointer">Analytics Dashboard</DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>

//               <button className="text-white hover:text-primary transition-all" onClick={() => scrollTo("pricing-section")}>
//                 Pricing
//               </button>
//               <button className="text-white hover:text-primary transition-all" onClick={() => scrollTo("FAQsection")}>
//                 FAQs
//               </button>
//               <button className="text-white hover:text-primary transition-all" onClick={() => scrollTo("tesimonialsection")}>
//                 Testimonials
//               </button>

//               {/* Company Dropdown */}
//               <DropdownMenu>
//                 <DropdownMenuTrigger className="flex items-center space-x-1 text-white hover:text-primary transition-all focus:outline-none">
//                   <span>Company</span>
//                   <ChevronDown className="w-4 h-4" />
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent className="w-48 bg-card border border-border shadow-card">
//                   <DropdownMenuItem className="text-foreground hover:bg-accent cursor-pointer">About Us</DropdownMenuItem>
//                   <DropdownMenuItem className="text-foreground hover:bg-accent cursor-pointer">Careers</DropdownMenuItem>
//                   <DropdownMenuItem className="text-foreground hover:bg-accent cursor-pointer">Contact</DropdownMenuItem>
//                   <DropdownMenuItem className="text-foreground hover:bg-accent cursor-pointer">Blog</DropdownMenuItem>
//                   <DropdownMenuItem className="text-foreground hover:bg-accent cursor-pointer">Press Kit</DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>

//               {/* Auth Buttons */}
//               <div className="ml-6 flex gap-4">
//                 <Button variant="outline" size="sm" onClick={() => navigate('/login')}>Login</Button>
//                 <Button variant="outline" size="sm" onClick={() => navigate('/signup')}>Signup</Button>
//               </div>
//             </div>

//             {/* Mobile Menu Placeholder */}
//             <div className="md:hidden">
//               <Button variant="outline" size="sm">Menu</Button>
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* Optional: Blur gradient below navbar */}
//       <div className="fixed top-16 left-0 right-0 h-4 bg-gradient-to-b from-black/30 to-transparent z-40 pointer-events-none" />
//     </>
//   );
// };

// export default Navbar;


// import { Button } from "@/components/ui/button";
// import { useNavigate } from "react-router-dom";
// import { ChevronDown, Menu } from "lucide-react";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { useEffect, useState } from "react";
// import clsx from "clsx";

// const Navbar = () => {
//   const navigate = useNavigate();
//   const [scrolled, setScrolled] = useState(false);

//   useEffect(() => {
//     const handleScroll = () => {
//       setScrolled(window.scrollY > 30);
//     };
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   const scrollTo = (id: string) => {
//     document.getElementById(id)?.scrollIntoView({
//       behavior: "smooth",
//       block: "start",
//     });
//   };

//   return (
//     <>
//       <nav
//         className={clsx(
//           "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
//           scrolled
//             ? "bg-[#0c0c1f]/80 backdrop-blur-md shadow-md border-b border-white/10"
//             : "bg-transparent"
//         )}
//       >
//         <div className="max-w-7xl mx-auto px-4 lg:px-6">
//           <div className="flex items-center justify-between h-16">
//             {/* Logo */}
//             <div
//               className="flex items-center space-x-2 cursor-pointer"
//               onClick={() => scrollTo("herosection")}
//             >
//               <div className="w-8 h-8 rounded-lg overflow-hidden">
//                 <img
//                   src="/agility.jpg"
//                   alt="Agility Logo"
//                   className="w-full h-full object-cover"
//                 />
//               </div>
//               <span className="text-xl font-semibold text-white">Agility AI Invoicely</span>
//               <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-1 rounded-full">
//                 Powered by AgilityAI
//               </span>
//             </div>

//             {/* Desktop Nav */}
//             <div className="hidden md:flex items-center space-x-8">
//               {/* Features Dropdown */}
//               <DropdownMenu>
//                 <DropdownMenuTrigger className="flex items-center space-x-1 text-white hover:text-primary transition-all focus:outline-none">
//                   <span>Features</span>
//                   <ChevronDown className="w-4 h-4" />
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent className="w-56 bg-card border border-border shadow-card">
//                   <DropdownMenuItem className="text-foreground hover:bg-accent cursor-pointer">
//                     Invoice Generator
//                   </DropdownMenuItem>
//                   <DropdownMenuItem className="text-foreground hover:bg-accent cursor-pointer">
//                     Expense Tracker
//                   </DropdownMenuItem>
//                   <DropdownMenuItem className="text-foreground hover:bg-accent cursor-pointer">
//                     Payment Processing
//                   </DropdownMenuItem>
//                   <DropdownMenuItem className="text-foreground hover:bg-accent cursor-pointer">
//                     Analytics Dashboard
//                   </DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>

//               <button
//                 className="text-white hover:text-primary transition-all"
//                 onClick={() => scrollTo("pricing-section")}
//               >
//                 Pricing
//               </button>
//               <button
//                 className="text-white hover:text-primary transition-all"
//                 onClick={() => scrollTo("FAQsection")}
//               >
//                 FAQs
//               </button>
//               <button
//                 className="text-white hover:text-primary transition-all"
//                 onClick={() => scrollTo("tesimonialsection")}
//               >
//                 Testimonials
//               </button>

//               {/* Company Dropdown */}
//               <DropdownMenu>
//                 <DropdownMenuTrigger className="flex items-center space-x-1 text-white hover:text-primary transition-all focus:outline-none">
//                   <span>Company</span>
//                   <ChevronDown className="w-4 h-4" />
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent className="w-48 bg-card border border-border shadow-card">
//                   <DropdownMenuItem className="text-foreground hover:bg-accent cursor-pointer">
//                     About Us
//                   </DropdownMenuItem>
//                   <DropdownMenuItem className="text-foreground hover:bg-accent cursor-pointer">
//                     Careers
//                   </DropdownMenuItem>
//                   <DropdownMenuItem className="text-foreground hover:bg-accent cursor-pointer">
//                     Contact
//                   </DropdownMenuItem>
//                   <DropdownMenuItem className="text-foreground hover:bg-accent cursor-pointer">
//                     Blog
//                   </DropdownMenuItem>
//                   <DropdownMenuItem className="text-foreground hover:bg-accent cursor-pointer">
//                     Press Kit
//                   </DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>

//               {/* Auth Buttons */}
//               <div className="ml-6 flex gap-4">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => navigate("/login")}
//                 >
//                   Login
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => navigate("/signup")}
//                 >
//                   Signup
//                 </Button>
//               </div>
//             </div>

//             {/* Mobile Menu */}
//             <div className="md:hidden">
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Button variant="ghost" size="icon">
//                     <Menu className="w-5 h-5 text-white" />
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent className="w-60 bg-card border border-border shadow-card p-2">
//                   <DropdownMenuItem onClick={() => scrollTo("pricing-section")}>
//                     Pricing
//                   </DropdownMenuItem>
//                   <DropdownMenuItem onClick={() => scrollTo("FAQsection")}>
//                     FAQs
//                   </DropdownMenuItem>
//                   <DropdownMenuItem onClick={() => scrollTo("tesimonialsection")}>
//                     Testimonials
//                   </DropdownMenuItem>
//                   <DropdownMenuItem>About Us</DropdownMenuItem>
//                   <DropdownMenuItem>Careers</DropdownMenuItem>
//                   <DropdownMenuItem>Contact</DropdownMenuItem>
//                   <DropdownMenuItem>Blog</DropdownMenuItem>
//                   <DropdownMenuItem>Press Kit</DropdownMenuItem>
//                   <DropdownMenuItem onClick={() => navigate("/login")}>
//                     Login
//                   </DropdownMenuItem>
//                   <DropdownMenuItem onClick={() => navigate("/signup")}>
//                     Signup
//                   </DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* Optional visual blur below navbar */}
//       <div className="fixed top-16 left-0 right-0 h-4 bg-gradient-to-b from-black/30 to-transparent z-40 pointer-events-none" />
//     </>
//   );
// };

// export default Navbar;




import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const NavbarUpdated = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { name: "Features", link: "#features" },
    { name: "Pricing", link: "#pricing-section" },
    { name: "FAQs", link: "#FAQsection" },
    { name: "Testimonials", link: "#tesimonialsection" },
    { name: "Contact Us", link: "#contact" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    if (id === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        scrolled ? "bg-white/80 backdrop-blur-md shadow-md" : "bg-transparent"
      }`}
    >
      <Navbar>
        {/* Desktop View */}
        <NavBody>
          <div className="flex items-center gap-3" onClick={() => scrollTo("top")}>
            <div className="w-12 h-10 rounded-lg overflow-hidden">
              <img
                src="/agility.jpg"
                alt="Agility Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-xl font-bold">Agility AI Invoicely</h3>
              <p className="text-sm text-slate-400">Powered by AgilityAI</p>
            </div>
          </div>

          <NavItems
            items={navItems.map((item) => ({
              name: item.name,
              link: item.link,
            }))}
          />

          <div className="flex items-center gap-4">
            <NavbarButton onClick={() => navigate("/login")}>Login</NavbarButton>
            <NavbarButton
              onClick={() => navigate("/signup")}
              className="bg-gradient-to-b from-[#B5A3FF] via-[#785FDA] to-[#9F91D8] text-white px-4 py-2 rounded-lg"
            >
              Signup
            </NavbarButton>
          </div>
        </NavBody>

        {/* Mobile View */}
        <MobileNav>
          <MobileNavHeader>
            <div className="flex items-center gap-2">
              <NavbarLogo />
              <span className="text-xs text-gray-100 bg-primary/10 px-2 py-1 rounded-full">
                Powered by AgilityAI
              </span>
            </div>
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => {
                  scrollTo(item.link.replace("#", ""));
                  setIsMobileMenuOpen(false);
                }}
                className="relative text-black dark:text-white w-full py-2"
              >
                {item.name}
              </a>
            ))}
            <div className="flex w-full flex-col gap-4 mt-4">
              <NavbarButton
                onClick={() => {
                  navigate("/login");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full"
              >
                Login
              </NavbarButton>
              <NavbarButton
                onClick={() => {
                  navigate("/signup");
                  setIsMobileMenuOpen(false);
                }}
                variant="primary"
                className="w-full"
              >
                Signup
              </NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
};

export default NavbarUpdated;

