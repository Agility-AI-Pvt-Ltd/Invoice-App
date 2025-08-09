import { SalesStatsCard } from "@/components/SalesStatsCard";
import { SalesPerformanceChart } from "@/components/SalesPerformanceChart";
import { RegionalSalesChart } from "@/components/RegionalSalesCard";
import { SalesTable } from "@/components/SalesTable";
import { getSalesStats } from "@/lib/mock/salesData";

const Sales = () => {
  const stats = getSalesStats();

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 lg:p-6">
      <div className="max-w-8xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="mb-4 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Hello A</h1>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <SalesPerformanceChart />
          <RegionalSalesChart />
        </div>
        
        {/* Sales Table */}
        <SalesTable />
      </div>
    </div>
  );
};

export default Sales;