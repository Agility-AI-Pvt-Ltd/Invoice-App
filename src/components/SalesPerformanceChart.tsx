  //File: client/src/components/SalesPerformanceChart.tsx


import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CalendarIcon } from "lucide-react";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
//TODo Remove
endOfMonth
import { cn } from "@/lib/utils";
import { getSalesPerformance } from "@/services/api/sales";
// import Cookies from "js-cookie";

type ChartPoint = { month: string; value: number };

const safeParseDate = (d: string): Date => {
  try {
    const parsed = parseISO(d);
    if (!isNaN(parsed.getTime())) return parsed;
    const fallback = new Date(d);
    return isNaN(fallback.getTime()) ? new Date() : fallback;
  } catch {
    const fallback = new Date(d);
    return isNaN(fallback.getTime()) ? new Date() : fallback;
  }
};

export const SalesPerformanceChart = () => {
  const [date, setDate] = useState<Date>();
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchChart = async (d?: Date) => {
    setLoading(true);
    try {
      // const token = Cookies.get("authToken") || "";

      // const from = (d ? startOfMonth(d) : startOfMonth(new Date())).toISOString();
      // const to = (d ? endOfMonth(d) : endOfMonth(new Date())).toISOString();
      //TODO
      // const res = await getSalesPerformance(token, from, to, "day");
      //TODO : Remove
      startOfMonth(d || new Date());
      const res = await getSalesPerformance("day");

      const series = Array.isArray(res) ? res : [];

      series.sort((a, b) => {
        const da = safeParseDate(String(a.month)).getTime();
        const db = safeParseDate(String(b.month)).getTime();
        return da - db;
      });

      const mapped: ChartPoint[] = series.map((p) => {
        const parsed = safeParseDate(String(p.month));
        return {
          month: format(parsed, "dd MMM"),
          value: Number(p.value ?? 0),
        };
      });

      setChartData(mapped);
    } catch (err) {
      console.error("Failed to fetch sales performance:", err);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    fetchChart(selectedDate);
  };

  return (
    <Card className="bg-white border border-border rounded-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-card-foreground">
            Sales Performance
          </CardTitle>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-36 h-8 text-sm justify-start text-left font-normal",
                  !date && "text-black"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "MMM yyyy") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateChange}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="h-80 flex items-center justify-center">
          {loading ? (
            <div className="h-full w-full animate-pulse rounded-md bg-muted" />
          ) : chartData.length === 0 ? (
            <span className="text-muted-foreground text-sm">No data available</span>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--blue-500))", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: "hsl(var(--blue-500))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
