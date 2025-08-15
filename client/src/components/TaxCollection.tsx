import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import axios from "axios";
import Cookies from "js-cookie";
import { routes } from "@/lib/routes/route";

interface TaxCollectedChartProps {
  selectedDate: Date;
}

interface ApiTaxPoint {
  date: string;
  collected?: number;
  paid?: number;
}

interface BarPoint {
  month: string;
  collected: number;
  paid: number;
}

export function TaxCollectedChart({ selectedDate }: TaxCollectedChartProps) {
  const [series, setSeries] = useState<ApiTaxPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fromDate = new Date(selectedDate.getFullYear(), 0, 1);
        const toDate = new Date(selectedDate.getFullYear(), 11, 31);
        const token = Cookies.get("authToken") || localStorage.getItem("token") || "";
        const res = await axios.get(routes.tax.collectedTimeseries, {
          params: {
            from: fromDate.toISOString(),
            to: toDate.toISOString(),
            interval: "month",
          },
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        setSeries(Array.isArray(res.data?.series) ? res.data.series : []);
      } catch (e) {
        console.error("Failed to fetch tax collected timeseries:", e);
        setSeries([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedDate]);

  const data: BarPoint[] = useMemo(() => {
    return series.map((p) => ({
      month: p.date,
      collected: p.collected ?? 0,
      paid: p.paid ?? 0,
    }));
  }, [series]);

  return (
    <Card className="p-6 bg-white">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Tax Collected v. Tax Paid</h3>
        <select className="border border-border rounded px-2 py-1 text-sm">
          <option>This Year</option>
          <option>Last Year</option>
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <div className="space-y-4">
          {data.map((item) => (
            <div key={item.month} className="space-y-2">
              <div className="flex items-center gap-4 group">
                <div className="w-12 text-xs sm:text-sm font-medium text-muted-foreground">
                  {item.month}
                </div>
                <div className="flex-1 bg-white rounded-full h-3 relative overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-400 to-pink-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, item.collected)}%` }}
                    title={`Tax Collected: ₹${item.collected.toLocaleString()}`}
                  />
                </div>
                <div className="text-xs text-muted-foreground w-16 text-right">
                  ₹{item.collected.toLocaleString()}
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-12" />
                <div className="flex-1 bg-white rounded-full h-3 relative overflow-hidden">
                  <div
                    className="h-full bg-pink-200 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, item.paid)}%` }}
                    title={`Tax Paid: ₹${item.paid.toLocaleString()}`}
                  />
                </div>
                <div className="text-xs text-muted-foreground w-16 text-right">
                  ₹{item.paid.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}