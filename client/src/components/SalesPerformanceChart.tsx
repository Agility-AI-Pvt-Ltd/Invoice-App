import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { salesChartData } from "@/lib/mock/salesData";

export const SalesPerformanceChart = () => {
  const [date, setDate] = useState<Date>();
  const [chartData, setChartData] = useState(salesChartData);

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      // Simulate data change based on date selection
      const multiplier = Math.random() * 2 + 0.5;
      const newData = salesChartData.map(item => ({
        ...item,
        value: Math.round(item.value * multiplier)
      }));
      setChartData(newData);
    } else {
      setChartData(salesChartData);
    }
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
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  fontSize: "12px"
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
        </div>
      </CardContent>
    </Card>
  );
};