import { useState, useEffect, useCallback } from "react";
import { RevenueChart } from "@/components/RevenueChart";
import { CashFlowCard } from "@/components/CashFlowCard";
import { InvoiceTable } from "@/components/InvoiceTables";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
// import { Card, CardContent } from "@/components/ui/card";
import { SalesStatsCard } from "@/components/SalesStatsCard";
import Cookies from "js-cookie";
import { getSalesStats } from "@/services/api/sales";
// import type { InvoiceModel } from "@/contexts/InvoiceContext";

type SalesStatsUI = {
  totalSales: number;
  totalSalesChange: number;
  currentMonthSales: number;
  currentMonthChange: number;
  averageOrderValue: number;
  averageOrderChange: number;
  trendTotal?: number[];
  trendMonth?: number[];
  trendAOV?: number[];
};

const Index = () => {
  const [selectedDate] = useState<Date>(new Date());

  // new state for editing
  // const [editingInvoice, setEditingInvoice] = useState<InvoiceModel | null>(null);

  const [stats, setStats] = useState<SalesStatsUI>({
    totalSales: 0,
    totalSalesChange: 0,
    currentMonthSales: 0,
    currentMonthChange: 0,
    averageOrderValue: 0,
    averageOrderChange: 0,
  });

  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);


  // ✅ Wrap stats fetching into a function so we can re-use it
  const fetchStats = useCallback(async () => {
    try {
      const token = Cookies.get("authToken") || "";
      // cast to any so TypeScript doesn't complain about missing optional fields
      const apiData: any = await getSalesStats(token);

      setStats({
        totalSales: apiData?.totalSales ?? 0,
        totalSalesChange: Math.round((apiData?.totalSalesChange ?? 0) * 100) / 100,
        currentMonthSales: apiData?.currentMonthSales ?? 0,
        currentMonthChange: Math.round((apiData?.currentMonthChange ?? 0) * 100) / 100,
        averageOrderValue: apiData?.averageOrderValue ?? 0,
        averageOrderChange: Math.round((apiData?.averageOrderChange ?? 0) * 100) / 100,
        trendTotal: apiData?.trendTotal ?? [],
        trendMonth: apiData?.trendMonth ?? [],
        trendAOV: apiData?.trendAOV ?? [],
      });
    } catch (e: any) {
      // keep silent on UI (no UI change requested) but log for debugging
      // console.error("Failed to load sales stats", e);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Keep listening to sales-created (existing logic)
  useEffect(() => {
    const handler = () => {
      fetchStats();
    };
    window.addEventListener("sales:created", handler);
    return () => window.removeEventListener("sales:created", handler);
  }, [fetchStats]);

  const [refreshFlag, setRefreshFlag] = useState<number>(0);

  // When an invoice is created/updated/deleted we clear editing state and refresh the table & stats
  useEffect(() => {
    const handleInvoiceSaved = () => {
      // clear editing state
      // setEditingInvoice(null);
      // toggle refresh flag so InvoiceTable re-fetches
      setRefreshFlag((f) => f + 1);
      // also refresh aggregated stats
      fetchStats();
    };

    const handleInvoiceDeleted = () => {
      setRefreshFlag((f) => f + 1);
      fetchStats();
    };

    window.addEventListener("invoice:created", handleInvoiceSaved);
    window.addEventListener("invoice:updated", handleInvoiceSaved);
    window.addEventListener("invoice:deleted", handleInvoiceDeleted);

    return () => {
      window.removeEventListener("invoice:created", handleInvoiceSaved);
      window.removeEventListener("invoice:updated", handleInvoiceSaved);
      window.removeEventListener("invoice:deleted", handleInvoiceDeleted);
    };
  }, [fetchStats]);

  // Listen for table's edit event (fallback) — set editing invoice
  useEffect(() => {
    const handleInvoiceEditEvent = (e: Event) => {
      const custom = e as CustomEvent;
      const detail = custom?.detail;
      if (!detail) return;
      // setEditingInvoice(detail as InvoiceModel);
    };
    window.addEventListener("invoice:edit", handleInvoiceEditEvent as EventListener);
    return () => {
      window.removeEventListener("invoice:edit", handleInvoiceEditEvent as EventListener);
    };
  }, []);



  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-8xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">
            {/* Hello {profile?.data?.name} */}
          </h1>
          <DateRangePicker />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueChart selectedDate={selectedDate} />
            </div>
          <div className="lg:col-span-1">
            <CashFlowCard />
          </div>
        </div>

        {/* Pass editingInvoice setter to the table so it can directly set edit state */}
        <InvoiceTable
          selectedDate={selectedDate}
          refreshFlag={refreshFlag}
          // setEditingInvoice={setEditingInvoice}
        />
      </div>
    </div>
  );
};

export default Index;
