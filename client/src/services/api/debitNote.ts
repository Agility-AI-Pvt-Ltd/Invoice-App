import api from '@/lib/api';

// API endpoints for debit notes
export const DEBIT_NOTE_API = {
  GET_ALL: '/api/debit-notes',
  GET_BY_ID: '/api/debit-notes',
  CREATE: '/api/debit-notes',
  UPDATE: '/api/debit-notes',
  DELETE: '/api/debit-notes',
};

// Types for debit notes
export interface DebitNoteItem {
  serialNo: number;
  itemName: string;
  hsnCode: string;
  quantity: number;
  unitPrice: number;
  gstPercentage: number;
  taxableValue: number;
  grossTotal: number;
}

export interface DebitNote {
  _id?: string;
  debitNoteNumber: string;
  debitNoteDate: string;
  againstInvoiceNumber: string;
  againstInvoiceDate: string;
  reason: string;
  vendorName: string;
  businessName: string;
  address: string;
  contactNumber: string;
  isGstRegistered: boolean;
  gstNumber: string;
  items: DebitNoteItem[];
  termsAndConditions: string;
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  applyToNextInvoice: boolean;
  refund: boolean;
  remark: string;
  uploadedDocument?: File;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DebitNoteFilters {
  searchTerm?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  vendorName?: string;
  debitNoteNumber?: string;
  status?: string;
}

/**
 * Get all debit notes with filters and pagination
 */
export const getDebitNotes = async (
  page: number = 1,
  limit: number = 10,
  filters?: DebitNoteFilters
): Promise<{ data: DebitNote[]; total: number; page: number; totalPages: number }> => {
  try {
    const params: any = { page, limit, ...filters };
    
    console.log('🔍 Fetching debit notes with params:', params);
    const response = await api.get(DEBIT_NOTE_API.GET_ALL, {
      params,
    });
    
    console.log('✅ Debit notes response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching debit notes:', error);
    throw error;
  }
};

/**
 * Get debit note by ID
 */
export const getDebitNoteById = async (id: string): Promise<DebitNote> => {
  try {
    console.log('🔍 Fetching debit note by ID:', id);
    const response = await api.get(`${DEBIT_NOTE_API.GET_BY_ID}/${id}`);
    console.log('✅ Debit note response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching debit note:', error);
    throw error;
  }
};

/**
 * Create a new debit note
 */
export const createDebitNote = async (debitNoteData: DebitNote): Promise<DebitNote> => {
  try {
    console.log('🔍 Creating debit note:', debitNoteData);
    
    // Convert to FormData for file upload support
    const formData = new FormData();
    
    // Append all form fields
    Object.entries(debitNoteData).forEach(([key, value]) => {
      if (key === 'items') {
        formData.append(key, JSON.stringify(value));
      } else if (key === 'uploadedDocument' && value instanceof File) {
        formData.append(key, value);
      } else if (key !== 'uploadedDocument') {
        formData.append(key, String(value));
      }
    });

    const response = await api.post(DEBIT_NOTE_API.CREATE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('✅ Debit note created:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error creating debit note:', error);
    throw error;
  }
};

/**
 * Update an existing debit note
 */
export const updateDebitNote = async (id: string, debitNoteData: DebitNote): Promise<DebitNote> => {
  try {
    console.log('🔍 Updating debit note:', id, debitNoteData);
    
    // Convert to FormData for file upload support
    const formData = new FormData();
    
    // Append all form fields
    Object.entries(debitNoteData).forEach(([key, value]) => {
      if (key === 'items') {
        formData.append(key, JSON.stringify(value));
      } else if (key === 'uploadedDocument' && value instanceof File) {
        formData.append(key, value);
      } else if (key !== 'uploadedDocument') {
        formData.append(key, String(value));
      }
    });

    const response = await api.put(`${DEBIT_NOTE_API.UPDATE}/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('✅ Debit note updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error updating debit note:', error);
    throw error;
  }
};

/**
 * Delete a debit note
 */
export const deleteDebitNote = async (id: string): Promise<void> => {
  try {
    console.log('🔍 Deleting debit note:', id);
    await api.delete(`${DEBIT_NOTE_API.DELETE}/${id}`);
    console.log('✅ Debit note deleted');
  } catch (error) {
    console.error('❌ Error deleting debit note:', error);
    throw error;
  }
};

/**
 * Get debit note statistics
 */
export const getDebitNoteStats = async (): Promise<{
  totalDebitNotes: number;
  totalAmount: number;
  thisMonth: number;
  lastMonth: number;
}> => {
  try {
    console.log('🔍 Fetching debit note statistics');
    const response = await api.get(`${DEBIT_NOTE_API.GET_ALL}/stats`);
    console.log('✅ Debit note stats:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching debit note stats:', error);
    throw error;
  }
};
