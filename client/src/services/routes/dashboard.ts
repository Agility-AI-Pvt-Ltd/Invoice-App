// Import shared API configuration
import { BASE_URL } from '../../lib/api-config';

// Base endpoints for Dashboard API
export const DASHBOARD_API = {
    STATS: `${BASE_URL}/api/dashboard/stats`, // Dashboard statistics
    METRICS: `${BASE_URL}/api/dashboard/metrics`, // Dashboard metrics
    REVENUE_CHART: `${BASE_URL}/api/dashboard/revenue-chart`, // Revenue chart
    CASH_FLOW: `${BASE_URL}/api/dashboard/cash-flow`, // Cash flow
    SALES_REPORT: `${BASE_URL}/api/dashboard/sales-report`, // Sales vs expenses
    RECENT_ACTIVITY: `${BASE_URL}/api/dashboard/recent-activity`, // Latest invoices/expenses
    TOP_PRODUCTS: `${BASE_URL}/api/dashboard/top-products`, // Best selling products
    TOP_CUSTOMERS: `${BASE_URL}/api/dashboard/top-customers`, // Top customers
};
