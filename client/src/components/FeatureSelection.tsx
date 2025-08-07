// import { FileText, Send, DollarSign } from "lucide-react";

// const FeaturesSection = () => {
//   const features = [
//     {
      // icon: <FileText className="w-6 h-6" />,
//       title: "Create",
//       description: "Design invoices in seconds using smart templates. Auto-fill details, add branding, and reduce errors with an easy-to-use interface."
//     },
//     {
//       icon: <Send className="w-6 h-6" />,
//       title: "Send", 
//       description: "Share invoices instantly via email, link, or WhatsApp. Add notes, enable reminders, and get notified when they're viewed."
//     },
//     {
//       icon: <DollarSign className="w-6 h-6" />,
//       title: "Receive",
//       description: "Get paid faster with UPI or bank transfer. Invoices include a 'Pay Now' button and real-time payment updates."
//     }
//   ];

//   return (
//     <section className="py-20 px-6 lg:px-8">
//       <div className="max-w-7xl mx-auto">
//         <div className="text-center mb-16">
//           <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
//             Smarter Invoicing Starts Here
//           </h2>
//           <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
//             From creation to collection, manage your entire invoicing journey in a clean, intuitive dashboard.
//           </p>
//         </div>

//         <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
//           {/* Features List */}
//           <div className="space-y-8">
//             {features.map((feature, index) => (
//               <div key={index} className="flex items-start space-x-4">
//                 <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground">
//                   {feature.icon}
//                 </div>
//                 <div>
//                   <h3 className="text-xl font-semibold text-foreground mb-2">
//                     {feature.title}
//                   </h3>
//                   <p className="text-muted-foreground leading-relaxed">
//                     {feature.description}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Invoice Preview Mockup */}
//             <div className="relative transition-transform duration-300 hover:scale-105">
//             <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
//               <div className="flex items-center justify-between mb-6">
//                 <div className="flex items-center space-x-2">
//                   <div className="w-10 h-10 rounded-lg overflow-hidden">
//                     <img
//                       src="/agility.jpg"
//                       alt="Agility Logo"
//                       className="w-full h-full object-cover"
//                     />
//                   </div>
//                   <span className="font-semibold text-foreground">AgilityAI</span>
//                 </div>
//                 <div className="flex items-center space-x-2 text-sm">
//                   <div className="w-4 h-4 bg-green-500 rounded-full"></div>
//                   <span className="text-foreground font-medium">Verified</span>
//                 </div>
//               </div>

//               <div className="space-y-4 mb-6">
//                 <div className="bg-accent/20 rounded-lg p-4">
//                   <div className="text-sm text-muted-foreground mb-1">Invoice Date</div>
//                   <div className="text-foreground font-medium">March 15, 2024</div>
//                 </div>
//                 <div className="bg-accent/20 rounded-lg p-4">
//                   <div className="text-sm text-muted-foreground mb-1">Due Date</div>
//                   <div className="text-foreground font-medium">April 15, 2024</div>
//                 </div>
//               </div>

//               <div className="border-t border-border pt-4">
//                 <div className="flex justify-between items-center">
//                   <span className="text-muted-foreground">Total Amount</span>
//                   <span className="text-2xl font-bold text-primary">₹12,500</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//         </div>
//       </div>
//     </section>
//   );
// };

// export default FeaturesSection;



// import { FileText, Send, DollarSign } from "lucide-react";
import StickyScrollRevealDemo from "@/components/ui/sticky-scroll-reveal-demo";

const FeaturesSection = () => {

  return (
    <section className="py-20 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-20 items-center mb-0">
        </div> */}
        {/* Interactive Features Showcase */}
        <div className="text-center mb-16">
           <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
             Smarter Invoicing Starts Here
           </h2>
           <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
             From creation to collection, manage your entire invoicing journey in a clean, intuitive dashboard.
          </p>
        </div>
        <StickyScrollRevealDemo />
      </div>
    </section>
  );
};

export default FeaturesSection;