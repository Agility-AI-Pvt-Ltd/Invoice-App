import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { format } from "date-fns";

const generateData = (selectedDate: Date) => {
  const monthMultiplier = selectedDate.getMonth() + 1;
  const yearMultiplier = selectedDate.getFullYear() - 2020;
  
  return [
    { month: "Jan", accrued: 300 * monthMultiplier, realised: 720 + yearMultiplier * 100 },
    { month: "Feb", accrued: 400 + monthMultiplier * 50, realised: 500 * monthMultiplier },
    { month: "Mar", accrued: 500 + monthMultiplier * 30, realised: 380 + yearMultiplier * 80 },
    { month: "Apr", accrued: 700 + monthMultiplier * 20, realised: 600 * monthMultiplier },
    { month: "May", accrued: 450 * monthMultiplier, realised: 420 + yearMultiplier * 60 },
    { month: "Jun", accrued: 650 + monthMultiplier * 40, realised: 480 * monthMultiplier },
    { month: "Jul", accrued: 380 * monthMultiplier, realised: 620 + yearMultiplier * 70 },
    { month: "Aug", accrued: 650 + monthMultiplier * 60, realised: 380 * monthMultiplier },
    { month: "Sep", accrued: 580 * monthMultiplier, realised: 650 + yearMultiplier * 90 },
    { month: "Oct", accrued: 650 + monthMultiplier * 35, realised: 480 * monthMultiplier },
    { month: "Nov", accrued: 800 * monthMultiplier, realised: 300 + yearMultiplier * 50 },
    { month: "Dec", accrued: 550 + monthMultiplier * 45, realised: 400 * monthMultiplier },
  ];
};

interface RevenueChartProps {
  selectedDate: Date;
}

export function RevenueChart({ selectedDate }: RevenueChartProps) {
  const data = generateData(selectedDate);
  return (
    <Card className="p-6 bg-white">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Revenue accrued v/s Revenue realised - {format(selectedDate, "MMM yyyy")}</h3>
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
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                labelStyle={{ color: '#374151', fontWeight: 'bold' }}
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