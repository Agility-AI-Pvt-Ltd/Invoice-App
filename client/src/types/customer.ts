// Enhanced Customer types based on backend implementation

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface FullCustomer {
  id: number;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  contactPerson?: string;
  
  // Address fields
  address?: string; // Legacy single address field
  billingAddress?: Address | string;
  shippingAddress?: Address | string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  
  // Tax & Legal
  gstNumber?: string;
  panNumber?: string;
  customerType?: 'regular' | 'business' | 'wholesale' | 'retail';
  
  // Payment & Currency
  currency?: string;
  paymentTerms?: 'DUE_ON_RECEIPT' | 'IMMEDIATE' | 'NET7' | 'NET15' | 'NET30' | 'NET45' | 'NET60' | 'NET90' | 'CUSTOM';
  customPaymentDays?: number;
  
  // Additional
  notes?: string;
  status?: 'active' | 'inactive';
  balance?: number;
  
  // Metadata
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

