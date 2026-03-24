// client/src/services/api/sales.ts

import api from "@/lib/api";

export const SALES_API = {
  STATS: `/api/sales/stats`,
  PERFORMANCE: `/api/sales/performance`,
  REGIONS: `/api/sales/regions`,
  ITEMS: `/api/inventory/items`,
  SUMMARY: `/api/inventory/summary`,
  EXPORT: `/api/sales/export`,
  IMPORT: `/api/inventory/import`,
  CATEGORIES: `/api/inventory/categories`,
  LIST: `/api/sales`,

  DETAIL: (id: string) => `/api/sales/${id}`,
  PDF: (id: string) => `/api/sales/${id}/pdf`,
  SEND: (id: string) => `/api/sales/${id}/send`,
  BULK: `/api/sales/bulk`,
};

// ---- Types ----
export interface SalesRecord {
  id: string;
  invoiceNumber: string;
  customerName: string;
  product: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  dateOfSale: string;
  paymentStatus: string; // 'Paid' | 'Unpaid' | 'Draft' | 'Sent'
}

/**
 * Stats returned from the sales/stats endpoint.
 * Most "change" fields are optional because backend may or may not return them.
 */
export interface SalesStats {
  totalSales: number;
  totalSalesChange?: number;
  currentMonthSales?: number;
  currentMonthChange?: number;
  averageOrderValue?: number;
  averageOrderChange?: number;
  trendTotal?: number[];
  trendMonth?: number[];
  trendAOV?: number[];
}

/**
 * Fetch sales data
 */
export const getSalesData = async (): Promise<SalesRecord[]> => {
  const response = await api.get(SALES_API.LIST);
  return response.data;
};

/**
 * Fetch sales stats
 */
export const getSalesStats = async (
  _from?: string,
  _to?: string
): Promise<SalesStats> => {
  try {
    // Metrics (all-time): totalReceivables, incoming, outgoing, cashAmount
    const metricsRes = await api.get('/api/invoices/metrics');
    const m = metricsRes?.data?.data ?? metricsRes?.data ?? {};

    // Current month invoices
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const year = now.getFullYear();
    const monthRes = await api.get('/api/invoices', { params: { month, year, limit: 1000 } });
    const monthArr = Array.isArray(monthRes.data) ? monthRes.data : (monthRes.data?.data ?? []);
    const monthAmounts = monthArr.map((i: any) => Number(i.amount || 0));
    const currentMonthSales = monthAmounts.reduce((s: number, v: number) => s + v, 0);
    const aovMonth = monthArr.length > 0 ? currentMonthSales / monthArr.length : 0;

    // All invoices for AOV all-time
    const allRes = await api.get('/api/invoices', { params: { limit: 1000 } });
    const allArr = Array.isArray(allRes.data) ? allRes.data : (allRes.data?.data ?? []);
    const allAmounts = allArr.map((i: any) => Number(i.amount || 0));
    const totalAmountComputed = allAmounts.reduce((s: number, v: number) => s + v, 0);
    const aovAllTime = allArr.length > 0 ? totalAmountComputed / allArr.length : 0;

    // Last month invoices for growth calculations
    const lastMonthDate = new Date(year, month - 2, 1); // previous month index
    const lastMonth = lastMonthDate.getMonth() + 1;
    const lastYear = lastMonthDate.getFullYear();
    const lastRes = await api.get('/api/invoices', { params: { month: lastMonth, year: lastYear, limit: 1000 } });
    const lastArr = Array.isArray(lastRes.data) ? lastRes.data : (lastRes.data?.data ?? []);
    const lastAmounts = lastArr.map((i: any) => Number(i.amount || 0));
    const lastMonthSales = lastAmounts.reduce((s: number, v: number) => s + v, 0);
    const lastAOV = lastArr.length > 0 ? lastMonthSales / lastArr.length : 0;

    // Percentage changes (vs last month)
    const pct = (curr: number, prev: number) => prev ? ((curr - prev) / prev) * 100 : (curr > 0 ? 100 : 0);
    const totalSalesChange = pct(currentMonthSales, lastMonthSales);
    const currentMonthChange = pct(currentMonthSales, lastMonthSales);
    const averageOrderChange = pct(aovMonth, lastAOV);

    // Trend series for mini-graphs (last 30 days daily sums)
    const days = 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - (days - 1));
    const byDay = new Map<string, number>();
    const addToDay = (arr: any[]) => {
      for (const inv of arr) {
        const d = new Date(inv.date || inv.createdAt || inv.invoiceDate || inv.issuedOn || Date.now());
        if (d < cutoff) continue;
        const key = d.toISOString().slice(0, 10);
        byDay.set(key, (byDay.get(key) || 0) + Number(inv.amount || 0));
      }
    };
    addToDay(allArr);
    const trendTotal: number[] = Array.from({ length: days }, (_, i) => {
      const d = new Date(cutoff);
      d.setDate(cutoff.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      return byDay.get(key) || 0;
    });

    const byDayMonth = new Map<string, { sum: number; count: number }>();
    for (const inv of monthArr) {
      const d = new Date(inv.date || inv.createdAt || inv.invoiceDate || inv.issuedOn || Date.now());
      const key = d.toISOString().slice(0, 10);
      const curr = byDayMonth.get(key) || { sum: 0, count: 0 };
      curr.sum += Number(inv.amount || 0);
      curr.count += 1;
      byDayMonth.set(key, curr);
    }
    const trendMonth: number[] = Array.from({ length: days }, (_, i) => {
      const d = new Date(cutoff);
      d.setDate(cutoff.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      return byDay.get(key) || 0;
    });
    const trendAOV: number[] = Array.from({ length: days }, (_, i) => {
      const d = new Date(cutoff);
      d.setDate(cutoff.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      const entry = byDayMonth.get(key);
      return entry && entry.count > 0 ? entry.sum / entry.count : 0;
    });

    const stats: SalesStats = {
      totalSales: Number(m.totalReceivables ?? totalAmountComputed ?? 0),
      currentMonthSales,
      averageOrderValue: aovAllTime,
      totalSalesChange,
      currentMonthChange,
      averageOrderChange,
      trendTotal,
      trendMonth,
      trendAOV,
    };

    return stats;
  } catch (err) {
    // Fallback to zeros on failure
    return {
      totalSales: 0,
      currentMonthSales: 0,
      averageOrderValue: 0,
      totalSalesChange: 0,
      currentMonthChange: 0,
      averageOrderChange: 0,
      trendTotal: [],
      trendMonth: [],
      trendAOV: [],
    };
  }
};

/**
 * Fetch sales performance chart data
 */
export const getSalesPerformance = async (
  interval: "day" | "week" | "month" = "month"
): Promise<{ month: string; value: number }[]> => {
  const params: Record<string, string> = { interval };
  const url = SALES_API.PERFORMANCE;

  try {
    const response = await api.get(url, {
      params,
    });
    const series = Array.isArray(response.data?.series)
      ? response.data.series
      : [];
    series.sort(
      (a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    return series.map((item: any) => ({
      month: String(item.date),
      value: Number(item.sales ?? 0),
    }));
  } catch (err: any) {
    console.error("getSalesPerformance error", {
      url,
      params,
      status: err?.response?.status,
      responseData: err?.response?.data,
      message: err?.message,
    });
    return [];
  }
};

/**
 * Fetch regional sales data
 */
export const getRegionalSales = async (
  from?: string,
  to?: string
): Promise<{ region: string; value: number; percentage: string }[]> => {
  const params: Record<string, string> = {};
  if (from) params.from = from;
  if (to) params.to = to;

  const response = await api.get(SALES_API.REGIONS, {
    params,
  });

  const regions = response.data.regions || [];
  const totalSales = regions.reduce(
    (sum: number, r: any) => sum + (r.sales || 0),
    0
  );

  return regions.map((r: any) => ({
    region: r.name || "Unknown",
    value: r.sales || 0,
    percentage:
      totalSales > 0
        ? `${((r.sales / totalSales) * 100).toFixed(1)}%`
        : "0%",
  }));
};

// -------------------
// ADDITIONAL FUNCTIONS
// -------------------

/** Delete sale by id */
export const deleteSale = async (id: string) => {
  await api.delete(SALES_API.DETAIL(id));
};

/** Send sale (mark invoice as sent) */
export const sendSale = async (id: string, payload?: any) => {
  const res = await api.post(SALES_API.SEND(id), payload || {});
  return res.data;
};

/** Get sale invoice PDF */
export const getSalePDF = async (id: string): Promise<Blob> => {
  const res = await api.get(SALES_API.PDF(id), {
    responseType: "blob",
  });
  return res.data;
};

/** Export sales as CSV */
export const exportSalesCSV = async (filters?: any): Promise<Blob> => {
  const res = await api.post(SALES_API.EXPORT, filters || {}, {
    responseType: "blob",
  });
  return res.data;
};

/** Bulk create sales from parsed rows */
export const createSalesBulk = async (rows: any[]) => {
  const res = await api.post(SALES_API.BULK, rows);
  return res.data;
};
