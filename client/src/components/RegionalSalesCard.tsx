import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";
import { getRegionalSales } from "@/services/api/sales"; // adjust path if needed

export const RegionalSalesChart = () => {
  const [date, setDate] = useState<Date | undefined>();
  const [chartData, setChartData] = useState<{ region: string; value: number; percentage: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRegional = async (d?: Date) => {
    setLoading(true);
    setError(null);
    try {
      const token = Cookies.get("authToken") || "";

      // Build optional from/to (month range)
      let from: string | undefined;
      let to: string | undefined;
      if (d) {
        // use month range for selected date (start and end of month)
        const start = new Date(d.getFullYear(), d.getMonth(), 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        from = start.toISOString();
        to = end.toISOString();
      }

      const data = await getRegionalSales(token, from, to);
      // Defensive: ensure array
      const regions = Array.isArray(data) ? data : [];

      // sort biggest-first for nicer bars
      regions.sort((a, b) => b.value - a.value);

      setChartData(regions);
    } catch (err: any) {
      console.error("Failed to fetch regional sales:", err);
      setChartData([]);
      setError(err?.message || "Failed to load regional sales");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegional();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    fetchRegional(selectedDate);
  };

  const maxValue = chartData.length > 0 ? Math.max(...chartData.map(item => item.value)) : 0;

  return (
    <Card className="bg-white border border-border rounded-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-card-foreground">
            Regional Sales
          </CardTitle>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-36 h-8 text-sm justify-start text-left font-normal",
                  !date && "text-muted-foreground"
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
        <div className="space-y-3">
          {loading ? (
            // loading skeleton: repeat placeholders
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="h-4 w-24 rounded bg-muted" />
                  <div className="flex-1 h-3 bg-white rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-muted animate-pulse" style={{ width: `${(i + 1) * 15}%` }} />
                  </div>
                </div>
                <div className="ml-3 h-4 w-12 rounded bg-muted" />
              </div>
            ))
          ) : error ? (
            <div className="text-destructive text-sm">Error: {error}</div>
          ) : chartData.length === 0 ? (
            <div className="text-sm text-muted-foreground">No data available</div>
          ) : (
            chartData.map((item, index) => (
              <div key={item.region} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-sm text-card-foreground font-medium min-w-[90px]">
                    {item.region}
                  </span>
                  <div className="flex-1 h-3 bg-white rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300 shadow-sm"
                      style={{
                        width: maxValue > 0 ? `${(item.value / maxValue) * 100}%` : "0%",
                        backgroundColor: `hsl(${220 + (index * 30)} 70% 50%)`,
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm text-black ml-3 min-w-fit">
                  {item.percentage}
                </span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RegionalSalesChart;