// Enhanced Invoice Context Provider with Draft Management
// Provides persistent state across route changes and auto-save functionality

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { InvoiceModel } from '@/types/invoice';
import type { FullCustomer } from '@/types/customer';
import {
  saveDraft,
  updateDraft,
  getDraft,
  autoSaveDraft,
  cancelAutoSave,
  saveDraftToLocalStorage,
  getDraftFromLocalStorage,
  clearDraftFromLocalStorage,
} from '@/services/api/invoiceDraft';
import { getCustomerById } from '@/services/api/customer';
import { calculateTax } from '@/services/api/invoiceDraft';

// Default empty invoice
const getDefaultInvoice = (): InvoiceModel => ({
  invoiceNumber: `INV-${Date.now()}`,
  date: new Date().toISOString().slice(0, 10),
  dueDate: '',
  billFrom: {
    businessName: '',
    address: '',
    state: '',
    email: '',
    phone: '',
    gst: '',
  },
  billTo: {
    name: '',
    companyName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    gst: '',
    gstNumber: '',
    pan: '',
    panNumber: '',
  },
  shipTo: {},
  items: [
    {
      description: '',
      hsn: '',
      quantity: 1,
      unitPrice: 0,
      gst: 0,
      discount: 0,
      amount: 0,
    },
  ],
  notes: '',
  currency: 'INR',
  status: 'draft',
  subtotal: 0,
  cgst: 0,
  sgst: 0,
  igst: 0,
  total: 0,
  termsAndConditions: '',
});

interface InvoiceContextType {
  // Current invoice state
  invoice: InvoiceModel;
  setInvoice: React.Dispatch<React.SetStateAction<InvoiceModel>>;
  
  // Draft management
  draftId: string | null;
  setDraftId: (id: string | null) => void;
  isDirty: boolean;
  lastSaved: Date | null;
  
  // Actions
  loadCustomer: (customerId: number) => Promise<void>;
  recalcTotals: () => void;
  serverCalculateTax: () => Promise<void>;
  saveDraftManually: () => Promise<void>;
  loadDraft: (draftId: string) => Promise<void>;
  resetInvoice: () => void;
  
  // Auto-save control
  autoSaveEnabled: boolean;
  setAutoSaveEnabled: (enabled: boolean) => void;
  
  // Loading states
  loading: boolean;
  saving: boolean;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export const useInvoice = () => {
  const context = useContext(InvoiceContext);
  if (!context) {
    throw new Error('useInvoice must be used within InvoiceContextProvider');
  }
  return context;
};

interface Props {
  children: ReactNode;
}

export const InvoiceContextProvider: React.FC<Props> = ({ children }) => {
  const [invoice, setInvoice] = useState<InvoiceModel>(getDefaultInvoice());
  const [draftId, setDraftId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load customer data and auto-fill invoice fields
  const loadCustomer = useCallback(async (customerId: number) => {
    try {
      setLoading(true);
      console.log(`🔍 Loading customer data for ID: ${customerId}`);
      
      const customer: FullCustomer = await getCustomerById(customerId);
      
      setInvoice((prev) => ({
        ...prev,
        customerId,
        customer,
        billTo: {
          name: customer.name || '',
          companyName: customer.company || customer.companyName || '',
          email: customer.email || '',
          phone: customer.phone || '',
          address: typeof customer.billingAddress === 'string' 
            ? customer.billingAddress 
            : customer.address || '',
          city: customer.city || '', // ⚠️ Backend provides city
          state: customer.state || '', // ⚠️ Backend provides state
          zip: customer.zipCode || customer.zip || '', // ⚠️ Backend uses zipCode
          zipCode: customer.zipCode || '', // ⚠️ Backend uses zipCode
          country: customer.country || 'India',
          gst: customer.gstNumber || '',
          gstNumber: customer.gstNumber || '', // ⚠️ Backend uses gstNumber
          pan: customer.panNumber || '',
          panNumber: customer.panNumber || '', // ⚠️ Backend uses panNumber
        },
        shipTo: typeof customer.shippingAddress === 'object' 
          ? {
              address: customer.shippingAddress.street || '',
              city: customer.shippingAddress.city || '',
              state: customer.shippingAddress.state || '',
              zip: customer.shippingAddress.zip || '',
              country: customer.shippingAddress.country || '',
            }
          : prev.shipTo,
        currency: customer.currency || prev.currency || 'INR',
        paymentTerms: customer.paymentTerms || prev.paymentTerms,
        customPaymentDays: customer.customPaymentDays || prev.customPaymentDays,
        notes: customer.notes || prev.notes,
      }));
      
      console.log('✅ Customer data loaded and applied to invoice');
      setIsDirty(true);
    } catch (error) {
      console.error('❌ Error loading customer:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Client-side tax calculation (fallback)
  const recalcTotals = useCallback(() => {
    setInvoice((prev) => {
      const items = prev.items || [];
      let subtotal = 0;
      let totalGst = 0;

      items.forEach((item) => {
        const q = Number(item.quantity || 0);
        const up = Number(item.unitPrice || 0);
        const gst = Number(item.gst || 0);
        const disc = Number(item.discount || 0);
        const base = q * up;
        const gstAmt = (base * gst) / 100;
        subtotal += base - disc;
        totalGst += gstAmt;
      });

      const cgst = Number((totalGst / 2).toFixed(2));
      const sgst = Number((totalGst / 2).toFixed(2));
      const igst = 0;
      const total = Number((subtotal + totalGst + (prev.shipping || 0)).toFixed(2));

      return {
        ...prev,
        subtotal: Number(subtotal.toFixed(2)),
        cgst,
        sgst,
        igst,
        total,
      };
    });
    
    setIsDirty(true);
  }, []);

  // Server-side tax calculation
  const serverCalculateTax = useCallback(async () => {
    try {
      if (!invoice.billFrom?.state || !invoice.billTo?.state || !invoice.items?.length) {
        console.warn('⚠️ Missing required data for tax calculation');
        return;
      }

      setLoading(true);
      const response = await calculateTax({
        items: invoice.items,
        billFromState: invoice.billFrom.state,
        billToState: invoice.billTo.state,
        discount: invoice.discount || 0,
        shipping: invoice.shipping || 0,
      });

      if (response.success && response.data) {
        setInvoice((prev) => ({
          ...prev,
          subtotal: response.data.subtotal,
          cgst: response.data.cgst,
          sgst: response.data.sgst,
          igst: response.data.igst,
          total: response.data.total,
          taxBreakdown: response.data,
        }));
        console.log('✅ Server-side tax calculation applied');
      }
    } catch (error) {
      console.error('❌ Error calculating tax on server:', error);
      // Fallback to client-side calculation
      recalcTotals();
    } finally {
      setLoading(false);
    }
  }, [invoice, recalcTotals]);

  // Save draft manually
  const saveDraftManually = useCallback(async () => {
    try {
      setSaving(true);
      let result;
      
      if (draftId) {
        result = await updateDraft(draftId, invoice);
      } else {
        result = await saveDraft(invoice);
        if (result.draft?._id || result.data?._id) {
          setDraftId(result.draft?._id || result.data?._id || null);
        }
      }
      
      setLastSaved(new Date());
      setIsDirty(false);
      console.log('✅ Draft saved manually');
    } catch (error) {
      console.error('❌ Error saving draft:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  }, [draftId, invoice]);

  // Load existing draft
  const loadDraft = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const draft = await getDraft(id);
      setInvoice(draft);
      setDraftId(id);
      setIsDirty(false);
      setLastSaved(draft.updatedAt ? new Date(draft.updatedAt) : null);
      console.log('✅ Draft loaded');
    } catch (error) {
      console.error('❌ Error loading draft:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset to empty invoice
  const resetInvoice = useCallback(() => {
    setInvoice(getDefaultInvoice());
    setDraftId(null);
    setIsDirty(false);
    setLastSaved(null);
    clearDraftFromLocalStorage();
    console.log('🔄 Invoice reset');
  }, []);

  // Auto-save effect
  useEffect(() => {
    if (autoSaveEnabled && isDirty && invoice.items.length > 0) {
      console.log('💾 Triggering auto-save...');
      
      autoSaveDraft(
        draftId,
        invoice,
        (result) => {
          if (!draftId && (result.draft?._id || result.data?._id)) {
            setDraftId(result.draft?._id || result.data?._id || null);
          }
          setLastSaved(new Date());
          setIsDirty(false);
        },
        (error) => {
          console.error('Auto-save failed:', error);
        }
      );
    }

    return () => {
      cancelAutoSave();
    };
  }, [invoice, isDirty, autoSaveEnabled, draftId]);

  // Save to localStorage as backup
  useEffect(() => {
    if (isDirty) {
      saveDraftToLocalStorage(invoice);
    }
  }, [invoice, isDirty]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = getDraftFromLocalStorage();
    if (saved && saved.invoice) {
      console.log('📂 Restored invoice from localStorage');
      setInvoice(saved.invoice as InvoiceModel);
      setIsDirty(true);
    }
  }, []);

  const value: InvoiceContextType = {
    invoice,
    setInvoice,
    draftId,
    setDraftId,
    isDirty,
    lastSaved,
    loadCustomer,
    recalcTotals,
    serverCalculateTax,
    saveDraftManually,
    loadDraft,
    resetInvoice,
    autoSaveEnabled,
    setAutoSaveEnabled,
    loading,
    saving,
  };

  return <InvoiceContext.Provider value={value}>{children}</InvoiceContext.Provider>;
};

export default InvoiceContextProvider;

