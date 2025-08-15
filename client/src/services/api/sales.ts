// lib/api/sales.api.ts
import axios from "axios";

const BASE_URL = "https://invoice-backend-604217703209.asia-south1.run.app";

export const SALES_API = {
    STATS: `${BASE_URL}/api/sales/stats`,
    PERFORMANCE: `${BASE_URL}/api/sales/performance`,
    REGIONS: `${BASE_URL}/api/sales/regions`,
    ITEMS: `${BASE_URL}/api/inventory/items`,
    SUMMARY: `${BASE_URL}/api/inventory/summary`,
    EXPORT: `${BASE_URL}/api/inventory/export`,
    IMPORT: `${BASE_URL}/api/inventory/import`,
    CATEGORIES: `${BASE_URL}/api/inventory/categories`,
    LIST: `${BASE_URL}/api/sales`,
    
}


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
    paymentStatus: string; // can be 'Paid', 'Unpaid', 'Draft', 'Sent', etc.
}

/**
 * Fetch sales data
 * @param token JWT authentication token
 */
export const getSalesData = async (
    token: string
): Promise<SalesRecord[]> => {
    try {
        const response = await axios.get(`${SALES_API.LIST}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching sales data:", error);
        throw error;
    }
};


/**
 * Fetch sales stats
 * @param token JWT authentication token
 * @param from Optional start date (ISO string)
 * @param to Optional end date (ISO string)
 */

export const getSalesStats = async (
    token: string,
    from?: string,
    to?: string
): Promise<{
    totalSales: number;
    currentMonthSales: number;
    averageOrderValue: number;
}> => {
    const params: Record<string, string> = {};
    if (from) params.from = from;
    if (to) params.to = to;

    const response = await axios.get(SALES_API.STATS, {
        headers: { Authorization: `Bearer ${token}` },
        params,
    });

    return response.data;
};

/**
 * Fetch sales performance chart data
 * @param token JWT auth token
 * @param from Start date (YYYY-MM-DD)
 * @param to End date (YYYY-MM-DD)
 * @param interval "day" | "week" | "month"
 */

//TODO
export const getSalesPerformance = async (
    token: string,
    // from?: string,
    // to?: string,
    interval: "day" | "week" | "month" | " " = "month"
): Promise<{ month: string; value: number }[]> => {
    const params: Record<string, string> = { interval };
    //Todo : Uncomment
    // if (from) params.from = from;
    // if (to) params.to = to;

    const url = SALES_API.PERFORMANCE;

    try {
        const response = await axios.get(url, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            params,
        });
        console.log("getSalesPerformance response:", response.data);
        // Defensive checks
        const series = Array.isArray(response.data?.series) ? response.data.series : [];

        // Sort by date ascending so chart x-axis is ordered
        series.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
        console.log("Sales performance series:", series);
        // Map to the format the frontend expects. Ensure values are numbers.
        return series.map((item: any) => ({
            month: String(item.date),
            value: Number(item.sales ?? 0),
        }));
    } catch (err: any) {
        // Helpful logging for debugging in browser console
        console.error("getSalesPerformance error", {
            url,
            params,
            status: err?.response?.status,
            responseData: err?.response?.data,
            message: err?.message,
        });

        // Return empty array instead of throwing so UI can show gracefully.
        // (If you prefer to surface the error, rethrow here.)
        return [];
    }
};

/**
 * Fetch regional sales data
 * @param token JWT auth token
 * @param from Start date (YYYY-MM-DD)
 * @param to End date (YYYY-MM-DD)
 */
export const getRegionalSales = async (
    token: string,
    from?: string,
    to?: string
): Promise<{ region: string; value: number; percentage: string }[]> => {
    const params: Record<string, string> = {};
    if (from) params.from = from;
    if (to) params.to = to;

    const response = await axios.get(SALES_API.REGIONS, {
        headers: { Authorization: `Bearer ${token}` },
        params,
    });

    const regions = response.data.regions || [];
    const totalSales = regions.reduce((sum: number, r: any) => sum + r.sales, 0);

    return regions.map((r: any) => ({
        region: r.name || "Unknown",
        value: r.sales,
        percentage:
            totalSales > 0
                ? `${((r.sales / totalSales) * 100).toFixed(1)}%`
                : "0%",
    }));
};
