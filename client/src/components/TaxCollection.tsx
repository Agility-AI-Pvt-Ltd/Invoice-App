//TaxCollection.tsx
import { Card } from "@/components/ui/card";

const generateBarData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
  
  return months.map((month) => ({
    month,
    taxCollected: Math.floor(Math.random() * 30) + 70, // 70-100%
    taxPaid: Math.floor(Math.random() * 25) + 60, // 60-85%
  }));
};

interface TaxCollectedChartProps {
  selectedDate: Date;
}

export function TaxCollectedChart({ selectedDate }: TaxCollectedChartProps) {
  const data = generateBarData();

  return (
    <Card className="p-6 bg-white">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Tax Collected v. Tax Paid</h3>
        <select className="border border-border rounded px-2 py-1 text-sm">
          <option>This Year</option>
          <option>Last Year</option>
        </select>
      </div>
      
      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.month} className="space-y">
            <div className="flex items-center gap-4 group">
              <div className="w-8 text-sm font-medium text-muted-foreground">
                {item.month}
              </div>
              <div className="flex-1 bg-white rounded-full h-3 relative overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-pink-400 to-pink-500 rounded-full transition-all duration-300"
                  style={{ width: `${item.taxCollected}%` }}
                  title={`Tax Collected: ₹${(item.taxCollected * 23.3).toFixed(0)}`}
                />
              </div>
              <div className="text-xs text-muted-foreground w-12">
                ₹2.3k
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="w-8"></div>
              <div className="flex-1 bg-white rounded-full h-3 relative overflow-hidden">
                <div 
                  className="h-full bg-pink-200 rounded-full transition-all duration-300"
                  style={{ width: `${item.taxPaid}%` }}
                  title={`Tax Paid: ₹${(item.taxPaid * 23.3).toFixed(0)}`}
                />
              </div>
              <div className="text-xs text-muted-foreground w-12">
                ₹2.3k
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}