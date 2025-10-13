import api from "@/lib/api";
import type { InventoryProduct, ServiceItem } from "@/types/inventory";

export const INVENTORY_API = {
    ITEMS: `/api/inventory/items`,
    SUMMARY: `/api/inventory/summary`,
    EXPORT: `/api/inventory/export`,
    IMPORT: `/api/inventory/import`,
    CATEGORIES: `/api/inventory/categories`,
    // Backend routes for auto-fill
    GET_ALL: `/api/inventory`, // GET all inventory items
    GET_BY_ID: `/api/inventory`, // GET /api/inventory/:id
    SERVICES: `/api/services`, // GET all services
};

// Types
export interface InventorySegment {
    label: string;
    value: number;
    color: string;
}

export interface InventoryStockDistribution {
    count: number;
    percentage: number;
    segments: InventorySegment[];
}

export interface InventorySummary {
    success: boolean;
    data: {
        totals: {
            allProducts: number;
            activeProducts: number;
            totalInventoryValue: number;
        };
        stockDistribution: {
            inStock: InventoryStockDistribution;
            outOfStock: InventoryStockDistribution;
            lowStock: InventoryStockDistribution;
        };
    };
}

/**
 * Fetch inventory summary
 */
export const getInventorySummary = async (): Promise<InventorySummary> => {
    try {
        const response = await api.get(`${INVENTORY_API.SUMMARY}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching inventory summary:', error);
        throw error;
    }
};




// Types
export interface InventoryItem {
    id: string;
    name: string;
    category?: string;
    description?: string;
    inStock: number;
    discount?: number;
    unit_price: number;
    hsn_code?: string;
    gst_rate?: number;
    user_id: string;
    inProgress?: boolean;
}

export interface InventoryPagination {
    total: number;
    perPage: number;
    currentPage: number;
    totalPages: number;
}

export interface InventoryItemsResponse {
    items: InventoryItem[];
    pagination: InventoryPagination;
}

export interface InventoryFilters {
    search?: string;
    category?: string;
    status?: "inStock" | "lowStock" | "outOfStock";
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

/**
 * Fetch inventory items
 * @param page Page number
 * @param limit Items per page
 * @param filters Optional filters
 */
export const getInventoryItems = async (
    page: number = 1,
    limit: number = 10,
    filters: InventoryFilters = {}
): Promise<InventoryItemsResponse> => {
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(filters.search ? { search: filters.search } : {}),
            ...(filters.category ? { category: filters.category } : {}),
            ...(filters.status ? { status: filters.status } : {}),
            ...(filters.sortBy ? { sortBy: filters.sortBy } : {}),
            ...(filters.sortOrder ? { sortOrder: filters.sortOrder } : {}),
        });

        const response = await api.get(
            `${INVENTORY_API.ITEMS}?${params.toString()}`
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching inventory items:", error);
        throw error;
    }
};

// ========== NEW BACKEND AUTO-FILL ROUTES ==========

/**
 * Get all inventory products (for invoice line item auto-fill)
 * Backend: GET /api/inventory
 * Returns: Complete product data with HSN, tax rates, pricing
 */
export const getAllInventoryProducts = async (
    page: number = 1,
    limit: number = 100
): Promise<{ success: boolean; data: InventoryProduct[] }> => {
    try {
        console.log('🔍 Fetching all inventory products for auto-fill');
        const response = await api.get(INVENTORY_API.GET_ALL, {
            params: { page, limit }
        });
        console.log('✅ Inventory products received:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error fetching inventory products:', error);
        throw error;
    }
};

/**
 * Get single inventory product by ID (for edit form auto-fill)
 * Backend: GET /api/inventory/:id
 * Returns: Complete product with all 11 fields (name, sku, HSN, tax, price, etc.)
 */
export const getInventoryProductById = async (id: number): Promise<InventoryProduct> => {
    try {
        console.log(`🔍 Fetching inventory product ID: ${id}`);
        const response = await api.get(`${INVENTORY_API.GET_BY_ID}/${id}`);
        const product = response.data.data || response.data;
        console.log('✅ Inventory product received:', product);
        return product as InventoryProduct;
    } catch (error) {
        console.error('❌ Error fetching inventory product:', error);
        throw error;
    }
};

/**
 * Get all services (for invoice line item auto-fill)
 * Backend: GET /api/services
 * Returns: Complete service data with SAC codes, pricing, duration
 */
export const getAllServices = async (): Promise<{ success: boolean; data: ServiceItem[] }> => {
    try {
        console.log('🔍 Fetching all services for auto-fill');
        const response = await api.get(INVENTORY_API.SERVICES);
        console.log('✅ Services received:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error fetching services:', error);
        throw error;
    }
};

/**
 * Get inventory item for invoice editing (with all fields)
 * Backend: GET /api/inventory/items/:item_id/for-invoice
 * Returns: Complete item data with all fields for auto-fill
 */
export const getInventoryItemForInvoice = async (itemId: string | number): Promise<{
  success: boolean;
  data: {
    id: number;
    name: string;
    description?: string;
    sku?: string;
    category?: string;
    subCategory?: string;
    brandName?: string;
    unitPrice: number;
    quantity: number;
    hsnCode?: string;
    sacCode?: string;
    defaultTaxRate?: number;
    defaultDiscount?: number;
    taxCategory?: 'GOODS' | 'SERVICES';
    isActive?: boolean;
  };
}> => {
  try {
    console.log(`🔍 Fetching inventory item ${itemId} for invoice editing`);
    const response = await api.get(`/api/inventory/items/${itemId}/for-invoice`);
    console.log('✅ Inventory item for invoice received:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching inventory item for invoice:', error);
    throw error;
  }
};

/**
 * Calculate GST and discount for invoice items
 * Backend: POST /api/inventory/calculate-gst-discount
 * Returns: Calculated GST breakdown and totals
 */
export const calculateGstAndDiscount = async (data: {
  items: Array<{
    id?: number;
    inventoryItemId?: number;
    description: string;
    quantity: number;
    unitPrice: number;
    gstRate?: number;
    discount?: number;
  }>;
  billingState: string;
  shippingState: string;
}): Promise<{
  success: boolean;
  data: {
    items: Array<{
      id?: number;
      inventoryItemId?: number;
      description: string;
      quantity: number;
      unitPrice: number;
      gstRate: number;
      discount: number;
      taxableAmount: number;
      cgst: number;
      sgst: number;
      igst: number;
      total: number;
    }>;
    totals: {
      subtotal: number;
      cgst: number;
      sgst: number;
      igst: number;
      totalTax: number;
      taxType: 'CGST+SGST' | 'IGST';
      total: number;
    };
  };
}> => {
  try {
    console.log('🔍 Calculating GST and discount for items:', data);
    const response = await api.post('/api/inventory/calculate-gst-discount', data);
    console.log('✅ GST and discount calculation result:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error calculating GST and discount:', error);
    throw error;
  }
};

/**
 * Update inventory stock after invoice creation
 * Backend: PUT /api/inventory/items/:item_id/stock
 * Returns: Updated stock information
 */
export const updateInventoryStock = async (itemId: string | number, quantityUsed: number): Promise<{
  success: boolean;
  data: {
    id: number;
    name: string;
    quantity: number;
    updatedStock: number;
  };
}> => {
  try {
    console.log(`🔍 Updating stock for item ${itemId}, quantity used: ${quantityUsed}`);
    const response = await api.put(`/api/inventory/items/${itemId}/stock`, {
      quantityUsed
    });
    console.log('✅ Inventory stock updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error updating inventory stock:', error);
    throw error;
  }
};

/**
 * Get inventory item with enhanced data for auto-fill
 * Backend: GET /api/inventory/items/:item_id/for-invoice
 * Returns: Enhanced item data with all fields for auto-fill
 */
export const getInventoryItemForAutoFill = async (itemId: string | number): Promise<{
  id: number;
  name: string;
  description?: string;
  sku?: string;
  category?: string;
  subCategory?: string;
  brandName?: string;
  unitPrice: number;
  quantity: number;
  hsnCode?: string;
  sacCode?: string;
  defaultTaxRate?: number;
  defaultDiscount?: number;
  taxCategory?: 'GOODS' | 'SERVICES';
  isActive?: boolean;
}> => {
  try {
    console.log(`🔍 Fetching inventory item ${itemId} for auto-fill`);
    const response = await api.get(`/api/inventory/items/${itemId}/for-invoice`);
    const itemData = response.data.data || response.data;
    console.log('✅ Inventory item for auto-fill received:', itemData);
    return itemData;
  } catch (error) {
    console.error('❌ Error fetching inventory item for auto-fill:', error);
    throw error;
  }
};
