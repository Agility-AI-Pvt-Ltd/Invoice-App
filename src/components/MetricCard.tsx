import { Card, CardContent } from "@/components/ui/card";
import { GreenUp, RedDown, GreenUpIcon, RedDownIcon } from "./ui/ArrowSVG";

interface MetricCardProps {
  title: string;
  amount: string;
  trend?: "up" | "down";
  trendPercentage?: string;
  subtitle?: string;
  subtitleAmount?: string;
  subtitleColor?: "success" | "destructive";
}

export function MetricCard({
  title,
  amount,
  trend,
  trendPercentage,
  subtitle,
  subtitleAmount,
  subtitleColor = "success"
}: MetricCardProps) {
  const isPositive = trend === "up";

  return (
    <Card className="w-full rounded-2xl border border-gray-200 bg-white">
      <CardContent className="px-5 py-4 flex flex-col justify-between h-full">
        {/* Top Row: Title + Trend Graph */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm text-muted-foreground font-medium">{title}</h3>
            <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-blue-800 mt-1">
              {amount}
            </p>

          </div>
          <div className="h-12 w-20">
            {trend === "up" ? <GreenUp /> : trend === "down" ? <RedDown /> : null}
          </div>
        </div>

        {/* Subtitle (if any) */}
        {subtitle && subtitleAmount && (
          <div className="mt-4">
            <p className="text-xs text-muted-foreground">{subtitle}</p>
            <p
              className={`text-sm font-medium ${subtitleColor === "success" ? "text-green-600" : "text-red-600"
                }`}
            >
              {subtitleAmount}
            </p>
          </div>
        )}

        {/* Bottom Row: Trend Icon + % Change */}
        {trend && trendPercentage && (
          <div className="mt-6 flex items-center space-x-2">
            <span className="flex items-center">
              {isPositive ? (
                <GreenUpIcon className="w-4 h-4 mr-1" />
              ) : (
                <RedDownIcon className="w-4 h-4 mr-1" />
              )}
              <span className={isPositive ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                {trendPercentage}
              </span>
            </span>
            <span className="text-xs text-center text-muted-foreground">
              compared to previous period
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
