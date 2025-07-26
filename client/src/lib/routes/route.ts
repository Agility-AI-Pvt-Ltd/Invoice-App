const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const routes = {
    auth: {
        signup: `${BACKEND_URL}/api/auth/register`,
        login: `${BACKEND_URL}/api/auth/login`,
        getProfile: `${BACKEND_URL}/api/auth/profile`,
        updateProfile: `${BACKEND_URL}/api/auth/profile/update`,
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
        getAll: `${BACKEND_URL}/api/inventory`,
        getById: (id: string) => `${BACKEND_URL}/api/inventory/${id}`,
        update: (id: string) => `${BACKEND_URL}/api/inventory/${id}`,
        delete: (id: string) => `${BACKEND_URL}/api/inventory/${id}`,
    },
    scan: {
        invoice: `${BACKEND_URL}/api/scan-invoice`,
    },
} as const;
