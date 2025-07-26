import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import DashboardPreview from "@/components/DashboardPreview";
import Footer from "@/components/Footer";
import FeaturesSection from "@/components/FeatureSelection";
import TailorMadeFeatures from "@/components/TailorMadeFeatures";

const Landing = () => {
  return (
    <div className="min-h-screen gradient-background">
      <Navbar />
      <Hero />
      <DashboardPreview />
      <FeaturesSection />
      <TailorMadeFeatures />
      <Footer />
    </div>
  );
};

export default Landing;