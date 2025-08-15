import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import axios from "axios";
import Cookies from "js-cookie";

interface TaxCollectedChartProps {
  selectedDate: Date;
}

interface ApiResponse {
  series: {
    date: string;
    collected: number;
    paid: number;
  }[];
}

export function TaxCollectedChart({ selectedDate }: TaxCollectedChartProps) {
  const [data, setData] = useState<ApiResponse["series"]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("authToken"); // adjust if stored differently
        const res = await axios.get<ApiResponse>(
          "https://invoice-backend-604217703209.asia-south1.run.app/api/tax/collected-timeseries",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setData(res.data.series);
      } catch (err) {
        console.error("Error fetching tax collected timeseries:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedDate]);

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
          {data.map((item) => {
            const collectedPercent = item.collected > 0 ? (item.collected / 1000000) * 100 : 0;
            const paidPercent = item.paid > 0 ? (item.paid / 1000000) * 100 : 0;

            return (
              <div key={item.date} className="space-y">
                <div className="flex items-center gap-4 group">
                  <div className="w-16 text-sm font-medium text-muted-foreground">
                    {new Date(item.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="flex-1 bg-white rounded-full h-3 relative overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-400 to-pink-500 rounded-full transition-all duration-300"
                      style={{ width: `${collectedPercent}%` }}
                      title={`Tax Collected: ₹${item.collected.toLocaleString()}`}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground w-16 text-right">
                    ₹{(item.collected / 1000).toFixed(1)}k
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-16"></div>
                  <div className="flex-1 bg-white rounded-full h-3 relative overflow-hidden">
                    <div
                      className="h-full bg-pink-200 rounded-full transition-all duration-300"
                      style={{ width: `${paidPercent}%` }}
                      title={`Tax Paid: ₹${item.paid.toLocaleString()}`}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground w-16 text-right">
                    ₹{(item.paid / 1000).toFixed(1)}k
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
