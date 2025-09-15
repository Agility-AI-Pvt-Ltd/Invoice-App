// client/src/services/api/salesReturn.ts

import api from "@/lib/api";
import type { SalesReturn, SalesReturnCreate, SalesReturnUpdate, SalesReturnFilters } from "@/types/salesReturn";

export const SALES_RETURN_API = {
  LIST: `/api/sales/returns`,
  CREATE: `/api/sales/returns`,
  UPDATE: (id: number) => `/api/sales/returns/${id}`,
  DELETE: (id: number) => `/api/sales/returns/${id}`,
  DETAIL: (id: number) => `/api/sales/returns/${id}`,
  EXPORT: `/api/sales/export`,
  IMPORT: `/api/sales/import`,
};

/**
 * Fetch all sales returns with optional filters
 */
export const fetchSalesReturns = async (filters?: SalesReturnFilters): Promise<SalesReturn[]> => {
  try {
    const params: Record<string, string> = {};
    if (filters?.search) params.search = filters.search;
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;
    if (filters?.state) params.state = filters.state;
    if (filters?.partyName) params.partyName = filters.partyName;

    const response = await api.get(SALES_RETURN_API.LIST, { params });
    return response.data || [];
  } catch (error) {
    console.error("Error fetching sales returns:", error);
    return [];
  }
};

/**
 * Get a specific sales return by ID
 */
export const getSalesReturn = async (id: number): Promise<SalesReturn | null> => {
  try {
    const response = await api.get(SALES_RETURN_API.DETAIL(id));
    return response.data;
  } catch (error) {
    console.error("Error fetching sales return:", error);
    return null;
  }
};

/**
 * Create a new sales return
 */
export const createSalesReturn = async (data: SalesReturnCreate): Promise<SalesReturn | null> => {
  try {
    const response = await api.post(SALES_RETURN_API.CREATE, data);
    return response.data;
  } catch (error) {
    console.error("Error creating sales return:", error);
    throw error;
  }
};

/**
 * Update an existing sales return
 */
export const updateSalesReturn = async (id: number, data: SalesReturnUpdate): Promise<SalesReturn | null> => {
  try {
    const response = await api.put(SALES_RETURN_API.UPDATE(id), data);
    return response.data;
  } catch (error) {
    console.error("Error updating sales return:", error);
    throw error;
  }
};

/**
 * Delete a sales return
 */
export const deleteSalesReturn = async (id: number): Promise<void> => {
  try {
    await api.delete(SALES_RETURN_API.DELETE(id));
  } catch (error) {
    console.error("Error deleting sales return:", error);
    throw error;
  }
};

/**
 * Export sales returns as CSV
 */
export const exportSalesReturns = async (filters?: SalesReturnFilters): Promise<Blob> => {
  try {
    const params: Record<string, string> = {};
    if (filters?.search) params.search = filters.search;
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;
    if (filters?.state) params.state = filters.state;
    if (filters?.partyName) params.partyName = filters.partyName;

    const response = await api.get(SALES_RETURN_API.EXPORT, { 
      params,
      responseType: "blob"
    });
    return response.data;
  } catch (error) {
    console.error("Error exporting sales returns:", error);
    throw error;
  }
};
