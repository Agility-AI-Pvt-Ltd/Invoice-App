"use client";

import { motion } from "framer-motion";
import BackgroundGradient from "@/components/ui/BackgroundGradient";
import { ContainerScroll } from "@/components/ui/ContainerScroll";

const DashboardPreview = () => {
  return (
    <section className="pb-12 sm:pb-16 md:pb-20 pt-0 px-4 sm:px-6 lg:px-8">

<ContainerScroll>
<BackgroundGradient
            className="rounded-xl sm:rounded-2xl"
            containerClassName="rounded-xl sm:rounded-2xl"

          >
             <motion.div
              initial={{ opacity: 2, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-card border border-border rounded-xl sm:rounded-2xl shadow-card overflow-hidden transition-all duration-700 hover:shadow-xl hover:scale-[1.01]"

            >
              <div className="relative">
            {/* <CometCard> */}
            <img
              src={"dashboard.jpeg"}
              alt="Dashboard interface showing analytics and reports"
              className="w-full h-auto rounded-xl sm:rounded-2xl shadow-elegant"
            />
            {/* </CometCard> */}
          </div>
              
      {/* <div className="max-w-7xl mx-auto">
        <ContainerScroll>
          
           
              <div className="bg-black border-b border-border p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden">
                      <img
                        src="/agility.jpg"
                        alt="Agility Logo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-white font-semibold text-sm sm:text-base">
                      Invoice App
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-muted rounded-full"></div>
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        Welcome! Shreya
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row">
                <div className="w-full lg:w-64 bg-black border-r border-border p-3 sm:p-4">
                  <div className="grid grid-cols-2 lg:grid-cols-1 gap-1 sm:gap-2">
                    {[
                      "Dashboard",
                      "My Customers",
                      "Invoices",
                      "Products/Services",
                      "Inventory",
                      "Sales & Revenue",
                      "Expenses/Purchases",
                      "Tax Summary",
                      "Accountants",
                      "Team/Employees",
                      "Reminders",
                      "Settings",
                    ].map((item, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded-lg text-xs sm:text-sm transition-smooth ${
                          index === 0
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        }`}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex-1 p-3 sm:p-4 md:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
                    {["Total Sales", "Total Expenses", "Net Profit", "Tax Liability"].map(
                      (label, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.2 }}
                          className="bg-black rounded-lg p-3 sm:p-4 shadow hover:shadow-md transition-all duration-500"
                        >
                          <div className="text-xs sm:text-sm text-white mb-1">{label}</div>
                          <div className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                            ₹ 23,345
                          </div>
                          <div className="flex items-center mt-2">
                            <div
                              className={`w-12 sm:w-16 h-6 sm:h-8 rounded ${
                                index === 1
                                  ? "bg-red-500/20"
                                  : "bg-green-500/20"
                              }`}
                            ></div>
                          </div>
                        </motion.div>
                      )
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-black rounded-lg p-4 sm:p-6">
                      <h3 className="text-base sm:text-lg text-white mb-3 sm:mb-4">Sales Report</h3>
                      <div className="h-32 sm:h-40 md:h-48 bg-background-secondary rounded-lg flex items-center justify-center">
                        <div className="w-full h-24 sm:h-32 bg-primary/10 rounded flex items-end justify-center space-x-1 sm:space-x-2">
                          {[40, 60, 30, 80, 50, 90, 45, 70].map((height, i) => (
                            <motion.div
                              key={i}
                              initial={{ height: 0 }}
                              animate={{ height: `${height}%` }}
                              transition={{ duration: 0.6, delay: i * 0.1 }}
                              className="bg-primary rounded-t w-3 sm:w-6"
                            ></motion.div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-black rounded-lg p-4 sm:p-6">
                      <h3 className="text-base sm:text-lg text-white mb-3 sm:mb-4">Top Products</h3>
                      <div className="h-32 sm:h-40 md:h-48 flex items-center justify-center">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full border-4 sm:border-8 border-primary relative animate-spin-slow">
                          <div className="absolute inset-0 rounded-full border-4 sm:border-8 border-blue-500 rotate-45"></div>
                          <div className="absolute inset-0 rounded-full border-4 sm:border-8 border-green-500 rotate-90"></div>
                          <div className="absolute inset-0 rounded-full border-4 sm:border-8 border-yellow-500 rotate-180"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          
        
      </div> */}
      </motion.div>
      </BackgroundGradient>
      </ContainerScroll>
    </section>
  );
};

export default DashboardPreview;
