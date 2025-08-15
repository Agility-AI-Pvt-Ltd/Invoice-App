const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API_BASE = import.meta.env.DEV ? "" : BACKEND_URL;

export const routes = {
    auth: {
        sendOtpRegister: `${API_BASE}/api/send-otp-register`,
        verifyOtpAndRegister: `${API_BASE}/api/verify-otp-register`,
        login: `${BACKEND_URL}/api/login`,

        getProfile: `${BACKEND_URL}/api/profile`,
        updateProfile: `${BACKEND_URL}/api/auth/profile/update`,

        getProfile: `${API_BASE}/api/profile`,
        updateProfile: `${API_BASE}/api/profile/update`,
    },
    tax: {
        metrics: `${API_BASE}/api/tax/metrics`,
        collectedTimeseries: `${API_BASE}/api/tax/collected-timeseries`,
        summary: `${API_BASE}/api/tax/summary`,
        exportSummary: `${API_BASE}/api/tax/summary/export`,

    },
    users: {
        getUserProfile: `${API_BASE}/api/users/profile`,
    },
    invoices: {
        getAll: `${API_BASE}/api/invoices`,
        create: `${API_BASE}/api/invoices`,
        update: (id: string) => `${API_BASE}/api/invoices/${id}`,
        getById: (id: string) => `${API_BASE}/api/invoices/${id}`,
        delete: (id: string) => `${API_BASE}/api/invoices/${id}`,
        duplicate: (id: string) => `${API_BASE}/api/invoices/${id}/duplicate`,
        getClients: `${API_BASE}/api/invoices/clients`,
        getClientDetails: (name: string) => `${API_BASE}/api/invoices/clients/${encodeURIComponent(name)}`,
    },
    expenseInvoices: {
        getAll: `${API_BASE}/api/expense-invoices`,
        create: `${API_BASE}/api/expense-invoices`,
        update: (id: string) => `${API_BASE}/api/expense-invoices/${id}`,
        getById: (id: string) => `${API_BASE}/api/expense-invoices/${id}`,
        delete: (id: string) => `${API_BASE}/api/expense-invoices/${id}`,
        duplicate: (id: string) => `${API_BASE}/api/expense-invoices/${id}/duplicate`,
        getLast: `${API_BASE}/api/expense-invoices/last`,
    },
    inventory: {
        getAll: `${API_BASE}/api/inventory`,
        getById: (id: string) => `${API_BASE}/api/inventory/${id}`,
        update: (id: string) => `${API_BASE}/api/inventory/${id}`,
        delete: (id: string) => `${API_BASE}/api/inventory/${id}`,
    },
    scan: {
        invoice: `${API_BASE}/api/scan-invoice`,
    },
} as const;
