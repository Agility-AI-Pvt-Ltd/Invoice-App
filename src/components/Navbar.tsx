

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
    { name: "About Us", link: "#about" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
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
          <div className="flex items-center gap-3">
            <div className="w-12 h-10 rounded-lg overflow-hidden">
              <img
                src="/agility.jpg"
                alt="Agility Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-xl font-bold">Invoice App</h3>
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

