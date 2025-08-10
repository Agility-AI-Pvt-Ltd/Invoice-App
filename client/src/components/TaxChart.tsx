//TaxChart.tsx

import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const generateTaxData = (selectedDate: Date) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  // Use selectedDate month to produce a slight offset so the input is meaningful
  const monthOffset = selectedDate.getMonth();

  return months.map((month, index) => {
    const progression = (index + monthOffset) % 12;
    return {
      month,
      cashFlow: Math.floor(Math.random() * 400) + 200 + progression * 30,
      taxPaid: Math.floor(Math.random() * 300) + 150 + progression * 25,
    };
  });
};

interface TaxChartProps {
  selectedDate: Date;
}

export function TaxChart({ selectedDate }: TaxChartProps) {
  const data = generateTaxData(selectedDate);

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
          <select className="border border-border rounded px-2 py-1 text-sm">
            <option>This Year</option>
            <option>Last Year</option>
          </select>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis 
            dataKey="month" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            domain={[0, 800]}
            ticks={[100, 200, 300, 400, 500, 600, 700, 800]}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
              fontSize: '12px'
            }}
            formatter={(value, name) => [
              `₹${value}`,
              name === 'cashFlow' ? 'Cash Flow' : 'Tax Paid'
            ]}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Line 
            type="monotone" 
            dataKey="cashFlow" 
            stroke="#FF0000" 
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--chart-secondary))', strokeWidth: 0, r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="taxPaid" 
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--muted-foreground))', strokeWidth: 0, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}