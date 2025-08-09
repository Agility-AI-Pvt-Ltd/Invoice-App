import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { regionalSalesData } from "@/lib/mock/salesData";

export const RegionalSalesChart = () => {
  const [date, setDate] = useState<Date>();
  const [chartData, setChartData] = useState(regionalSalesData);
  const maxValue = Math.max(...chartData.map(item => item.value));

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      // Simulate data change based on date selection
      const multiplier = Math.random() * 2 + 0.5;
      const newData = regionalSalesData.map(item => ({
        ...item,
        value: Math.round(item.value * multiplier),
        percentage: `${Math.round(Math.random() * 40 + 60)}%`
      }));
      setChartData(newData);
    } else {
      setChartData(regionalSalesData);
    }
  };
  
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
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <span className="text-sm text-card-foreground font-medium min-w-[90px]">
                {item.region}
              </span>
              <div className="flex-1 h-3 bg-white rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-300 shadow-sm"
                  style={{
                    width: `${(item.value / maxValue) * 100}%`,
                    backgroundColor: `hsl(${220 + (index * 30)} 70% 50%)`
                  }}
                />
              </div>
            </div>
            <span className="text-sm text-black ml-3 min-w-fit">
              {item.percentage}
            </span>
          </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};