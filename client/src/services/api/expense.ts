import api from '@/lib/api';
import { EXPENSE_API } from '../routes/expense';

// Types
export interface ExpenseInvoiceItem {
  description?: string;
  hsn?: string;
  quantity?: number;
  price?: number;
  gst?: number;
  discount?: number;
  total?: number;
}

export interface BillFrom {
  name?: string;
  address?: string;
  state?: string;
  gst?: string;
  pan?: string;
  phone?: string;
  email?: string;
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

export interface ExpenseInvoice {
  _id?: string;
  invoiceNumber: string;
  date: string;
  dueDate?: string;
  currency?: string;
  status?: string;
  billFrom: BillFrom;
  billTo: BillTo;
  shipTo?: ShipTo;
  items: ExpenseInvoiceItem[];
  termsAndConditions?: string;
  subtotal?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  total?: number;
  userId?: string;
}

export interface ExpenseMetrics {
  totalExpenses: number;
  currentMonthExpenses: number;
  averageExpenseValue: number;
}

export interface ExpenseFilters {
  status?: string;
  fromDate?: string;
  toDate?: string;
  vendor?: string;
}

/**
 * Get all expense invoices for a user
 */
export const getExpenseInvoices = async (): Promise<ExpenseInvoice[]> => {
  try {
    const response = await api.get(EXPENSE_API.GET_ALL);
    return response.data;
  } catch (error) {
    console.error('Error fetching expense invoices:', error);
    throw error;
  }
};

/**
 * Get expense metrics (total, current month, average)
 */
export const getExpenseMetrics = async (): Promise<ExpenseMetrics> => {
  try {
    const response = await api.get(EXPENSE_API.METRICS);
    return response.data;
  } catch (error) {
    console.error('Error fetching expense metrics:', error);
    throw error;
  }
};

/**
 * Get last expense invoice
 */
export const getLastExpenseInvoice = async (): Promise<ExpenseInvoice | null> => {
  try {
    const response = await api.get(EXPENSE_API.LAST);
    return response.data;
  } catch (error) {
    console.error('Error fetching last expense invoice:', error);
    throw error;
  }
};

/**
 * Duplicate an expense invoice
 */
export const duplicateExpenseInvoice = async (invoiceId: string): Promise<ExpenseInvoice> => {
  try {
    const response = await api.post(`${EXPENSE_API.DUPLICATE}/${invoiceId}`, {});
    return response.data;
  } catch (error) {
    console.error('Error duplicating expense invoice:', error);
    throw error;
  }
};

/**
 * Delete an expense invoice
 */
export const deleteExpenseInvoice = async (invoiceId: string): Promise<{ success: boolean }> => {
  try {
    const response = await api.delete(`${EXPENSE_API.DELETE}/${invoiceId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting expense invoice:', error);
    throw error;
  }
};

/**
 * Import expenses from file
 */
export const importExpenses = async (file: File): Promise<{ imported: number; skipped: number }> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(EXPENSE_API.IMPORT, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error importing expenses:', error);
    throw error;
  }
};

/**
 * Export expenses to CSV
 */
export const exportExpenses = async (): Promise<Blob> => {
  try {
    const response = await api.get(EXPENSE_API.EXPORT, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting expenses:', error);
    throw error;
  }
};
