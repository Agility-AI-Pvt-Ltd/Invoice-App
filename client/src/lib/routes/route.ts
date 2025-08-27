const BACKEND_URL = "https://invoice-backend-604217703209.asia-south1.run.app";
// const BACKEND_URL = import.meta.env.DEV ? "" : BACKEND_URL;

export const routes = {
    auth: {
        sendOtpRegister: `${BACKEND_URL}/api/send-otp-register`,
        verifyOtpAndRegister: `${BACKEND_URL}/api/verify-otp-register`,
        login: `${BACKEND_URL}/api/login`,
        getProfile: `${BACKEND_URL}/api/profile`,
        updateProfile: `${BACKEND_URL}/api/profile/update`,
    },
    tax: {
        metrics: `${BACKEND_URL}/api/tax/metrics`,
        collectedTimeseries: `${BACKEND_URL}/api/tax/collected-timeseries`,
        summary: `${BACKEND_URL}/api/tax/summary`,
        exportSummary: `${BACKEND_URL}/api/tax/summary/export`,
    },
    users: {
        getUserProfile: `${BACKEND_URL}/api/users/profile`,
    },
    invoices: {
        getAll: `${BACKEND_URL}/api/invoices`,
        create: `${BACKEND_URL}/api/invoices`,
        update: (id: string) => `${BACKEND_URL}/api/invoices/${id}`,
        getById: (id: string) => `${BACKEND_URL}/api/invoices/${id}`,
        delete: (id: string) => `${BACKEND_URL}/api/invoices/${id}`,
        duplicate: (id: string) => `${BACKEND_URL}/api/invoices/${id}/duplicate`,
        getClients: `${BACKEND_URL}/api/invoices/clients`,
        getClientDetails: (name: string) => `${BACKEND_URL}/api/invoices/clients/${encodeURIComponent(name)}`,
    },
    expenseInvoices: {
        getAll: `${BACKEND_URL}/api/expense-invoices`,
        create: `${BACKEND_URL}/api/expense-invoices`,
        update: (id: string) => `${BACKEND_URL}/api/expense-invoices/${id}`,
        getById: (id: string) => `${BACKEND_URL}/api/expense-invoices/${id}`,
        delete: (id: string) => `${BACKEND_URL}/api/expense-invoices/${id}`,
        duplicate: (id: string) => `${BACKEND_URL}/api/expense-invoices/${id}/duplicate`,
        getLast: `${BACKEND_URL}/api/expense-invoices/last`,
    },
    inventory: {
        getAll: `${BACKEND_URL}/api/items`,
        getById: (id: string) => `${BACKEND_URL}/api/items/${id}`,
        update: (id: string) => `${BACKEND_URL}/api/items/${id}`,
        delete: (id: string) => `${BACKEND_URL}/api/items/${id}`,
    },
    scan: {
        invoice: `${BACKEND_URL}/api/scan-invoice`,
    },
    customers: {
        getAll: `${BACKEND_URL}/api/customers`,
        create: `${BACKEND_URL}/api/customers`,
        getById: (id: string) => `${BACKEND_URL}/api/customers/${id}`,
        update: (id: string) => `${BACKEND_URL}/api/customers/${id}`,
        delete: (id: string) => `${BACKEND_URL}/api/customers/${id}`,
    },
} as const;
