import api from '@/lib/api';
import { INVOICE_API } from '../routes/invoice';
import type { InvoiceModel, InvoiceItem, Party } from '@/types/invoice';

// Re-export types for backward compatibility
export type Invoice = InvoiceModel;
export type BillTo = Party;
export type ShipTo = Party;
export type { InvoiceItem };

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
 * Backend returns complete invoice data with billTo object and items array
 */
export const getInvoices = async (
  page: number = 1,
  limit: number = 10,
  filters?: InvoiceFilters
): Promise<{ data: InvoiceModel[]; total: number; page: number; totalPages: number }> => {
  try {
    const params: any = { page, limit, ...filters };
    
    console.log('🔍 Fetching invoices with params:', params);
    const response = await api.get(INVOICE_API.GET_ALL, {
      params,
    });
    
    console.log('✅ Invoices response:', response.data);
    
    // Backend returns data array with complete invoice objects
    // Each invoice has: billTo (nested object), items (array with parsed numbers)
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching invoices:', error);
    throw error;
  }
};

/**
 * Get invoice by ID with full details
 * Returns complete invoice with billTo object, items array, and all fields
 */
export const getInvoice = async (invoiceId: string): Promise<InvoiceModel> => {
  try {
    console.log(`🔍 Fetching invoice with ID: ${invoiceId}`);
    const response = await api.get(`${INVOICE_API.GET_BY_ID}/${invoiceId}`);
    
    // Handle different response structures
    const invoice = response.data.data || response.data;
    console.log('✅ Invoice data received:', invoice);
    console.log('📋 Flat client fields from backend:');
    console.log('  - clientName:', invoice.clientName);
    console.log('  - clientEmail:', invoice.clientEmail);
    console.log('  - clientPhone:', invoice.clientPhone);
    console.log('  - clientAddress:', invoice.clientAddress);
    console.log('  - clientCity:', invoice.clientCity);
    console.log('  - clientState:', invoice.clientState);
    console.log('  - clientCountry:', invoice.clientCountry);
    console.log('  - clientGst:', invoice.clientGst);
    console.log('  - clientPan:', invoice.clientPan);
    console.log('📋 Nested billTo object:', invoice.billTo);
    if (invoice.billTo) {
      console.log('  - billTo.companyName:', invoice.billTo.companyName);
      console.log('  - billTo.name:', invoice.billTo.name);
      console.log('  - billTo.email:', invoice.billTo.email);
      console.log('  - billTo.phone:', invoice.billTo.phone);
      console.log('  - billTo.address:', invoice.billTo.address);
      console.log('  - billTo.city:', invoice.billTo.city);
      console.log('  - billTo.state:', invoice.billTo.state);
      console.log('  - billTo.country:', invoice.billTo.country);
      console.log('  - billTo.gstNumber:', invoice.billTo.gstNumber);
      console.log('  - billTo.panNumber:', invoice.billTo.panNumber);
    }
    console.log('📦 Invoice items:', invoice.items);
    
    return invoice as InvoiceModel;
  } catch (error) {
    console.error('❌ Error fetching invoice:', error);
    throw error;
  }
};

/**
 * Create new invoice
 */
export const createInvoice = async (invoice: Partial<InvoiceModel>): Promise<{ message: string; invoice: InvoiceModel }> => {
  try {
    console.log('📝 Creating invoice:', invoice);
    const response = await api.post(INVOICE_API.CREATE, invoice);
    console.log('✅ Invoice created:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error creating invoice:', error);
    throw error;
  }
};

/**
 * Update invoice
 */
export const updateInvoice = async (invoiceId: string, updates: Partial<InvoiceModel>): Promise<any> => {
  try {
    console.log(`📝 Updating invoice ${invoiceId}:`, updates);
    const response = await api.put(`${INVOICE_API.UPDATE}/${invoiceId}`, updates);
    console.log('✅ Invoice updated:', response.data);
    
    // Handle the corrected API response format
    if (response.data.success) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to update invoice');
  } catch (error) {
    console.error('❌ Error updating invoice:', error);
    throw error;
  }
};

/**
 * Delete invoice
 */
export const deleteInvoice = async (invoiceId: string): Promise<{ message: string }> => {
  try {
    console.log(`🗑️ Deleting invoice: ${invoiceId}`);
    const response = await api.delete(`${INVOICE_API.DELETE}/${invoiceId}`);
    console.log('✅ Invoice deleted');
    return response.data;
  } catch (error) {
    console.error('❌ Error deleting invoice:', error);
    throw error;
  }
};

/**
 * Duplicate invoice
 */
export const duplicateInvoice = async (invoiceId: string): Promise<InvoiceModel> => {
  try {
    console.log(`📋 Duplicating invoice: ${invoiceId}`);
    const response = await api.post(`${INVOICE_API.DUPLICATE}/${invoiceId}`, {});
    console.log('✅ Invoice duplicated:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error duplicating invoice:', error);
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
export const getClientDetails = async (clientName: string): Promise<Party> => {
  try {
    console.log(`🔍 Fetching client details for: ${clientName}`);
    const response = await api.get(`${INVOICE_API.CLIENT_DETAILS}/${encodeURIComponent(clientName)}`);
    console.log('✅ Client details:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching client details:', error);
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

/**
 * Get next invoice number preview
 */
export const getNextInvoiceNumber = async (): Promise<{
  nextInvoiceNumber: string;
  isCustom: boolean;
  userSettings: {
    prefix: string;
    startNumber: number;
  };
  currentCount: number;
}> => {
  try {
    console.log('🔢 Fetching next invoice number...');
    console.log('🔢 API base URL:', api.defaults.baseURL);
    console.log('🔢 Full URL will be:', `${api.defaults.baseURL}/api/invoices/next-number`);
    
    const response = await api.get('/api/invoices/next-number');
    console.log('✅ Next invoice number response:', response.data);
    console.log('✅ Response status:', response.status);
    console.log('✅ Response success:', response.data.success);
    console.log('✅ Response data:', response.data.data);
    
    // Handle the corrected API response format
    if (response.data.success) {
      console.log('✅ Returning data:', response.data.data);
      return response.data.data;
    }
    
    console.log('❌ API returned success: false');
    throw new Error(response.data.message || 'Failed to get next invoice number');
  } catch (error) {
    console.error('❌ Error fetching next invoice number:', error);
    console.error('❌ Error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};

/**
 * Get customer payment terms
 */
export const getCustomerPaymentTerms = async (customerId: string): Promise<{ paymentTerms: string }> => {
  try {
    console.log(`🔍 Fetching payment terms for customer: ${customerId}`);
    const response = await api.get(`/api/invoices/customer/${customerId}/payment-terms`);
    console.log('✅ Customer payment terms:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching customer payment terms:', error);
    throw error;
  }
};

/**
 * Calculate GST preview
 */
export const calculateGST = async (billingState: string, shippingState: string, totalTax: number): Promise<{ cgst: number; sgst: number; igst: number }> => {
  try {
    console.log('🧮 Calculating GST:', { billingState, shippingState, totalTax });
    const response = await api.post('/api/invoices/calculate-gst', {
      billingState,
      shippingState,
      totalTax
    });
    console.log('✅ GST calculation result:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error calculating GST:', error);
    throw error;
  }
};
