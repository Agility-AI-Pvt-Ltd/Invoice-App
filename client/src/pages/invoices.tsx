import { useState } from "react";
import { MetricCard } from '@/components/MetricCard';
import { RevenueChart } from "@/components/RevenueChart";
import { CashFlowCard } from "@/components/CashFlowCard";
import { InvoiceTable } from "@/components/InvoiceTables";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { Card, CardContent } from "@/components/ui/card";
import InvoiceForm from "@/components/invoice-form/InvoiceForm";
import { useProfile } from "@/contexts/ProfileContext";

const Index = () => {
  //@ts-expect-error - TSX file, no type definitions for React
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isInvoiceFormOpen, setIsInvoiceFormOpen] = useState<boolean>(false);

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
  const { profile } = useProfile();
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-8xl mx-auto space-y-6">
        {/* Header with Date Filter */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Hello {profile?.name}</h1>
          <DateRangePicker
          // date={selectedDate} onDateChange={setSelectedDate} //TODO - Uncomment when DateRangePicker is implemented
          />
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
            {/* <CashFlowCard selectedDate={selectedDate} /> */}
            <CashFlowCard />
          </div>
        </div>

        {/* Invoice Table */}
        <InvoiceTable selectedDate={selectedDate} setIsInvoiceFormOpen={setIsInvoiceFormOpen} />
      </div>
    </div>
  );
};

export default Index;
