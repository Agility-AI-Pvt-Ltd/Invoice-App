import { FileText, CreditCard, BarChart3, Bell, Shield, Users } from "lucide-react";

const TailorMadeFeatures = () => {
  const features = [
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Smart Invoice Creation",
      description: "Create professional invoices in seconds with customizable templates, tax fields, and automation for recurring bills."
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: "Instant Payment Tracking",
      description: "Track payments in real-time. Get notified when a client views or pays, and stay updated on outstanding dues."
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Sales & Tax Dashboard",
      description: "Get a clear view of your income, expenses, and tax liability with visual dashboards designed for fast decisions."
    },
    {
      icon: <Bell className="w-8 h-8" />,
      title: "Smart Reminders & Alerts",
      description: "Never miss a due date again. Automatically send reminders to clients and receive alerts on overdue payments."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "GST & Compliance Ready",
      description: "Easily manage GST billing and ensure all invoices meet legal requirements—PAN, GSTIN, and everything in between."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Multi-User Access Control",
      description: "Allow teams to collaborate with customized roles and permissions, keeping your data secure and organized."
    }
  ];

  return (
    <section className="py-20 px-6 lg:px-8 gradient-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Core Features That Count
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Every feature is made to make your invoicing process smooth, efficient, and stress-free - whether you're a freelancer, startup, or growing company
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <div key={index} className="text-center group">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary/20 transition-smooth">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">
                {feature.title}
              </h3>
              <p className="text-black/64 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TailorMadeFeatures;

