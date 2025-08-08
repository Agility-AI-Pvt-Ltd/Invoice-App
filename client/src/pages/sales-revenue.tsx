import { SalesStatsCard } from "@/components/SalesStatsCard";
import { SalesPerformanceChart } from "@/components/SalesPerformanceChart";
import { RegionalSalesChart } from "@/components/RegionalSalesCard";
import { SalesTable } from "@/components/SalesTable";
import { getSalesStats } from "@/lib/mock/salesData";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import SalesForm from "@/components/sales-form/SalesForm";

const Sales = () => {
  const stats = getSalesStats();
  const [isSalesFormOpen, setIsSalesFormOpen] = useState(false);

  if (isSalesFormOpen) {
    return (
      <Card className="w-full p-4 sm:p-6 bg-white mx-2 sm:mx-4 ">
        <p className="font-semibold text-2xl ">Create Purchase Form</p>
        <CardContent className="mt-2">
          <SalesForm onCancel={() => setIsSalesFormOpen(false)} />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-8xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Hello A</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SalesStatsCard
            title="Total Sales"
            value={stats.totalSales}
            changePercentage={stats.totalSalesChange}
            chartColor="blue"
          />
          <SalesStatsCard
            title="Current Month Sales"
            value={stats.currentMonthSales}
            changePercentage={stats.currentMonthChange}
            chartColor="red"
          />
          <SalesStatsCard
            title="Average Order Value"
            value={stats.averageOrderValue}
            changePercentage={stats.averageOrderChange}
            chartColor="green"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SalesPerformanceChart />
          <RegionalSalesChart />
        </div>

        {/* Sales Table */}
        <SalesTable setIsSalesFormOpen={setIsSalesFormOpen} />
      </div>
    </div>
  );
};

export default Sales;