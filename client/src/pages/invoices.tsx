import { useState } from "react";
import {MetricCard} from '@/components/MetricCard';
import { RevenueChart } from "@/components/RevenueChart";
import { CashFlowCard } from "@/components/CashFlowCard";
import { InvoiceTable } from "@/components/InvoiceTables";
import { DateRangePicker } from "@/components/ui/DateRangePicker";

const Index = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-8xl mx-auto space-y-6">
        {/* Header with Date Filter */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Hello A</h1>
          <DateRangePicker date={selectedDate} onDateChange={setSelectedDate} />
        </div>
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard 
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
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueChart selectedDate={selectedDate} />
          </div>
          <div className="lg:col-span-1">
            <CashFlowCard selectedDate={selectedDate} />
          </div>
        </div>

        {/* Invoice Table */}
        <InvoiceTable selectedDate={selectedDate} />
      </div>
    </div>
  );
};

export default Index;
