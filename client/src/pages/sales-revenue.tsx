//File: client/src/pages/sales-revenue.tsx

import { useEffect, useState, useCallback } from "react";
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

  // ✅ Wrap stats fetching into a function so we can re-use it
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = Cookies.get("authToken") || "";

      const apiData = await getSalesStats(token);

      setStats({
        totalSales: apiData.totalSales ?? 0,
        // @ts-ignore
        totalSalesChange: apiData.totalSalesChange ?? 0,
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
  }, []);

  // Initial load
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // ✅ Listen for invoice creation event
  useEffect(() => {
    const handler = () => {
      fetchStats(); // refresh stats when a new invoice is created
    };

    window.addEventListener("sales:created", handler);
    return () => window.removeEventListener("sales:created", handler);
  }, [fetchStats]);

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
