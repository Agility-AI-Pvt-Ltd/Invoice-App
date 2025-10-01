// Enhanced Invoice types based on backend implementation

import type { FullCustomer } from './customer';

export type PaymentTerms = 'DUE_ON_RECEIPT' | 'IMMEDIATE' | 'NET7' | 'NET15' | 'NET30' | 'NET45' | 'NET60' | 'NET90' | 'CUSTOM';

export type TaxCategory = 'GOODS' | 'SERVICES';

export interface InvoiceItem {
  id?: number;
  description: string;
  hsn?: string; // HSN for goods
  sac?: string; // SAC for services
  taxCategory?: TaxCategory;
  quantity: number;
  unitPrice: number;
  gstRate?: number; // Tax rate percentage (backend uses gstRate)
  gst?: number; // Alias for gstRate (for backward compatibility)
  discount?: number;
  taxableAmount?: number; // Calculated by backend
  igst?: number; // Inter-state GST
  cgst?: number; // Central GST
  sgst?: number; // State GST
  amount?: number; // Total amount (for backward compatibility)
  total?: number; // Total amount (backend uses total)
  // From inventory
  itemId?: number;
  invoiceId?: number;
}

export interface Party {
  businessName?: string;
  companyName?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  zipCode?: string; // Backend uses zipCode
  country?: string;
  gst?: string;
  gstNumber?: string; // Backend uses gstNumber
  gstin?: string;
  pan?: string;
  panNumber?: string; // Backend uses panNumber
}

export interface TaxBreakdown {
  subtotal: number;
  discount: number;
  cgst: number;
  sgst: number;
  igst: number;
  shipping?: number;
  total: number;
  // Server-calculated values
  taxableAmount?: number;
  totalTax?: number;
}

export interface InvoiceModel {
  _id?: string;
  id?: number;
  number?: string; // Backend uses 'number'
  invoiceNumber?: string; // Alias for 'number'
  
  // Dates
  date?: string;
  issueDate?: string; // Backend uses issueDate
  dueDate?: string;
  
  // Amount
  amount?: number; // Total invoice amount
  description?: string;
  
  // Flat client fields (from backend)
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  clientCity?: string;
  clientState?: string;
  clientCountry?: string;
  clientGst?: string;
  clientPan?: string;
  
  // Nested billTo object (backend provides this)
  billTo?: Party;
  
  // Ship to (optional)
  billFrom?: Party;
  shipTo?: Party;
  
  // Customer reference
  customerId?: number;
  customer?: FullCustomer;
  
  // Items (backend provides two versions)
  items: InvoiceItem[]; // Parsed numbers
  invoice_items?: InvoiceItem[]; // Original DB format (strings)
  
  // Payment & Terms
  paymentTerms?: PaymentTerms | string;
  paymentTermsDays?: number; // Backend uses paymentTermsDays
  customPaymentDays?: number;
  currency?: string;
  
  // Metadata
  salesperson?: string;
  salesChannel?: string;
  notes?: string;
  termsAndConditions?: string;
  
  // Status
  status?: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED' | string;
  
  // Financials (server-calculated)
  subtotal?: number;
  totalTax?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  discount?: number;
  shipping?: number;
  roundOff?: number;
  total?: number;
  
  // Draft-specific
  isDraft?: boolean;
  draftSessionId?: string;
  billingNumber?: string | null;
  
  // Server-side tax calculation results
  taxBreakdown?: TaxBreakdown;
  
  // Bank details (from business profile)
  bankDetails?: {
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    ifsc?: string;
    upi?: string;
  };
  
  // User reference
  userId?: number;
  user?: string;
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

// Draft-specific interface
export interface InvoiceDraft extends InvoiceModel {
  draftId?: string;
  lastSaved?: string;
  autoSaved?: boolean;
}

// API Response types
export interface InvoiceResponse {
  success: boolean;
  message: string;
  invoice?: InvoiceModel;
  data?: InvoiceModel;
}

export interface DraftResponse {
  success: boolean;
  message: string;
  draft?: InvoiceDraft;
  data?: InvoiceDraft;
}

export interface TaxCalculationRequest {
  items: InvoiceItem[];
  billFromState: string;
  billToState: string;
  discount?: number;
  shipping?: number;
}

export interface TaxCalculationResponse {
  success: boolean;
  data: TaxBreakdown;
}

