// client/src/pages/invoices.tsx
import { useState, useEffect, useCallback } from "react";
// import { MetricCard } from '@/components/MetricCard';
import { RevenueChart } from "@/components/RevenueChart";
import { CashFlowCard } from "@/components/CashFlowCard";
import { InvoiceTable } from "@/components/InvoiceTables";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { Card, CardContent } from "@/components/ui/card";
import InvoiceForm from "@/components/invoice-form/InvoiceForm";
import { useProfile } from "@/contexts/ProfileContext";
import { SalesStatsCard } from "@/components/SalesStatsCard";
import Cookies from "js-cookie";
import { getSalesStats } from "@/services/api/sales";

type SalesStatsUI = {
  totalSales: number;
  totalSalesChange: number;
  currentMonthSales: number;
  currentMonthChange: number;
  averageOrderValue: number;
  averageOrderChange: number;
};


const Index = () => {
  const [selectedDate] = useState<Date>(new Date());
  const [isInvoiceFormOpen, setIsInvoiceFormOpen] = useState<boolean>(false);
  const [stats, setStats] = useState<SalesStatsUI>({
    totalSales: 0,
    totalSalesChange: 0,
    currentMonthSales: 0,
    currentMonthChange: 0,
    averageOrderValue: 0,
    averageOrderChange: 0,
  });

  //@ts-ignore
  const [loading, setLoading] = useState(true);
  //@ts-ignore
  const [error, setError] = useState<string | null>(null);


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

  // trigger for refresh
  const [refreshFlag, setRefreshFlag] = useState<number>(0);
  useEffect(() => {
    const handleInvoiceCreated = () => {
      setIsInvoiceFormOpen(false);
      // bump refresh flag so InvoiceTable re-fetches
      setRefreshFlag((f) => f + 1);
    };
    window.addEventListener("invoice:created", handleInvoiceCreated);
    return () => {
      window.removeEventListener("invoice:created", handleInvoiceCreated);
    };
  }, []);

  if (isInvoiceFormOpen) {
    return (
      <div className="px-2 sm:px-4">
        <Card className="w-full p-4 sm:p-6 bg-white">
          <p className="font-semibold text-2xl">Create Purchase Form</p>
          <CardContent className="mt-2">
            <InvoiceForm onCancel={() => setIsInvoiceFormOpen(false)} />
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-8xl mx-auto space-y-6">
        {/* Header with Date Filter */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">
            {/* Hello {profile?.data?.name} */}
          </h1>
          <DateRangePicker
          // date={selectedDate} onDateChange={setSelectedDate}
          />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* <MetricCard
            title="Total Invoices"
            amount={`₹ ${(23345 + selectedDate.getMonth() * 1000).toLocaleString()}`}
            trend="up"
            trendPercentage="+12%"
          />
          <MetricCard
            title="Paid Invoices"
            amount={`₹ ${(18000 + selectedDate.getMonth() * 800).toLocaleString()}`}
            trend="up"
            trendPercentage="+8%"
          />
          <MetricCard
            title="Pending Invoices"
            amount={`₹ ${(5345 + selectedDate.getMonth() * 200).toLocaleString()}`}
            trend="up"
            trendPercentage="+5%"
          />
          <MetricCard
            title="Total Receivables"
            amount={`₹ ${(15000 + selectedDate.getMonth() * 500).toLocaleString()}`}
            subtitle="₹ 23,345"
            subtitleAmount={`₹ ${(8000 + selectedDate.getMonth() * 300).toLocaleString()}`}
            subtitleColor="destructive"
          /> */}
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

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueChart selectedDate={selectedDate} />
          </div>
          <div className="lg:col-span-1">
            <CashFlowCard />
          </div>
        </div>

        {/* Invoice Table */}
        <InvoiceTable
          selectedDate={selectedDate}
          setIsInvoiceFormOpen={setIsInvoiceFormOpen}
          refreshFlag={refreshFlag} // pass refresh trigger down
        />
      </div>
    </div>
  );
};

export default Index;
