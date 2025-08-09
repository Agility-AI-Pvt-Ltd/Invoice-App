//tax-summary

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { MetricCard } from "@/components/MetricCard";
import { TaxChart } from "@/components/TaxChart";
import { TaxCollectedChart } from "@/components/TaxCollection";
import { TaxSummaryTable } from "@/components/TaxSummaryTable";
import { Download} from "lucide-react";

const TaxSummary = () => {

  //@ts-expect-error - TSX file, no type definitions for React
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleExport = () => {
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
    a.download = 'tax-summary.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold text-foreground">Hello A</h1>
        <div className="flex items-center gap-4">
          <DateRangePicker
            // selectedDate={selectedDate}    //TODO - Uncomment when DateRangePicker is implemented
            // onDateChange={setSelectedDate}
          />
          <Button 
            onClick={handleExport}
            variant="outline" 
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <TaxChart selectedDate={selectedDate} />
        <TaxCollectedChart selectedDate={selectedDate} />
      </div>

      {/* Tax Summary Table */}
      <TaxSummaryTable />
    </div>
  );
};

export default TaxSummary;