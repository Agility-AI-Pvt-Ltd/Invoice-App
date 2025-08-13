"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { format } from "date-fns";
import { getRevenueChart } from "@/services/api/dashboard";
import Cookies from "js-cookie";

interface RevenueChartProps {
  selectedDate: Date;
}

export function RevenueChart({ selectedDate }: RevenueChartProps) {
  const [data, setData] = useState<any[]>([]);
  const token = Cookies.get("authToken");

  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        const res = await getRevenueChart(token, "30-days");

        // Transform API data -> match chart format
        const chartData = res?.data.map((item: any) => ({
          month: item.period, // API sends "Mar", "Jul" etc.
          accrued: item.revenueAccrued,
          realised: item.revenueRealised,
        }));

        setData(chartData);
      } catch (error) {
        console.error("Failed to fetch revenue chart:", error);
      }
    })();
  }, [token, selectedDate]);

  return (
    <Card className="p-6 bg-white">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          Revenue accrued v/s Revenue realised - {format(selectedDate, "MMM yyyy")}
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                className="text-muted-foreground text-xs"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                className="text-muted-foreground text-xs"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                labelStyle={{ color: "#374151", fontWeight: "bold" }}
              />
              <Line
                type="monotone"
                dataKey="accrued"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
                name="Revenue Accrued"
              />
              <Line
                type="monotone"
                dataKey="realised"
                stroke="#9ca3af"
                strokeWidth={2}
                dot={{ fill: "#9ca3af", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#9ca3af", strokeWidth: 2 }}
                name="Revenue Realised"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
