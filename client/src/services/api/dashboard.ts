import axios from 'axios';
import { DASHBOARD_API } from '../routes/dashboard';
import Cookies from 'js-cookie';


// Types
export interface DashboardStat {
    title: string;
    value: number;
    change: number;
    changeLabel: string;
    trend: 'up' | 'down' | 'neutral';
}

/**
 * Fetch dashboard stats
 * @param token JWT authentication token
 * @param period Time period filter ('this-month', 'last-month', 'this-year', 'last-year', '30-days')
 */
export const getDashboardStats = async (
    token: string,
    period: string = 'this-month'
): Promise<DashboardStat[]> => {
    try {
        const response = await axios.get(`${DASHBOARD_API.STATS}?period=${period}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error;
    }
};



// Types for Revenue Chart
export interface SalesReportData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor: string;
        borderColor: string;
    }[];
}

export const getSalesReport = async (
    token: string,
    period: string = 'this-year'
): Promise<SalesReportData> => {
    const res = await axios.get(`${DASHBOARD_API.SALES_REPORT}?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};




export interface RecentActivity {
    description: string;
    type: 'Transaction' | 'Invoice' | 'Access Change';
    user: string;
    date: string; // ISO string from backend
    amount?: number;
    status: 'Paid' | 'Pending' | 'Active' | 'Refunded' | 'Revoked';
}

/**
 * Fetch recent activities
 * @param token JWT authentication token
 * @param limit Optional limit for number of records
 */
export const getRecentActivity = async (
    token: string,
    limit: number = 10
): Promise<RecentActivity[]> => {
    const res = await axios.get(`${DASHBOARD_API.RECENT_ACTIVITY}?limit=${limit}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return res.data;
};




export interface TopProductsData {
    labels: string[];
    datasets: {
        data: number[];
        backgroundColor: string[];
        borderWidth: number;
        cutout: string;
    }[];
}

/**
 * Fetch top products data for the dashboard chart
 * @param token JWT authentication token
 * @param sortBy Sort by "sales" or "units"
 * @param period Time period ("7-days", "30-days", "6-months")
 */
export const getTopProducts = async (
    token: string,
    sortBy: "sales" | "units" = "sales",
    period: "7-days" | "30-days" | "6-months" = "30-days"
): Promise<TopProductsData> => {
    const res = await axios.get(
        `${DASHBOARD_API.TOP_PRODUCTS}?sortBy=${sortBy}&period=${period}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return res.data;
};


export interface TopCustomersResponse {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor: string[];
    }[];
}

// Fetch top customers
export const getTopCustomers = async (token: string): Promise<TopCustomersResponse> => {
    const response = await axios.get<TopCustomersResponse>(DASHBOARD_API.TOP_CUSTOMERS, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};



export interface RevenueChartItem {
    revenueAccrued: number;
    revenueRealised: number;
    period: string;
}

export interface RevenueChartResponse {
    data: RevenueChartItem[];
}

export const getRevenueChart = async (token: string, period: string = "30-days") => {
    const response = await axios.get<RevenueChartResponse>(
        `${DASHBOARD_API.REVENUE_CHART}?period=${period}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data;
};



export interface CashFlowResponse {
    cashPosition: number;
    incoming: number;
    outgoing: number;
    asOfDate: string;
}

export const getCashFlow = async (token: string): Promise<CashFlowResponse> => {
    const res = await axios.get<CashFlowResponse>(DASHBOARD_API.CASH_FLOW, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};



//Invoice APIs

// API Configuration
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const INVOICES_API = {
    GET_ALL: `${API_BASE_URL}/api/invoices`,
    GET_BY_ID: `${API_BASE_URL}/api/invoices`,
    CREATE: `${API_BASE_URL}/api/invoices`,
    UPDATE: `${API_BASE_URL}/api/invoices`,
    DELETE: `${API_BASE_URL}/api/invoices`,
    DUPLICATE: `${API_BASE_URL}/api/invoices`,
    DOWNLOAD: `${API_BASE_URL}/api/invoices`,
    EXPORT: `${API_BASE_URL}/api/invoices/export`,
};

// TypeScript Interfaces
export interface Invoice {
    _id: string;
    invoiceNumber: string;
    date: string;
    dueDate?: string;
    billTo: {
        name: string;
        email?: string;
        address: string;
        state?: string;
        gst?: string;
        pan?: string;
        phone?: string;
    };
    shipTo?: {
        name?: string;
        address?: string;
        state?: string;
        gst?: string;
        pan?: string;
        phone?: string;
        email?: string;
    };
    items: InvoiceItem[];
    notes?: string;
    currency?: string;
    status?: string;
    subtotal?: number;
    cgst?: number;
    sgst?: number;
    igst?: number;
    total?: number;
    termsAndConditions?: string;
}

export interface InvoiceItem {
    description: string;
    hsn?: string;
    quantity: number;
    unitPrice: number;
    gst?: number;
    discount?: number;
    amount?: number;
}

export interface GetInvoicesParams {
    status?: string;
    month?: number;
    year?: number;
    page?: number;
    limit?: number;
}

export interface GetInvoicesResponse {
    data: Invoice[];
    total: number;
    page: number;
    totalPages: number;
}

// API Functions
export const getAllInvoices = async (
    token: string,
    params?: GetInvoicesParams
): Promise<GetInvoicesResponse> => {
    const queryParams: any = {};
    
    if (params?.status && params.status !== 'all') {
        queryParams.status = params.status;
    }
    if (params?.month) {
        queryParams.month = params.month;
    }
    if (params?.year) {
        queryParams.year = params.year;
    }
    if (params?.page) {
        queryParams.page = params.page;
    }
    if (params?.limit) {
        queryParams.limit = params.limit;
    }

    const res = await axios.get<GetInvoicesResponse>(INVOICES_API.GET_ALL, {
        headers: { Authorization: `Bearer ${token}` },
        params: queryParams
    });
    
    return res.data;
};

export const getInvoiceById = async (
    token: string,
    invoiceId: string
): Promise<Invoice> => {
    const res = await axios.get<Invoice>(`${INVOICES_API.GET_BY_ID}/${invoiceId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const createInvoice = async (
    token: string,
    invoiceData: Omit<Invoice, '_id'>
): Promise<Invoice> => {
    const res = await axios.post<Invoice>(INVOICES_API.CREATE, invoiceData, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const updateInvoice = async (
    token: string,
    invoiceId: string,
    invoiceData: Partial<Invoice>
): Promise<Invoice> => {
    const res = await axios.put<Invoice>(`${INVOICES_API.UPDATE}/${invoiceId}`, invoiceData, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const deleteInvoice = async (
    token: string,
    invoiceId: string
): Promise<{ message: string }> => {
    const res = await axios.delete<{ message: string }>(`${INVOICES_API.DELETE}/${invoiceId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const duplicateInvoice = async (
    token: string,
    invoiceId: string
): Promise<Invoice> => {
    const res = await axios.post<Invoice>(`${INVOICES_API.DUPLICATE}/${invoiceId}/duplicate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const downloadInvoice = async (
    token: string,
    invoiceId: string
): Promise<Blob> => {
    const res = await axios.get(`${INVOICES_API.DOWNLOAD}/${invoiceId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
    });
    return res.data;
};

export const exportInvoices = async (
    token: string,
    params?: {
        status?: string;
        month?: number;
        year?: number;
        client?: string;
        export_format?: 'excel' | 'csv';
    }
): Promise<Blob> => {
    const queryParams: any = {};
    
    if (params?.status && params.status !== 'all') {
        queryParams.status = params.status;
    }
    if (params?.month) {
        queryParams.month = params.month;
    }
    if (params?.year) {
        queryParams.year = params.year;
    }
    if (params?.client) {
        queryParams.client = params.client;
    }
    if (params?.export_format) {
        queryParams.export_format = params.export_format;
    }

    const res = await axios.get(INVOICES_API.EXPORT, {
        headers: { Authorization: `Bearer ${token}` },
        params: queryParams,
        responseType: 'blob'
    });
    
    return res.data;
};

// Utility function to get auth token from localStorage
export const getAuthToken = (): string => {
    const token = Cookies.get('authToken');
    if (!token) {
        throw new Error('No authentication token found');
    }
    return token;
};

// Wrapper functions that automatically get the token
export const invoicesAPI = {
    getAll: (params?: GetInvoicesParams) => getAllInvoices(getAuthToken(), params),
    getById: (invoiceId: string) => getInvoiceById(getAuthToken(), invoiceId),
    create: (invoiceData: Omit<Invoice, '_id'>) => createInvoice(getAuthToken(), invoiceData),
    update: (invoiceId: string, invoiceData: Partial<Invoice>) => updateInvoice(getAuthToken(), invoiceId, invoiceData),
    delete: (invoiceId: string) => deleteInvoice(getAuthToken(), invoiceId),
    duplicate: (invoiceId: string) => duplicateInvoice(getAuthToken(), invoiceId),
    download: (invoiceId: string) => downloadInvoice(getAuthToken(), invoiceId),
    export: (params?: {
        status?: string;
        month?: number;
        year?: number;
        client?: string;
        export_format?: 'excel' | 'csv';
    }) => exportInvoices(getAuthToken(), params),
};