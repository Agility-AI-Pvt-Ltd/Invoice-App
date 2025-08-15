//tax-summary

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SingleDatePicker } from "@/components/ui/SingleDatePicker";
import { MetricCard } from "@/components/MetricCard";
import { TaxChart } from "@/components/TaxChart";
import { TaxCollectedChart } from "@/components/TaxCollection";
import { TaxSummaryTable } from "@/components/TaxSummaryTable";
import { Download } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import axios from "axios";
import Cookies from "js-cookie";
import { routes } from "@/lib/routes/route";

const TaxSummary = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [metrics, setMetrics] = useState({ taxCollected: 0, taxPaid: 0, netTaxLiability: 0, taxableSales: 0 });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const token = Cookies.get("authToken") || localStorage.getItem("token") || "";
        const res = await axios.get(routes.tax.metrics, {
          params: { date: selectedDate.toISOString() },
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const { taxCollected = 0, taxPaid = 0, netTaxLiability = 0, taxableSales = 0 } = res.data || {};
        setMetrics({ taxCollected, taxPaid, netTaxLiability, taxableSales });
      } catch (e) {
        console.error("Failed to fetch tax metrics:", e);
        setMetrics({ taxCollected: 0, taxPaid: 0, netTaxLiability: 0, taxableSales: 0 });
      }
    };
    fetchMetrics();
  }, [selectedDate]);

  const handleExport = async (type: 'all' | 'filtered') => {
    try {
      const token = Cookies.get("authToken") || localStorage.getItem("token") || "";
      const res = await axios.get(routes.tax.exportSummary, {
        params: { from: selectedDate.toISOString(), to: selectedDate.toISOString(), groupBy: 'period' },
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tax-summary-${type === 'filtered' ? 'filtered' : 'all'}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed:", e);
    }
  };

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 lg:p-6">
      <div className="max-w-8xl mx-auto space-y-4 sm:space-y-6">
        {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground">Hello A</h1>
            <div className="flex flex-row items-center gap-2 sm:gap-3 flex-nowrap">
              {/* Date picker: full on sm+, icon-only on mobile */}
              <div className="hidden sm:block">
                <SingleDatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
              </div>
              <div className="sm:hidden">
                <SingleDatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} iconOnly />
              </div>

              {/* Export Dropdown: full button on sm+, icon-only on mobile */}
              <DropdownMenu>
                {/* Desktop/tablet trigger */}
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="hidden sm:inline-flex items-center gap-2 w-full sm:w-auto"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </Button>
                </DropdownMenuTrigger>
                {/* Mobile trigger */}
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="inline-flex sm:hidden"
                    aria-label="Export"
                  >
                    <Download className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleExport('all')}>
                    Export All Records
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('filtered')}>
                    Export Filtered Records
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <MetricCard title="Tax Collected" amount={`₹ ${metrics.taxCollected.toLocaleString()}`} trend="up" trendPercentage="" subtitle="" />
          <MetricCard
            title="Tax Paid"
            amount={`₹ ${metrics.taxPaid.toLocaleString()}`}
            trend="down"
            trendPercentage="3.48%"
            subtitle="Since last month"
          />
          <MetricCard
            title="Net Tax Liability"
            amount={`₹ ${metrics.netTaxLiability.toLocaleString()}`}
            trend="up"
            trendPercentage="3.48%"
            subtitle="Since last month"
          />
          <MetricCard
            title="Taxable Sales"
            amount={`₹ ${metrics.taxableSales.toLocaleString()}`}
            trend="up"
            trendPercentage="3.48%"
            subtitle="Since last month"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <TaxChart selectedDate={selectedDate} />
          <TaxCollectedChart selectedDate={selectedDate} />
        </div>

        {/* Tax Summary Table */}
        <TaxSummaryTable />
      </div>
    </div>
  );
};

export default TaxSummary;