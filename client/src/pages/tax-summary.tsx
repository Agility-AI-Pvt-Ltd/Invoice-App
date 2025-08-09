//tax-summary

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SingleDatePicker } from "@/components/ui/DateRangePicker";
import { MetricCard } from "@/components/MetricCard";
import { TaxChart } from "@/components/TaxChart";
import { TaxCollectedChart } from "@/components/TaxCollection";
import { TaxSummaryTable } from "@/components/TaxSummaryTable";
import { Download } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const TaxSummary = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleExport = (type: 'all' | 'filtered') => {
    // Create CSV content
    const csvContent = [
      "Tax Type,Tax Rate%,Taxable Amount,Tax Collected,Tax Paid,Net Tax Liability,Period,No. of Invoices",
      "CGST,18%,₹2000,₹2000,₹2000,₹5000,29 July 2024,2",
      "SGST,5%,₹2000,₹2000,₹2000,₹5000,29 July 2024,3",
      "IGST,12%,₹2000,₹2000,₹2000,₹5000,29 July 2024,5",
      "CGST,18%,₹2000,₹2000,₹2000,₹5000,29 July 2024,2",
      "IGST,18%,₹2000,₹2000,₹2000,₹5000,29 July 2024,2",
      "CGST,18%,₹2000,₹2000,₹2000,₹5000,29 July 2024,2",
      "IGST,18%,₹2000,₹2000,₹2000,₹5000,29 July 2024,2",
      "CGST,18%,₹2000,₹2000,₹2000,₹5000,29 July 2024,12",
      "IGST,18%,₹2000,₹2000,₹2000,₹5000,29 July 2024,5"
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tax-summary-${type === 'filtered' ? 'filtered' : 'all'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 lg:p-6">
      <div className="max-w-8xl mx-auto space-y-4 sm:space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground">Hello A</h1>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <SingleDatePicker
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 w-full sm:w-auto"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export</span>
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
          <MetricCard
            title="Tax Collected"
            amount="₹ 23,345"
            trend="up"
            trendPercentage="3.48%"
            subtitle="Since last month"
          />
          <MetricCard
            title="Tax Paid"
            amount="₹ 23,345"
            trend="down"
            trendPercentage="3.48%"
            subtitle="Since last month"
          />
          <MetricCard
            title="Net Tax Liability"
            amount="₹ 23,345"
            trend="up"
            trendPercentage="3.48%"
            subtitle="Since last month"
          />
          <MetricCard
            title="Taxable Sales"
            amount="₹ 23,345"
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