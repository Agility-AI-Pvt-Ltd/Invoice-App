
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SingleDatePicker } from "@/components/ui/SingleDatePicker";
import { MetricCard } from "@/components/MetricCard";
import { TaxChart } from "@/components/TaxChart";
import { TaxCollectedChart } from "@/components/TaxCollection";
import { TaxSummaryTable } from "@/components/TaxSummaryTable";
import { Download } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getTaxMetrics, exportTaxSummary } from "@/services/api/tax";
import { useToast } from "@/hooks/use-toast";
import Cookies from "js-cookie";
const token = Cookies.get('authToken') || "";
const TaxSummary = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [taxMetrics, setTaxMetrics] = useState({
    taxCollected: 0,
    taxPaid: 0,
    netTaxLiability: 0,
    taxableSales: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTaxMetrics = async () => {
      try {
        const metrics = await getTaxMetrics(token);
        console.log(metrics);
        setTaxMetrics(metrics);
      } catch (error) {
        console.error('Error fetching tax metrics:', error);
        toast({
          title: "Error",
          description: "Failed to fetch tax metrics",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTaxMetrics();
  }, [token, toast]);

  const handleExport = async (type: 'all' | 'filtered') => {
    try {
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication required",
          variant: "destructive",
        });
        return;
      }

      const blob = await exportTaxSummary(token);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tax-summary-${type === 'filtered' ? 'filtered' : 'all'}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Tax summary exported successfully",
      });
    } catch (error) {
      console.error('Error exporting tax summary:', error);
      toast({
        title: "Error",
        description: "Failed to export tax summary",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 lg:p-6">
      <div className="max-w-8xl mx-auto space-y-4 sm:space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
              <DropdownMenuTrigger>
                <Button
                  variant="outline"
                  className="hidden sm:inline-flex items-center gap-2 w-full sm:w-auto"
                >
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </Button>
              </DropdownMenuTrigger>
              {/* Mobile trigger */}
              <DropdownMenuTrigger >
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
                <DropdownMenuItem className="bg-white text-black" onClick={() => handleExport('all')}>
                  Export All Records
                </DropdownMenuItem>
                <DropdownMenuItem className="bg-white text-black" onClick={() => handleExport('filtered')}>
                  Export Filtered Records
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <MetricCard
            title="Tax Collected"
            amount={`₹ ${loading ? '...' : taxMetrics.taxCollected.toLocaleString()}`}
            trend="up"
            trendPercentage="3.48%"
            subtitle="Since last month"
          />
          <MetricCard
            title="Tax Paid"
            amount={`₹ ${loading ? '...' : taxMetrics.taxPaid.toLocaleString()}`}
            trend="down"
            trendPercentage="3.48%"
            subtitle="Since last month"
          />
          <MetricCard
            title="Net Tax Liability"
            amount={`₹ ${loading ? '...' : taxMetrics.netTaxLiability.toLocaleString()}`}
            trend="up"
            trendPercentage="3.48%"
            subtitle="Since last month"
          />
          <MetricCard
            title="Taxable Sales"
            amount={`₹ ${loading ? '...' : taxMetrics.taxableSales.toLocaleString()}`}
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