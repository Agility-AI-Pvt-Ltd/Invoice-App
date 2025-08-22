// client/src/services/api/sales.ts

import axios from "axios";
import Cookies from "js-cookie";

const BASE_URL = "https://invoice-backend-604217703209.asia-south1.run.app";

export const SALES_API = {
  STATS: `${BASE_URL}/api/sales/stats`,
  PERFORMANCE: `${BASE_URL}/api/sales/performance`,
  REGIONS: `${BASE_URL}/api/sales/regions`,
  ITEMS: `${BASE_URL}/api/inventory/items`,
  SUMMARY: `${BASE_URL}/api/inventory/summary`,
  EXPORT: `${BASE_URL}/api/sales/export`,
  IMPORT: `${BASE_URL}/api/inventory/import`,
  CATEGORIES: `${BASE_URL}/api/inventory/categories`,
  LIST: `${BASE_URL}/api/sales`,

  DETAIL: (id: string) => `${BASE_URL}/api/sales/${id}`,
  PDF: (id: string) => `${BASE_URL}/api/sales/${id}/pdf`,
  SEND: (id: string) => `${BASE_URL}/api/sales/${id}/send`,
  BULK: `${BASE_URL}/api/sales/bulk`,
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
}

/**
 * Fetch sales data
 */
export const getSalesData = async (): Promise<SalesRecord[]> => {
  const token = Cookies.get("authToken") || "";
  const response = await axios.get(SALES_API.LIST, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Fetch sales stats
 */
export const getSalesStats = async (
  from?: string,
  to?: string
): Promise<SalesStats> => {
  const token = Cookies.get("authToken") || "";
  const params: Record<string, string> = {};
  if (from) params.from = from;
  if (to) params.to = to;

  const response = await axios.get(SALES_API.STATS, {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });

  // Cast to SalesStats — response.data should conform, but we keep optional fields
  return response.data as SalesStats;
};

/**
 * Fetch sales performance chart data
 */
export const getSalesPerformance = async (
  interval: "day" | "week" | "month" = "month"
): Promise<{ month: string; value: number }[]> => {
  const token = Cookies.get("authToken") || "";
  const params: Record<string, string> = { interval };
  const url = SALES_API.PERFORMANCE;

  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
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
  const token = Cookies.get("authToken") || "";
  const params: Record<string, string> = {};
  if (from) params.from = from;
  if (to) params.to = to;

  const response = await axios.get(SALES_API.REGIONS, {
    headers: { Authorization: `Bearer ${token}` },
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
  const token = Cookies.get("authToken") || "";
  await axios.delete(SALES_API.DETAIL(id), {
    headers: { Authorization: `Bearer ${token}` },
  });
};

/** Send sale (mark invoice as sent) */
export const sendSale = async (id: string, payload?: any) => {
  const token = Cookies.get("authToken") || "";
  const res = await axios.post(SALES_API.SEND(id), payload || {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

/** Get sale invoice PDF */
export const getSalePDF = async (id: string): Promise<Blob> => {
  const token = Cookies.get("authToken") || "";
  const res = await axios.get(SALES_API.PDF(id), {
    headers: { Authorization: `Bearer ${token}` },
    responseType: "blob",
  });
  return res.data;
};

/** Export sales as CSV */
export const exportSalesCSV = async (filters?: any): Promise<Blob> => {
  const token = Cookies.get("authToken") || "";
  const res = await axios.post(SALES_API.EXPORT, filters || {}, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: "blob",
  });
  return res.data;
};

/** Bulk create sales from parsed rows */
export const createSalesBulk = async (rows: any[]) => {
  const token = Cookies.get("authToken") || "";
  const res = await axios.post(SALES_API.BULK, rows, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
