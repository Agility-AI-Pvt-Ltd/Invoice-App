import CTAButtons from "./CTAButtons";

const Hero = () => {
  return (
    <section className="pt-32 pb-20 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
            One app for all your billing needs,{" "}
            <span className="block">made for every business.</span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Create, manage, and track invoices effortlessly—
            <span className="block">whether you're a freelancer, startup, or enterprise.</span>
          </p>
          
          <CTAButtons />
        </div>
      </div>
    </section>
  );
};

export default Hero;