// Enhanced Customer types based on backend implementation

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

// Complete customer interface matching backend response (all 19 fields)
export interface FullCustomer {
  // Primary ID
  id: number;
  _id?: string;
  
  // Basic Info (4 fields)
  name: string;
  email: string;
  phone?: string;
  company?: string;
  companyName?: string; // Alias for company
  
  // Address Fields (8 fields) - Backend uses zipCode, not zip
  address?: string; // Single line address
  city?: string;
  state?: string;
  zipCode?: string; // ⚠️ Backend uses zipCode
  zip?: string; // Legacy support
  country?: string;
  billingAddress?: Address | string; // Full billing address
  shippingAddress?: Address | string; // Full shipping address
  
  // Contact & Notes (2 fields)
  contactPerson?: string;
  notes?: string;
  
  // Tax & Legal (2 fields)
  gstNumber?: string;
  panNumber?: string;
  
  // Customer Settings (3 fields)
  customerType?: 'B2B' | 'B2C' | 'regular' | 'business' | 'wholesale' | 'retail';
  currency?: string;
  paymentTerms?: 'DUE_ON_RECEIPT' | 'IMMEDIATE' | 'NET7' | 'NET15' | 'NET30' | 'NET45' | 'NET60' | 'NET90' | 'CUSTOM';
  customPaymentDays?: number | null;
  
  // User Reference
  userId?: number;
  
  // Status & Balance (optional frontend fields)
  status?: 'active' | 'inactive';
  balance?: number;
  
  // Metadata (2 fields)
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerFormData extends Partial<FullCustomer> {}

export interface CustomerFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive';
  customerType?: string;
}

export interface CustomerResponse {
  data: FullCustomer[];
  pagination: {
    page: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}


