//TaxChart.tsx

import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { routes } from "@/lib/routes/route";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

interface TaxChartProps {
  selectedDate: Date;
}

interface ApiTaxPoint { date: string; collected?: number; paid?: number }
interface ChartPoint { month: string; cashFlow: number; taxPaid: number }

export function TaxChart({ selectedDate }: TaxChartProps) {
  const [data, setData] = useState<ChartPoint[]>([]);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const fromDate = new Date(selectedDate.getFullYear(), 0, 1);
        const toDate = new Date(selectedDate.getFullYear(), 11, 31);

        const token = Cookies.get("authToken") || localStorage.getItem("token") || "";

        const res = await axios.get(routes.tax.collectedTimeseries, {
          params: {
            from: fromDate.toISOString(),
            to: toDate.toISOString(),
            interval: "month",
          },
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        const apiSeries: ApiTaxPoint[] = Array.isArray(res.data?.series) ? res.data.series : [];
        const formatted: ChartPoint[] = apiSeries.map((p) => ({
          month: p.date,
          cashFlow: p.collected ?? 0,
          taxPaid: p.paid ?? 0,
        }));
        setData(formatted);
      } catch (error) {
        console.error("Error fetching tax timeseries:", error);
        setData([]);
      }
    };
    fetchChartData();
  }, [selectedDate]);

  return (
    <Card className="p-6 bg-white">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Cash Flow v. Tax Paid</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FF0000]"></div>
            <span>Cash Flow</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div>
            <span>Tax Paid</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
          <Tooltip
            contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '12px' }}
            formatter={(value, name) => [
              `₹${value}`,
              name === 'cashFlow' ? 'Cash Flow' : 'Tax Paid'
            ]}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Line type="monotone" dataKey="cashFlow" stroke="#FF0000" strokeWidth={2} dot={{ fill: '#FF0000', strokeWidth: 0, r: 4 }} />
          <Line type="monotone" dataKey="taxPaid" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', strokeWidth: 0, r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}