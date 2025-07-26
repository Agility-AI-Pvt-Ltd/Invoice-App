const DashboardPreview = () => {
    return (
      <section className="pb-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative">
            {/* Dashboard mockup */}
            <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
              {/* Dashboard header */}
              <div className="bg-background-secondary border-b border-border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-lg overflow-hidden">
                  <img
                    src="/agility.jpg"
                    alt="Agility Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                    <span className="text-foreground font-semibold">Invoice App</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-muted rounded-full"></div>
                      <span className="text-sm text-muted-foreground">Welcome! Shreya</span>
                    </div>
                  </div>
                </div>
              </div>
  
              {/* Dashboard content */}
              <div className="flex">
                {/* Sidebar */}
                <div className="w-64 bg-background-secondary border-r border-border p-4">
                  <div className="space-y-2">
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
                      "Settings"
                    ].map((item, index) => (
                      <div 
                        key={index}
                        className={`p-2 rounded-lg text-sm transition-smooth ${
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
  
                {/* Main content */}
                <div className="flex-1 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                      { label: "Total Sales", value: "₹ 23,345", trend: "up" },
                      { label: "Total Expenses", value: "₹ 23,345", trend: "down" },
                      { label: "Net Profit", value: "₹ 23,345", trend: "up" },
                      { label: "Tax Liability", value: "₹ 23,345", trend: "up" }
                    ].map((stat, index) => (
                      <div key={index} className="bg-background-tertiary rounded-lg p-4">
                        <div className="text-sm text-muted-foreground mb-1">{stat.label}</div>
                        <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                        <div className="flex items-center mt-2">
                          <div className={`w-16 h-8 rounded ${stat.trend === 'up' ? 'bg-green-500/20' : 'bg-red-500/20'}`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Sales Report Chart */}
                    <div className="bg-background-tertiary rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-4">Sales Report</h3>
                      <div className="h-48 bg-background-secondary rounded-lg flex items-center justify-center">
                        <div className="w-full h-32 bg-primary/10 rounded flex items-end justify-center space-x-2">
                          {[40, 60, 30, 80, 50, 90, 45, 70].map((height, i) => (
                            <div 
                              key={i} 
                              className="bg-primary rounded-t w-6" 
                              style={{ height: `${height}%` }}
                            ></div>
                          ))}
                        </div>
                      </div>
                    </div>
  
                    {/* Top Products Chart */}
                    <div className="bg-background-tertiary rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-4">Top Products</h3>
                      <div className="h-48 flex items-center justify-center">
                        <div className="w-32 h-32 rounded-full border-8 border-primary relative">
                          <div className="absolute inset-0 rounded-full border-8 border-blue-500 rotate-45"></div>
                          <div className="absolute inset-0 rounded-full border-8 border-green-500 rotate-90"></div>
                          <div className="absolute inset-0 rounded-full border-8 border-yellow-500 rotate-180"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };
  
  export default DashboardPreview;