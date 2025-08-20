import { Card, CardContent } from "@/components/ui/card";
// import { TrendingUp, TrendingDown } from "lucide-react";
import { GreenUp, RedDown } from "./ui/ArrowSVG"; // 👈 important import

interface SalesStatsCardProps {
  title: string;
  value: number;
  changePercentage: number;
  currency?: boolean;
  chartColor?: 'blue' | 'red' | 'green';
}

export const SalesStatsCard = ({ 
  title, 
  value, 
  changePercentage,
  // currency = true,
}: SalesStatsCardProps) => {
  const isPositive = changePercentage >= 0;

  const formatValue = (val: number) => {
    return `₹ ${val.toLocaleString()}`;
  };

  return (
    <Card className="bg-white border border-border rounded-lg">
      <CardContent className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-primary">
                {formatValue(value)}
              </div>
              <div className="flex items-center gap-1 text-sm">
                {/* {isPositive ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )} */}
                <span className={isPositive ? "text-green-500" : "text-red-500"}>
                  {Math.abs(changePercentage)}%
                </span>
                <span className="text-muted-foreground">Since last month</span>
              </div>
            </div>

            {/* 🔁 Mini line chart based on trend */}
            <div className="w-20 h-12">
              {isPositive ? <GreenUp /> : <RedDown />}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
