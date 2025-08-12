import StickyScrollRevealDemo from "@/components/ui/sticky-scroll-reveal-demo";

const FeaturesSection = () => {

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Interactive Features Showcase */}
        <div className="text-center mb-12 sm:mb-16">
           <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6">
             Smarter Invoicing Starts Here
           </h2>
           <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
             From creation to collection, manage your entire invoicing journey in a clean, intuitive dashboard.
          </p>
        </div>
        <StickyScrollRevealDemo />
      </div>
    </section>
  );
};

export default FeaturesSection;