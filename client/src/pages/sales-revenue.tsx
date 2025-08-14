// app/(routes)/sales/page.tsx  (or wherever this component lives)
import { useEffect, useState } from "react";
import { SalesStatsCard } from "@/components/SalesStatsCard";
import { SalesPerformanceChart } from "@/components/SalesPerformanceChart";
import { RegionalSalesChart } from "@/components/RegionalSalesCard";
import { SalesTable } from "@/components/SalesTable";
import { getSalesStats } from "@/services/api/sales";
import Cookies from "js-cookie";
import SalesForm from "@/components/sales-form/SalesForm";
import { Card, CardContent } from "@/components/ui/card";

// Shape your UI already expects
type SalesStatsUI = {
  totalSales: number;
  totalSalesChange: number;
  currentMonthSales: number;
  currentMonthChange: number;
  averageOrderValue: number;
  averageOrderChange: number;
};

const Sales = () => {
  const [stats, setStats] = useState<SalesStatsUI>({
    totalSales: 0,
    totalSalesChange: 0,
    currentMonthSales: 0,
    currentMonthChange: 0,
    averageOrderValue: 0,
    averageOrderChange: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSalesFormOn, setIsSalesFormOn] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const token = Cookies.get('authToken') || "";

        // call the real API
        const apiData = await getSalesStats(token);

        // Map API → UI. If your backend later returns change fields,
        // we’ll use them; otherwise default to 0 to keep UI stable.
        setStats({
          totalSales: apiData.totalSales ?? 0,
          totalSalesChange:
            // @ts-ignore - in case backend adds this later
            apiData.totalSalesChange ?? 0,
          currentMonthSales: apiData.currentMonthSales ?? 0,
          // @ts-ignore
          currentMonthChange: apiData.currentMonthChange ?? 0,
          averageOrderValue: apiData.averageOrderValue ?? 0,
          // @ts-ignore
          averageOrderChange: apiData.averageOrderChange ?? 0,
        });
      } catch (e: any) {
        setError(e?.message || "Failed to load sales stats");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (isSalesFormOn) {
    return (
      <div className="px-2 sm:px-4">
        <Card className="w-full p-4 sm:p-6 bg-white">
          <p className="font-semibold text-2xl">Create Purchase Form</p>
          <CardContent className="mt-2">
            <SalesForm onCancel={() => setIsSalesFormOn(false)} />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-2 sm:p-4 lg:p-6">
        <div className="animate-pulse text-foreground/60">Loading sales…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-2 sm:p-4 lg:p-6">
        <div className="text-destructive">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 lg:p-6">
      <div className="max-w-8xl mx-auto space-y-4 sm:space-y-6">
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
        <SalesTable setIsSalesFormOn={setIsSalesFormOn} />
      </div>
    </div>
  );
};

export default Sales;
