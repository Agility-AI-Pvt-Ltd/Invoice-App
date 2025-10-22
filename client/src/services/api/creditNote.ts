import api from '@/lib/api';

// API endpoints for credit notes
export const CREDIT_NOTE_API = {
  GET_ALL: '/api/credit-notes',
  GET_BY_ID: '/api/credit-notes',
  CREATE: '/api/credit-notes',
  UPDATE: '/api/credit-notes',
  DELETE: '/api/credit-notes',
};

// Types for credit notes
export interface CreditNoteItem {
  serialNo: number;
  itemName: string;
  hsnCode: string;
  quantity: number;
  unitPrice: number;
  gstPercentage: number;
  taxableValue: number;
  grossTotal: number;
}

export interface CreditNote {
  _id?: string;
  creditNoteNumber: string;
  creditNoteDate: string;
  againstInvoiceNumber: string;
  againstInvoiceDate: string;
  reason: string;
  customerName: string;
  businessName: string;
  address: string;
  contactNumber: string;
  isGstRegistered: boolean;
  gstNumber: string;
  items: CreditNoteItem[];
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

export interface CreditNoteFilters {
  searchTerm?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  customerName?: string;
  creditNoteNumber?: string;
  status?: string;
}

/**
 * Get all credit notes with filters and pagination
 */
export const getCreditNotes = async (
  page: number = 1,
  limit: number = 10,
  filters?: CreditNoteFilters
): Promise<{ data: CreditNote[]; total: number; page: number; totalPages: number }> => {
  try {
    const params: any = { page, limit, ...filters };
    
    console.log('🔍 Fetching credit notes with params:', params);
    const response = await api.get(CREDIT_NOTE_API.GET_ALL, {
      params,
    });
    
    console.log('✅ Credit notes response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching credit notes:', error);
    throw error;
  }
};

/**
 * Get credit note by ID
 */
export const getCreditNoteById = async (id: string): Promise<CreditNote> => {
  try {
    console.log('🔍 Fetching credit note by ID:', id);
    const response = await api.get(`${CREDIT_NOTE_API.GET_BY_ID}/${id}`);
    console.log('✅ Credit note response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching credit note:', error);
    throw error;
  }
};

/**
 * Create a new credit note
 */
export const createCreditNote = async (creditNoteData: CreditNote): Promise<CreditNote> => {
  try {
    console.log('🔍 Creating credit note:', creditNoteData);
    
    // Convert to FormData for file upload support
    const formData = new FormData();
    
    // Append all form fields
    Object.entries(creditNoteData).forEach(([key, value]) => {
      if (key === 'items') {
        formData.append(key, JSON.stringify(value));
      } else if (key === 'uploadedDocument' && value instanceof File) {
        formData.append(key, value);
      } else if (key !== 'uploadedDocument') {
        formData.append(key, String(value));
      }
    });

    const response = await api.post(CREDIT_NOTE_API.CREATE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('✅ Credit note created:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error creating credit note:', error);
    throw error;
  }
};

/**
 * Update an existing credit note
 */
export const updateCreditNote = async (id: string, creditNoteData: CreditNote): Promise<CreditNote> => {
  try {
    console.log('🔍 Updating credit note:', id, creditNoteData);
    
    // Convert to FormData for file upload support
    const formData = new FormData();
    
    // Append all form fields
    Object.entries(creditNoteData).forEach(([key, value]) => {
      if (key === 'items') {
        formData.append(key, JSON.stringify(value));
      } else if (key === 'uploadedDocument' && value instanceof File) {
        formData.append(key, value);
      } else if (key !== 'uploadedDocument') {
        formData.append(key, String(value));
      }
    });

    const response = await api.put(`${CREDIT_NOTE_API.UPDATE}/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('✅ Credit note updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error updating credit note:', error);
    throw error;
  }
};

/**
 * Delete a credit note
 */
export const deleteCreditNote = async (id: string): Promise<void> => {
  try {
    console.log('🔍 Deleting credit note:', id);
    await api.delete(`${CREDIT_NOTE_API.DELETE}/${id}`);
    console.log('✅ Credit note deleted');
  } catch (error) {
    console.error('❌ Error deleting credit note:', error);
    throw error;
  }
};

/**
 * Get credit note statistics
 */
export const getCreditNoteStats = async (): Promise<{
  totalCreditNotes: number;
  totalAmount: number;
  thisMonth: number;
  lastMonth: number;
}> => {
  try {
    console.log('🔍 Fetching credit note statistics');
    const response = await api.get(`${CREDIT_NOTE_API.GET_ALL}/stats`);
    console.log('✅ Credit note stats:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching credit note stats:', error);
    throw error;
  }
};
