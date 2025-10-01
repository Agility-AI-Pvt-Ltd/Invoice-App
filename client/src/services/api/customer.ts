import api from '@/lib/api';
import type { FullCustomer, CustomerResponse, CustomerFilters, CustomerFormData } from '@/types/customer';

// Re-export types for backward compatibility
export type { FullCustomer as Customer, CustomerResponse, CustomerFilters, CustomerFormData };
export type { FullCustomer, CustomerFormData };

// Legacy Customer type for backward compatibility
export interface LegacyCustomer {
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

    console.log("🔍 getCustomers API call with params:", params);

    const response = await api.get('/api/customers', {
      params,
    });
    
    console.log("🔍 getCustomers raw response:", response.data);
    
    // Handle different response structures from backend
    const responseData = response.data;
    
    if (responseData.success && responseData.data) {
      console.log("✅ Found customers in response.data.data structure");
      return responseData.data; // {data: [...], pagination: {...}}
    }
    
    // Fallback: if direct data array
    if (Array.isArray(responseData.data)) {
      console.log("✅ Found customers in direct data array");
      return {
        data: responseData.data,
        pagination: {
          page: page,
          totalPages: Math.ceil(responseData.data.length / limit),
          totalItems: responseData.data.length,
          itemsPerPage: limit
        }
      };
    }
    
    // Fallback: if direct array
    if (Array.isArray(responseData)) {
      console.log("✅ Found customers in direct array");
      return {
        data: responseData,
        pagination: {
          page: page,
          totalPages: Math.ceil(responseData.length / limit),
          totalItems: responseData.length,
          itemsPerPage: limit
        }
      };
    }
    
    console.log("❌ No customers found in response");
    return {
      data: [],
      pagination: {
        page: page,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: limit
      }
    };
  } catch (error) {
    console.error('❌ Error fetching customers:', error);
    throw error;
  }
};

/**
 * Get customer by ID with full details
 * Includes billing/shipping addresses, payment terms, currency, etc.
 */
export const getCustomerById = async (id: number): Promise<FullCustomer> => {
  try {
    console.log(`🔍 Fetching full customer data for ID: ${id}`);
    const response = await api.get(`/api/customers/${id}`);
    
    const customer = response.data.data || response.data;
    console.log('✅ Full customer data received:', customer);
    
    return customer as FullCustomer;
  } catch (error) {
    console.error('❌ Error fetching customer by ID:', error);
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
