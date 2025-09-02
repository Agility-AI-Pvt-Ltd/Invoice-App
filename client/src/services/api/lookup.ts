import api from "@/lib/api";

export type Customer = {
  _id?: string;
  customerType?: string;
  fullName?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  state?: string;
  gst?: string;
  pan?: string;
  companyName?: string;
  website?: string;
  billingAddress?: string;
  billingCity?: string;
  billingState?: string;
  billingZip?: string;
  billingCountry?: string;
  billingAddressLine1?: string;
  billingAddressLine2?: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingZip?: string;
  shippingCountry?: string;
  shippingAddressLine1?: string;
  shippingAddressLine2?: string;
  gstRegistered?: string;
  gstNumber?: string;
  supplyPlace?: string;
  currency?: string;
  paymentTerms?: string;
  status?: string;
  balance?: number;
};

export async function fetchCustomerByName(name: string): Promise<Customer | null> {
  if (!name || name.trim().length === 0) return null;
  try {
    const res = await api.get(`/api/customers/search/${encodeURIComponent(name.trim())}`);
    // Handle the new API response format
    const data = res?.data;
    if (!data) return null;
    
    // Check if it's an array of customers or single customer
    if (data.customers && Array.isArray(data.customers) && data.customers.length > 0) {
      // Return the first customer from the array
      return data.customers[0] as Customer;
    } else if (data._id) {
      // Single customer response
      return data as Customer;
    }
    
    return null;
  } catch (err) {
    console.error("fetchCustomerByName error", err);
    return null;
  }
}

// New function to search for multiple customers (for dropdown suggestions)
export async function searchCustomers(searchTerm: string): Promise<Customer[]> {
  if (!searchTerm || searchTerm.trim().length < 2) return [];
  
  try {
    const res = await api.get(`/api/customers/search/${encodeURIComponent(searchTerm.trim())}`);
    const data = res?.data;
    if (!data) return [];
    
    // Handle both response formats
    if (data.customers && Array.isArray(data.customers)) {
      return data.customers as Customer[];
    } else if (data._id) {
      // Single customer response, wrap in array
      return [data as Customer];
    }
    
    return [];
  } catch (err) {
    console.error("searchCustomers error", err);
    return [];
  }
}

export type InventoryLookup = {
  _id?: string;
  name?: string;
  description?: string;
  hsn_code?: string;
  hsn?: string;
  unit_price?: number;
  price?: number;
  gst_rate?: number;
  gst?: number;
  discount?: number;
  category?: string;
  brand?: string;
  model?: string;
  specifications?: string;
  unit?: string;
  min_stock?: number;
  current_stock?: number;
  supplier?: string;
  cost_price?: number;
  selling_price?: number;
  tax_rate?: number;
  status?: string;
};

export async function fetchInventoryByCode(code: string): Promise<InventoryLookup | null> {
  if (!code || code.trim().length === 0) return null;
  try {
    const res = await api.get(`/api/inventory/${encodeURIComponent(code.trim())}`);
    const data = res?.data?.data ?? res?.data ?? null;
    if (!data) return null;
    return data as InventoryLookup;
  } catch (err) {
    console.error("fetchInventoryByCode error", err);
    return null;
  }
}

// New function to search for multiple inventory items (for dropdown suggestions)
export async function searchInventory(searchTerm: string): Promise<InventoryLookup[]> {
  if (!searchTerm || searchTerm.trim().length < 2) return [];
  
  try {
    const res = await api.get(`/api/inventory/${encodeURIComponent(searchTerm.trim())}`);
    const data = res?.data;
    if (!data) return [];
    
    // Handle both response formats
    if (data.inventory && Array.isArray(data.inventory)) {
      return data.inventory as InventoryLookup[];
    } else if (data._id) {
      // Single inventory item response, wrap in array
      return [data as InventoryLookup];
    }
    
    return [];
  } catch (err) {
    console.error("searchInventory error", err);
    return [];
  }
}


