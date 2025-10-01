// Invoice Draft API Service
// Handles saving, retrieving, updating, and submitting invoice drafts

import api from '@/lib/api';
import type { InvoiceModel, InvoiceDraft, DraftResponse, TaxCalculationRequest, TaxCalculationResponse } from '@/types/invoice';

const DRAFT_API = {
  SAVE: '/api/invoices/draft',
  GET: (id: string) => `/api/invoices/draft/${id}`,
  UPDATE: (id: string) => `/api/invoices/draft/${id}`,
  DELETE: (id: string) => `/api/invoices/draft/${id}`,
  SUBMIT: (id: string) => `/api/invoices/${id}/submit`,
  CALCULATE_TAX: '/api/invoices/calculate-tax',
  LIST_DRAFTS: '/api/invoices/drafts',
};

/**
 * Save a new invoice draft
 */
export const saveDraft = async (invoice: Partial<InvoiceModel>): Promise<DraftResponse> => {
  try {
    console.log('💾 Saving invoice draft:', invoice);
    const response = await api.post(DRAFT_API.SAVE, invoice);
    console.log('✅ Draft saved:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error saving draft:', error);
    throw error;
  }
};

/**
 * Get a draft by ID
 */
export const getDraft = async (draftId: string): Promise<InvoiceDraft> => {
  try {
    console.log(`🔍 Fetching draft: ${draftId}`);
    const response = await api.get(DRAFT_API.GET(draftId));
    const draft = response.data.data || response.data.draft || response.data;
    console.log('✅ Draft retrieved:', draft);
    return draft as InvoiceDraft;
  } catch (error) {
    console.error('❌ Error fetching draft:', error);
    throw error;
  }
};

/**
 * Update an existing draft
 */
export const updateDraft = async (draftId: string, updates: Partial<InvoiceModel>): Promise<DraftResponse> => {
  try {
    console.log(`📝 Updating draft ${draftId}:`, updates);
    const response = await api.patch(DRAFT_API.UPDATE(draftId), updates);
    console.log('✅ Draft updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error updating draft:', error);
    throw error;
  }
};

/**
 * Delete a draft
 */
export const deleteDraft = async (draftId: string): Promise<void> => {
  try {
    console.log(`🗑️ Deleting draft: ${draftId}`);
    await api.delete(DRAFT_API.DELETE(draftId));
    console.log('✅ Draft deleted');
  } catch (error) {
    console.error('❌ Error deleting draft:', error);
    throw error;
  }
};

/**
 * Submit a draft as a final invoice
 */
export const submitDraft = async (draftId: string): Promise<{ success: boolean; invoice: InvoiceModel }> => {
  try {
    console.log(`📤 Submitting draft as invoice: ${draftId}`);
    const response = await api.post(DRAFT_API.SUBMIT(draftId));
    console.log('✅ Draft submitted as invoice:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error submitting draft:', error);
    throw error;
  }
};

/**
 * Calculate tax breakdown on the server
 */
export const calculateTax = async (request: TaxCalculationRequest): Promise<TaxCalculationResponse> => {
  try {
    console.log('🧮 Calculating taxes:', request);
    const response = await api.post(DRAFT_API.CALCULATE_TAX, request);
    console.log('✅ Tax calculation result:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error calculating tax:', error);
    throw error;
  }
};

/**
 * List all drafts for the current user with pagination
 */
export const listDrafts = async (
  page: number = 1,
  limit: number = 10
): Promise<{ data: InvoiceDraft[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> => {
  try {
    console.log(`📋 Fetching drafts (page: ${page}, limit: ${limit})`);
    const response = await api.get(DRAFT_API.LIST_DRAFTS, {
      params: { page, limit }
    });
    
    // Handle different response structures
    if (response.data.data && response.data.pagination) {
      console.log('✅ Drafts retrieved with pagination:', response.data);
      return response.data;
    }
    
    // Fallback: if direct array, create pagination
    const drafts = response.data.data || response.data.drafts || response.data;
    const draftsArray = Array.isArray(drafts) ? drafts : [];
    console.log('✅ Drafts retrieved (fallback):', draftsArray);
    
    return {
      data: draftsArray,
      pagination: {
        page,
        limit,
        total: draftsArray.length,
        totalPages: Math.ceil(draftsArray.length / limit)
      }
    };
  } catch (error) {
    console.error('❌ Error listing drafts:', error);
    throw error;
  }
};

/**
 * Auto-save functionality with debouncing
 * Returns a function that can be called to trigger auto-save
 */
let autoSaveTimeout: NodeJS.Timeout | null = null;

export const autoSaveDraft = (
  draftId: string | null,
  invoice: Partial<InvoiceModel>,
  onSuccess?: (draft: DraftResponse) => void,
  onError?: (error: any) => void,
  debounceMs: number = 2000
) => {
  // Clear existing timeout
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
  }

  // Set new timeout
  autoSaveTimeout = setTimeout(async () => {
    try {
      let result: DraftResponse;
      
      if (draftId) {
        // Update existing draft
        result = await updateDraft(draftId, invoice);
      } else {
        // Create new draft
        result = await saveDraft(invoice);
      }
      
      console.log('💾 Auto-save successful');
      onSuccess?.(result);
    } catch (error) {
      console.error('❌ Auto-save failed:', error);
      onError?.(error);
    }
  }, debounceMs);
};

/**
 * Cancel any pending auto-save
 */
export const cancelAutoSave = () => {
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = null;
  }
};

/**
 * Local storage helpers for draft persistence
 */
const DRAFT_STORAGE_KEY = 'invoice_draft_temp';

export const saveDraftToLocalStorage = (invoice: Partial<InvoiceModel>) => {
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({
      invoice,
      savedAt: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Failed to save draft to localStorage:', error);
  }
};

export const getDraftFromLocalStorage = (): { invoice: Partial<InvoiceModel>; savedAt: string } | null => {
  try {
    const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Failed to load draft from localStorage:', error);
    return null;
  }
};

export const clearDraftFromLocalStorage = () => {
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear draft from localStorage:', error);
  }
};

