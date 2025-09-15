import api from '@/lib/api';

// Types
export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  company?: string;
  gstNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerResponse {
  data: Customer[];
  pagination: {
    page: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface CustomerFilters {
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * Get all customers with pagination
 */
export const getCustomers = async (
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<CustomerResponse> => {
  try {
    const params: any = { page, limit };
    if (search) params.search = search;

    const response = await api.get('/api/customers', {
      params,
    });
    return response.data.data; // Extract data from {success: true, data: {...}}
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

/**
 * Get customer by ID
 */
export const getCustomerById = async (id: number): Promise<Customer> => {
  try {
    const response = await api.get(`/api/customers/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching customer:', error);
    throw error;
  }
};

/**
 * Create new customer
 */
export const createCustomer = async (customerData: Partial<Customer>): Promise<Customer> => {
  try {
    const response = await api.post('/api/customers', customerData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

/**
 * Update customer
 */
export const updateCustomer = async (id: number, customerData: Partial<Customer>): Promise<Customer> => {
  try {
    const response = await api.put(`/api/customers/${id}`, customerData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
};

/**
 * Delete customer
 */
export const deleteCustomer = async (id: number): Promise<void> => {
  try {
    await api.delete(`/api/customers/${id}`);
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
};

/**
 * Search customers by name
 */
export const searchCustomers = async (name: string): Promise<Customer[]> => {
  try {
    const response = await api.get(`/api/customers/search/${encodeURIComponent(name)}`);
    console.log("🔍 customer.ts searchCustomers API response:", response.data);
    
    const data = response.data;
    if (!data) return [];
    
    // Try different response structures to match backend
    // 1. Check for nested data structure (response.data.data)
    if (data.data && Array.isArray(data.data)) {
      console.log("✅ Found customers in data.data array:", data.data.length);
      return data.data;
    }
    
    // 2. Check if it's an array of customers (data.customers)
    if (data.customers && Array.isArray(data.customers)) {
      console.log("✅ Found customers in data.customers array:", data.customers.length);
      return data.customers;
    }
    
    // 3. Check if data itself is an array
    if (Array.isArray(data)) {
      console.log("✅ Found customers in direct array:", data.length);
      return data;
    }
    
    // 4. Check if it's a single customer object
    if (data._id || data.id) {
      console.log("✅ Found single customer, wrapping in array");
      return [data];
    }
    
    console.log("❌ No customers found in response");
    return [];
  } catch (error) {
    console.error('❌ Error searching customers:', error);
    throw error;
  }
};
