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

interface ApiRevenuePoint {
  date?: string;
  period?: string;
  periodLabel?: string;
  revenue?: number;
  revenueAccrued?: number;
  revenueRealised?: number;
}

interface BarPoint {
  monthLabel: string;
  monthKey: string; // e.g. '2025-01'
  tax: number;
  revenue: number;
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function TaxCollectedChart({ selectedDate }: TaxCollectedChartProps) {
  const [taxSeries, setTaxSeries] = useState<ApiTaxPoint[]>([]);
  const [revenueSeries, setRevenueSeries] = useState<ApiRevenuePoint[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const year = selectedDate.getFullYear();
        const fromDate = new Date(year, 0, 1);
        const toDate = new Date(year, 11, 31);
        const token = Cookies.get("authToken") || localStorage.getItem("token") || "";

        // --- TAX (existing endpoint via routes) ---
        let taxData: any[] = [];
        try {
          const taxResp = await axios.get(routes.tax.collectedTimeseries, {
            params: {
              from: fromDate.toISOString(),
              to: toDate.toISOString(),
              interval: "month",
            },
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          });

          if (Array.isArray(taxResp.data)) {
            taxData = taxResp.data;
          } else if (Array.isArray(taxResp.data?.series)) {
            taxData = taxResp.data.series;
          } else if (Array.isArray(taxResp.data?.data)) {
            taxData = taxResp.data.data;
          } else {
            for (const k of Object.keys(taxResp.data || {})) {
              if (Array.isArray((taxResp.data as any)[k])) {
                taxData = (taxResp.data as any)[k];
                break;
              }
            }
          }
        } catch (err) {
          console.error("Tax timeseries fetch failed:", err);
          taxData = [];
        }

        // --- REVENUE (exact backend endpoint) ---
        let revenueUrl = "/api/dashboard/revenue-chart";
        try {
          if (routes?.tax?.collectedTimeseries && typeof routes.tax.collectedTimeseries === "string") {
            const tmp = new URL(routes.tax.collectedTimeseries, window.location.origin);
            revenueUrl = `${tmp.origin}/api/dashboard/revenue-chart`;
          }
        } catch (e) {
          revenueUrl = "/api/dashboard/revenue-chart";
        }

        let revenueData: any[] | null = null;
        try {
          const revResp = await axios.get(revenueUrl, {
            params: {
              granularity: "monthly",
              dateFrom: fromDate.toISOString(),
              dateTo: toDate.toISOString(),
            },
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          });

          if (Array.isArray(revResp.data)) {
            revenueData = revResp.data;
          } else if (Array.isArray(revResp.data?.data)) {
            revenueData = revResp.data.data;
          } else if (Array.isArray(revResp.data?.series)) {
            revenueData = revResp.data.series;
          } else {
            for (const k of Object.keys(revResp.data || {})) {
              if (Array.isArray((revResp.data as any)[k])) {
                revenueData = (revResp.data as any)[k];
                break;
              }
            }
          }
        } catch (err) {
          console.error("Revenue timeseries fetch failed (tried " + revenueUrl + "):", err);
          revenueData = null;
        }

        setTaxSeries(Array.isArray(taxData) ? taxData : []);
        setRevenueSeries(Array.isArray(revenueData) ? revenueData : null);
      } catch (e) {
        console.error("Failed to fetch tax/revenue timeseries:", e);
        setTaxSeries([]);
        setRevenueSeries(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate]);

  // Build merged monthly data for the whole year (Jan..Dec)
  const data: BarPoint[] = useMemo(() => {
    const year = selectedDate.getFullYear();

    const taxMap = new Map<string, ApiTaxPoint>();
    for (const t of taxSeries) {
      const d = new Date(t.date);
      if (!isNaN(d.getTime())) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        taxMap.set(key, t);
      } else {
        const raw = String(t.date).slice(0, 7);
        taxMap.set(raw, t);
      }
    }

    const revMap = new Map<string, ApiRevenuePoint>();
    if (Array.isArray(revenueSeries)) {
      for (const r of revenueSeries) {
        const dCandidate = r.date ?? r.period ?? r.periodLabel;
        const d = new Date(dCandidate as string);
        if (!isNaN(d.getTime())) {
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          revMap.set(key, r);
        } else {
          const raw = String(dCandidate)?.slice(0, 7);
          revMap.set(raw, r);
        }
      }
    }

    const points: BarPoint[] = [];
    for (let m = 0; m < 12; m++) {
      const key = `${year}-${String(m + 1).padStart(2, "00").slice(-2)}`; // ensure 2-digit month
      const taxPoint = taxMap.get(key);
      const revPoint = revMap.get(key);

      const collected = taxPoint?.collected ?? 0;
      const paid = taxPoint?.paid ?? 0;
      const taxValue = collected || (collected + paid) || 0;

      const revenueValue =
        (revPoint && (revPoint.revenue ?? revPoint.revenueAccrued ?? revPoint.revenueRealised ?? 0))
        ?? (collected + paid);

      points.push({
        monthLabel: MONTH_NAMES[m],
        monthKey: key,
        tax: Math.round(taxValue),
        revenue: Math.round(revenueValue ?? 0),
      });
    }

    return points;
  }, [taxSeries, revenueSeries, selectedDate]);

  // compute max for scaling bars (avoid zero)
  const maxVal = useMemo(() => {
    let max = 0;
    for (const p of data) {
      if (p.tax > max) max = p.tax;
      if (p.revenue > max) max = p.revenue;
    }
    return max || 1;
  }, [data]);

  return (
    <Card className="p-6 bg-white">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Monthly Revenue vs Monthly Tax</h3>
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
            const revenuePct = Math.min(100, (item.revenue / maxVal) * 100);
            const taxPct = Math.min(100, (item.tax / maxVal) * 100);

            return (
              <div key={item.monthKey} className="space-y-2">
                {/* Revenue row (primary) */}
                <div className="flex items-center gap-4 group">
                  <div className="w-12 text-xs sm:text-sm font-medium text-muted-foreground">
                    {item.monthLabel}
                  </div>
                  <div className="flex-1 bg-white rounded-full h-3 relative overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-400 to-pink-500 rounded-full transition-all duration-300"
                      style={{ width: `${revenuePct}%` }}
                      title={`Revenue: ₹${item.revenue.toLocaleString()}`}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground w-16 text-right">
                    ₹{item.revenue.toLocaleString()}
                  </div>
                </div>

                {/* Tax row (secondary) */}
                <div className="flex items-center gap-4 group">
                  <div className="w-12" />
                  <div className="flex-1 bg-white rounded-full h-3 relative overflow-hidden">
                    <div
                      className="h-full bg-pink-200 rounded-full transition-all duration-300"
                      style={{ width: `${taxPct}%` }}
                      title={`Tax: ₹${item.tax.toLocaleString()}`}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground w-16 text-right">
                    ₹{item.tax.toLocaleString()}
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
