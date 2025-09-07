import api from '@/lib/api';
import { INVOICE_API } from '../routes/invoice';

// Types
export interface InvoiceItem {
  description: string;
  hsn?: string;
  quantity: number;
  unitPrice: number;
  gst?: number;
  discount?: number;
  amount?: number;
}

export interface BillTo {
  name: string;
  email?: string;
  address: string;
  state?: string;
  gst?: string;
  pan?: string;
  phone?: string;
}

export interface ShipTo {
  name?: string;
  address?: string;
  gst?: string;
  pan?: string;
  phone?: string;
  email?: string;
}

export interface Invoice {
  _id?: string;
  user?: string;
  invoiceNumber: string;
  date: string;
  dueDate?: string;
  billTo: BillTo;
  shipTo?: ShipTo;
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

export interface InvoiceFilters {
  status?: string;
  month?: number;
  year?: number;
  customer?: string;
}

export interface InvoiceMetrics {
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  totalRevenue: number;
}

/**
 * Get all invoices with filters and pagination
 */
export const getInvoices = async (
  page: number = 1,
  limit: number = 10,
  filters?: InvoiceFilters
): Promise<{ data: Invoice[]; total: number; page: number; totalPages: number }> => {
  try {
    const params: any = { page, limit, ...filters };
    
    const response = await api.get(INVOICE_API.GET_ALL, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }
};

/**
 * Get invoice by ID
 */
export const getInvoice = async (invoiceId: string): Promise<Invoice> => {
  try {
    const response = await api.get(`${INVOICE_API.GET_BY_ID}/${invoiceId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching invoice:', error);
    throw error;
  }
};

/**
 * Create new invoice
 */
export const createInvoice = async (invoice: Invoice): Promise<{ message: string; invoice: Invoice }> => {
  try {
    const response = await api.post(INVOICE_API.CREATE, invoice);
    return response.data;
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
};

/**
 * Update invoice
 */
export const updateInvoice = async (invoiceId: string, updates: Partial<Invoice>): Promise<{ message: string; invoice: Invoice }> => {
  try {
    const response = await api.put(`${INVOICE_API.UPDATE}/${invoiceId}`, updates);
    return response.data;
  } catch (error) {
    console.error('Error updating invoice:', error);
    throw error;
  }
};

/**
 * Delete invoice
 */
export const deleteInvoice = async (invoiceId: string): Promise<{ message: string }> => {
  try {
    const response = await api.delete(`${INVOICE_API.DELETE}/${invoiceId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting invoice:', error);
    throw error;
  }
};

/**
 * Duplicate invoice
 */
export const duplicateInvoice = async (invoiceId: string): Promise<Invoice> => {
  try {
    const response = await api.post(`${INVOICE_API.DUPLICATE}/${invoiceId}`, {});
    return response.data;
  } catch (error) {
    console.error('Error duplicating invoice:', error);
    throw error;
  }
};

/**
 * Download invoice as PDF
 */
export const downloadInvoice = async (invoiceId: string): Promise<Blob> => {
  try {
    const response = await api.get(`${INVOICE_API.DOWNLOAD}/${invoiceId}`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Error downloading invoice:', error);
    throw error;
  }
};

/**
 * Export invoices to CSV
 */
export const exportInvoices = async (
  filters?: InvoiceFilters
): Promise<Blob> => {
  try {
    const params: any = { ...filters };
    
    const response = await api.get(INVOICE_API.EXPORT, {
      params,
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting invoices:', error);
    throw error;
  }
};

/**
 * Get invoice clients
 */
export const getInvoiceClients = async (): Promise<string[]> => {
  try {
    const response = await api.get(INVOICE_API.CLIENTS);
    return response.data;
  } catch (error) {
    console.error('Error fetching invoice clients:', error);
    throw error;
  }
};

/**
 * Get client details by name
 */
export const getClientDetails = async (clientName: string): Promise<BillTo> => {
  try {
    const response = await api.get(`${INVOICE_API.CLIENT_DETAILS}/${encodeURIComponent(clientName)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching client details:', error);
    throw error;
  }
};

/**
 * Scan invoice from image
 */
export const scanInvoice = async (file: File): Promise<{ success: boolean; message: string; invoiceId: string; invoiceType: string }> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(INVOICE_API.SCAN, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error scanning invoice:', error);
    throw error;
  }
};
