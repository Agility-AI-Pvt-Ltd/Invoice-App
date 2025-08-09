import { Card, CardContent } from "@/components/ui/card";
import { CometCard } from "./ui/comet-card";

const CoreFeatures = () => {
  const features = [
    {
      title: "Instant Credit & Debit Notes",
      description: "Handle refunds, adjustments, and partial payments with easy-to-generate credit and debit notes.",
      image: "public/gauge.png",
      alt: "Gauge meter for credit and debit tracking"
    },
    {
      title: "AI-Analytics & Dashboards",
      description: "Access real-time reports on income, expenses, taxes, and outstanding balances—all from one intuitive dashboard.",
      image: "public/ai-chip.png",
      alt: "AI chip for analytics and dashboards"
    },
    {
      title: "Inventory Management",
      description: "Track products and services, monitor stock levels, and set inclusive tax pricing to avoid manual errors.",
      image: "public/coin.png",
      alt: "Coins representing inventory management"
    },
    {
      title: "UPI-Integrated Payments",
      description: "Accept fast, secure UPI payments directly from your invoices.",
      image: "public/files.png",
      alt: "Mobile payment interface"
    }
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center mb-12 sm:mb-16">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6">
              Core Features That Count
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Every feature is made to make your invoicing process smooth, efficient, and stress-free whether you're a freelancer, startup, or growing company.
            </p>
          </div>
          <div className="relative">
            <CometCard>
            <img
              src={"dashboard.jpeg"}
              alt="Dashboard interface showing analytics and reports"
              className="w-full h-auto rounded-xl sm:rounded-2xl shadow-elegant"
            />
            </CometCard>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="p-4 sm:p-6 lg:p-8 group hover-scale">
              <CardContent className="p-0 space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground mb-3 sm:mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                <div className="flex justify-center">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-60 lg:h-40 rounded-xl sm:rounded-2xl overflow-hidden">
                    <img
                      src={feature.image}
                      alt={feature.alt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoreFeatures;