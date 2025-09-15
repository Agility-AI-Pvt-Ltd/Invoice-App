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
    console.log("🔍 fetchCustomerByName API response:", res.data);
    
    // Handle the new API response format - try multiple possible structures
    const data = res?.data;
    if (!data) return null;
    
    // Try different response structures
    // 1. Check for nested data structure (response.data.data)
    if (data.data && Array.isArray(data.data) && data.data.length > 0) {
      console.log("✅ Found customer in data.data array:", data.data[0]);
      return data.data[0] as Customer;
    }
    
    // 2. Check if it's an array of customers (data.customers)
    if (data.customers && Array.isArray(data.customers) && data.customers.length > 0) {
      console.log("✅ Found customer in data.customers array:", data.customers[0]);
      return data.customers[0] as Customer;
    }
    
    // 3. Check if data itself is an array
    if (Array.isArray(data) && data.length > 0) {
      console.log("✅ Found customer in direct array:", data[0]);
      return data[0] as Customer;
    }
    
    // 4. Check if it's a single customer object
    if (data._id || data.id) {
      console.log("✅ Found single customer object:", data);
      return data as Customer;
    }
    
    console.log("❌ No customer found in response");
    return null;
  } catch (err) {
    console.error("❌ fetchCustomerByName error", err);
    return null;
  }
}

// New function to search for multiple customers (for dropdown suggestions)
export async function searchCustomers(searchTerm: string): Promise<Customer[]> {
  if (!searchTerm || searchTerm.trim().length < 2) return [];
  
  try {
    const res = await api.get(`/api/customers/search/${encodeURIComponent(searchTerm.trim())}`);
    console.log("🔍 searchCustomers API response:", res.data);
    
    const data = res?.data;
    if (!data) return [];
    
    // Try different response structures
    // 1. Check for nested data structure (response.data.data)
    if (data.data && Array.isArray(data.data)) {
      console.log("✅ Found customers in data.data array:", data.data.length);
      return data.data as Customer[];
    }
    
    // 2. Check if it's an array of customers (data.customers)
    if (data.customers && Array.isArray(data.customers)) {
      console.log("✅ Found customers in data.customers array:", data.customers.length);
      return data.customers as Customer[];
    }
    
    // 3. Check if data itself is an array
    if (Array.isArray(data)) {
      console.log("✅ Found customers in direct array:", data.length);
      return data as Customer[];
    }
    
    // 4. Check if it's a single customer object
    if (data._id || data.id) {
      console.log("✅ Found single customer, wrapping in array");
      return [data as Customer];
    }
    
    console.log("❌ No customers found in response");
    return [];
  } catch (err) {
    console.error("❌ searchCustomers error", err);
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

// Vendor search functionality
export type VendorLookup = {
  _id?: string;
  name?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  gstNumber?: string;
  pan?: string;
  isGstRegistered?: boolean;
  status?: string;
};

export async function searchVendors(searchTerm: string): Promise<VendorLookup[]> {
  if (!searchTerm || searchTerm.trim().length < 2) return [];
  
  try {
    const res = await api.get(`/api/vendors/search/${encodeURIComponent(searchTerm.trim())}`);
    const data = res?.data;
    if (!data) return [];
    
    // Handle both response formats
    if (data.vendors && Array.isArray(data.vendors)) {
      return data.vendors as VendorLookup[];
    } else if (data._id) {
      // Single vendor response, wrap in array
      return [data as VendorLookup];
    }
    
    return [];
  } catch (err) {
    console.error("searchVendors error", err);
    return [];
  }
}


